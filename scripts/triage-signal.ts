/**
 * Ranks open issues and PRs by a synthesized engagement signal.
 *
 *   pnpm dev scripts/triage-signal.ts
 *   pnpm dev scripts/triage-signal.ts --repo colinhacks/zod --top 40
 *
 * Auth comes from the `gh` CLI (`gh auth token`).
 */

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

/* -------------------------------------------------------------------------- */
/* config                                                                     */
/* -------------------------------------------------------------------------- */

interface Args {
  repo: string;
  top: number;
  outDir: string;
  page: number;
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  return {
    repo: get("--repo") ?? "colinhacks/zod",
    top: Number(get("--top") ?? 40),
    outDir: get("--out") ?? ".triage",
    page: Number(get("--page") ?? 50),
  };
}

/**
 * Reaction weights. A reaction is one-per-person, so it is the cleanest
 * "this affects me too" vote available. Positive reactions carry demand;
 * the rest are ambiguous and count for much less.
 */
const UPVOTE_REACTIONS = new Set(["THUMBS_UP", "HEART", "ROCKET", "HOORAY"]);

/** Channel weights, applied to log-compressed counts so no one channel runs away. */
const W = {
  upvote: 14,
  softReaction: 5,
  voice: 9,
  comment: 5,
} as const;

/** Multipliers applied after the engagement score is assembled. */
const PENALTY = {
  draft: 0.5,
  stale: 0.7,
  "needs-info": 0.6,
  "working-as-intended": 0.3,
  duplicate: 0.25,
  dependencies: 0.2,
  bot: 0.15,
} as const;

/** Flat bonus for confirmed security content — large enough to outrank any thread. */
const SECURITY_BONUS = 120;
const SECURITY_MAYBE_BONUS = 15;

/** Staleness decay on `updatedAt`: 1.0 fresh, ~0.68 at one year, floored so old pain still surfaces. */
const DECAY_FLOOR = 0.35;
const DECAY_HALF_LIFE_MONTHS = 12;

/* -------------------------------------------------------------------------- */
/* vulnerability detection                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Unambiguous markers. These name a security concept that has no innocent use,
 * so a hit anywhere — title or body — promotes the item.
 */
const VULN_STRONG: [RegExp, string][] = [
  [/\bCVE-\d{4}-\d{4,}/i, "CVE reference"],
  [/\bGHSA-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}\b/i, "GHSA reference"],
  [/\bCWE-\d+\b/i, "CWE reference"],
  [/prototype\s+pollut/i, "prototype pollution"],
  [/\bprototype\s+(chain\s+)?(poison|injection|manipulat)/i, "prototype manipulation"],
  [/regular\s+expression\s+denial\s+of\s+service/i, "ReDoS"],
  [/catastrophic\s+backtrack/i, "catastrophic backtracking"],
  [/exponential\s+backtrack/i, "catastrophic backtracking"],
  [/\b(XSS|cross[\s-]site\s+scripting)\b/i, "XSS"],
  [/\bRCE\b|remote\s+code\s+execution/i, "RCE"],
  [/arbitrary\s+code\s+execution/i, "arbitrary code execution"],
  [/security\s+(vulnerabilit|advisor|issue|flaw|report)/i, "security report"],
  [/\bsupply[\s-]chain\b/i, "supply chain"],
];

/**
 * Real security terms that also appear incidentally — a PR body noting "1 flaky
 * timeout in the redos checker" is not a ReDoS report. These count only in the
 * title, or when the body carries two different ones.
 */
const VULN_CONTEXTUAL: [RegExp, string][] = [
  [/\b__proto__\b/, "__proto__"],
  [/\bObject\.prototype\b/, "Object.prototype"],
  [/\bReDoS\b/i, "ReDoS"],
  [/\bdenial[\s-]of[\s-]service\b/i, "denial of service"],
  [/\bvulnerabilit(y|ies)\b/i, "vulnerability"],
];

/** Weaker markers — flagged for a human look but not promoted. */
const VULN_WEAK: [RegExp, string][] = [
  [/\bsanitiz(e|ing|ation)\b/i, "sanitization"],
  [/\bexploit(able)?\b/i, "exploit"],
  [/\buntrusted\s+(input|data|user)/i, "untrusted input"],
  [/\bstack\s+overflow\b/i, "stack overflow"],
  [/\bRangeError\b/, "RangeError"],
  [/\bmalicious\b/i, "malicious"],
];

/** Label names that mean "security" regardless of content. */
const VULN_LABEL = /^(security|vulnerability|vuln|cve|advisory)$/i;

interface VulnVerdict {
  level: "confirmed" | "possible" | "none";
  reasons: string[];
}

function detectVuln(item: Item): VulnVerdict {
  const confirmed: string[] = [];
  for (const l of item.labels) {
    if (VULN_LABEL.test(l)) confirmed.push(`label:${l}`);
  }
  // Only the leading slice of the body is scanned. Full bodies drag in stack traces and quoted source that trip every keyword.
  const title = item.title;
  const body = item.body.slice(0, 3000);
  const hay = `${title}\n${body}`;

  for (const [re, name] of VULN_STRONG) {
    if (re.test(hay)) confirmed.push(name);
  }

  const inTitle: string[] = [];
  const inBody: string[] = [];
  for (const [re, name] of VULN_CONTEXTUAL) {
    if (re.test(title)) inTitle.push(name);
    else if (re.test(body)) inBody.push(name);
  }
  confirmed.push(...inTitle);
  // Two different contextual terms in one body is a report, not a passing mention.
  if (inBody.length >= 2) confirmed.push(...inBody);

  if (confirmed.length) return { level: "confirmed", reasons: dedupe(confirmed) };

  const weak = [...inBody];
  for (const [re, name] of VULN_WEAK) {
    if (re.test(hay)) weak.push(name);
  }
  if (weak.length) return { level: "possible", reasons: dedupe(weak) };
  return { level: "none", reasons: [] };
}

function dedupe(xs: string[]): string[] {
  return [...new Set(xs)];
}

/* -------------------------------------------------------------------------- */
/* fetch                                                                      */
/* -------------------------------------------------------------------------- */

interface Item {
  kind: "issue" | "pr";
  number: number;
  title: string;
  url: string;
  body: string;
  author: string;
  authorIsBot: boolean;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  comments: number;
  participants: number;
  upvotes: number;
  softReactions: number;
  totalReactions: number;
  // PR-only
  isDraft?: boolean;
  additions?: number;
  deletions?: number;
  changedFiles?: number;
  reviews?: number;
  reviewDecision?: string | null;
  mergeable?: string;
}

interface Scored extends Item {
  engagement: number;
  decay: number;
  penalty: number;
  vuln: VulnVerdict;
  /** Engagement alone, before the security bonus. */
  baseScore: number;
  score: number;
  /** Verdict from a previous sweep's .triage/<kind>/<n>/results.md, if one exists. */
  prior?: { verdict: string; status: string };
}

const REACTION_FRAGMENT = `reactionGroups { content users { totalCount } }`;

const ISSUE_QUERY = `
query($owner: String!, $name: String!, $cursor: String, $page: Int!) {
  repository(owner: $owner, name: $name) {
    issues(first: $page, after: $cursor, states: OPEN, orderBy: {field: CREATED_AT, direction: DESC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        number title url bodyText createdAt updatedAt
        author { login __typename }
        comments { totalCount }
        participants { totalCount }
        labels(first: 20) { nodes { name } }
        ${REACTION_FRAGMENT}
      }
    }
  }
}`;

const PR_QUERY = `
query($owner: String!, $name: String!, $cursor: String, $page: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequests(first: $page, after: $cursor, states: OPEN, orderBy: {field: CREATED_AT, direction: DESC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        number title url bodyText createdAt updatedAt
        isDraft additions deletions changedFiles mergeable reviewDecision
        author { login __typename }
        comments { totalCount }
        reviews { totalCount }
        participants { totalCount }
        labels(first: 20) { nodes { name } }
        ${REACTION_FRAGMENT}
      }
    }
  }
}`;

let token: string | undefined;
function ghToken(): string {
  token ??= execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
  return token;
}

async function graphql(query: string, variables: Record<string, unknown>): Promise<any> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      authorization: `bearer ${ghToken()}`,
      "content-type": "application/json",
      "user-agent": "zod-triage-signal",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data?: any; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data;
}

function readReactions(groups: { content: string; users: { totalCount: number } }[]) {
  let upvotes = 0;
  let soft = 0;
  for (const g of groups) {
    const n = g.users.totalCount;
    if (UPVOTE_REACTIONS.has(g.content)) upvotes += n;
    else soft += n;
  }
  return { upvotes, soft, total: upvotes + soft };
}

function normalize(node: any, kind: "issue" | "pr"): Item {
  const r = readReactions(node.reactionGroups ?? []);
  return {
    kind,
    number: node.number,
    title: node.title,
    url: node.url,
    body: node.bodyText ?? "",
    author: node.author?.login ?? "ghost",
    authorIsBot: node.author?.__typename === "Bot" || /\[bot\]$/.test(node.author?.login ?? ""),
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    labels: (node.labels?.nodes ?? []).map((l: { name: string }) => l.name),
    comments: node.comments?.totalCount ?? 0,
    participants: node.participants?.totalCount ?? 0,
    upvotes: r.upvotes,
    softReactions: r.soft,
    totalReactions: r.total,
    ...(kind === "pr"
      ? {
          isDraft: node.isDraft,
          additions: node.additions,
          deletions: node.deletions,
          changedFiles: node.changedFiles,
          reviews: node.reviews?.totalCount ?? 0,
          reviewDecision: node.reviewDecision,
          mergeable: node.mergeable,
        }
      : {}),
  };
}

async function fetchAll(repo: string, kind: "issue" | "pr", page: number): Promise<Item[]> {
  const [owner, name] = repo.split("/");
  const query = kind === "issue" ? ISSUE_QUERY : PR_QUERY;
  const key = kind === "issue" ? "issues" : "pullRequests";
  const out: Item[] = [];
  let cursor: string | null = null;
  for (;;) {
    const data = await graphql(query, { owner, name, cursor, page });
    const conn = data.repository[key];
    for (const node of conn.nodes) out.push(normalize(node, kind));
    process.stderr.write(`\r  ${kind}: ${out.length}`);
    if (!conn.pageInfo.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }
  process.stderr.write("\n");
  return out;
}

/* -------------------------------------------------------------------------- */
/* scoring                                                                    */
/* -------------------------------------------------------------------------- */

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;

function score(item: Item, now: number): Scored {
  // Each channel is log-compressed independently so a single 200-comment thread can't outrank broad, quiet demand — and reactions stay the dominant term.
  const voices = Math.max(0, item.participants - 1);
  const discussion = item.comments + (item.reviews ?? 0);
  const engagement =
    W.upvote * Math.log1p(item.upvotes) +
    W.softReaction * Math.log1p(item.softReactions) +
    W.voice * Math.log1p(voices) +
    W.comment * Math.log1p(discussion);

  const monthsIdle = (now - Date.parse(item.updatedAt)) / MS_PER_MONTH;
  const decay = DECAY_FLOOR + (1 - DECAY_FLOOR) * 0.5 ** (monthsIdle / DECAY_HALF_LIFE_MONTHS);

  let penalty = 1;
  if (item.isDraft) penalty *= PENALTY.draft;
  if (item.authorIsBot) penalty *= PENALTY.bot;
  for (const l of item.labels) {
    const p = (PENALTY as Record<string, number>)[l];
    if (p !== undefined) penalty *= p;
  }

  const vuln = detectVuln(item);
  const bonus = vuln.level === "confirmed" ? SECURITY_BONUS : vuln.level === "possible" ? SECURITY_MAYBE_BONUS : 0;

  const baseScore = engagement * decay * penalty;
  return { ...item, engagement, decay, penalty, vuln, baseScore, score: baseScore + bonus };
}

/* -------------------------------------------------------------------------- */
/* duplicate clusters                                                         */
/* -------------------------------------------------------------------------- */

const STOPWORDS = new Set(
  "a an the and or of to in for on with when is are be do does not no fix fixes fixed feat chore docs test tests refactor perf ci bug issue support add adds added allow allows make makes use using update updates from into via zod v3 v4 correctly properly".split(
    " "
  )
);

function titleTokens(title: string): Set<string> {
  const stripped = title
    .replace(/^\s*\w+(\([^)]*\))?!?:\s*/, "") // conventional-commit prefix
    .replace(/\(#\d+\)/g, "")
    .toLowerCase();
  return new Set(
    stripped
      .split(/[^a-z0-9_]+/)
      .filter((t) => t.length > 2 && !STOPWORDS.has(t))
      .map((t) => t.replace(/(ing|ed|es|s)$/, ""))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const t of a) if (b.has(t)) shared++;
  return shared / (a.size + b.size - shared);
}

/**
 * Groups open items that appear to address the same thing, so a pile of
 * near-identical drive-by PRs collapses into one decision.
 */
function findClusters(items: Scored[], threshold = 0.5): Scored[][] {
  const toks = items.map((i) => titleTokens(i.title));
  const parent = items.map((_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (jaccard(toks[i], toks[j]) >= threshold) parent[find(i)] = find(j);
    }
  }
  const groups = new Map<number, Scored[]>();
  for (let i = 0; i < items.length; i++) {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(items[i]);
  }
  return [...groups.values()]
    .filter((g) => g.length > 1)
    .map((g) => g.sort((a, b) => b.score - a.score))
    .sort((a, b) => b.length - a.length || b[0].score - a[0].score);
}

/* -------------------------------------------------------------------------- */
/* report                                                                     */
/* -------------------------------------------------------------------------- */

function ago(iso: string, now: number): string {
  const d = (now - Date.parse(iso)) / (1000 * 60 * 60 * 24);
  if (d < 1) return "today";
  if (d < 45) return `${Math.round(d)}d`;
  if (d < 365) return `${Math.round(d / 30.44)}mo`;
  return `${(d / 365.25).toFixed(1)}y`;
}

function link(i: Scored): string {
  return `[#${i.number}](${i.url})`;
}

function esc(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

function table(items: Scored[], now: number, opts: { pr?: boolean; base?: boolean } = {}): string {
  const cols = ["#", "Score", "👍", "💬", "👥"];
  if (opts.pr) cols.push("Diff");
  cols.push("Age", "Idle", "Triaged", "Title");
  const head = `| ${cols.join(" | ")} |\n|${cols.map(() => "---").join("|")}|`;
  const rows = items.map((i) => {
    const flags = [
      i.vuln.level === "confirmed" ? "🔒" : i.vuln.level === "possible" ? "🔍" : "",
      i.isDraft ? "📝" : "",
      i.labels.includes("stale") ? "💤" : "",
    ]
      .filter(Boolean)
      .join("");
    const cells = [
      link(i),
      (opts.base ? i.baseScore : i.score).toFixed(1),
      String(i.upvotes),
      String(i.comments + (i.reviews ?? 0)),
      String(i.participants),
    ];
    if (opts.pr) cells.push(`+${i.additions}/-${i.deletions}`);
    cells.push(
      ago(i.createdAt, now),
      ago(i.updatedAt, now),
      i.prior ? i.prior.verdict : "—",
      `${flags ? `${flags} ` : ""}${esc(i.title)}`
    );
    return `| ${cells.join(" | ")} |`;
  });
  return [head, ...rows].join("\n");
}

function buildReport(all: Scored[], args: Args, now: number, advisories: Advisory[]): string {
  const issues = all.filter((i) => i.kind === "issue");
  const prs = all.filter((i) => i.kind === "pr");
  const security = all.filter((i) => i.vuln.level === "confirmed").sort((a, b) => b.score - a.score);
  const maybeSecurity = all.filter((i) => i.vuln.level === "possible").sort((a, b) => b.score - a.score);
  // Security has its own section up top, so the engagement rankings below sort on engagement alone — otherwise the bonus buries every genuinely busy thread.
  const byScore = (a: Scored, b: Scored) => b.baseScore - a.baseScore;

  const L: string[] = [];
  L.push(`# Triage signal report — ${args.repo}`);
  L.push("");
  L.push(
    `Generated ${new Date(now).toISOString()} · ${issues.length} open issues · ${prs.length} open PRs · ${security.length} flagged security · ${advisories.length} draft advisories`
  );
  L.push("");
  L.push(
    "Legend: 👍 upvote reactions on the opening post · 💬 comments (+ reviews on PRs) · 👥 distinct participants · 🔒 security · 🔍 possible security · 📝 draft · 💤 stale"
  );
  L.push("");

  L.push("## 1. Security");
  L.push("");
  if (advisories.length) {
    L.push(`### Draft advisories in the Security tab (${advisories.length}) — these do not appear in the issue list`);
    L.push("");
    L.push("| GHSA | State | Severity | Summary |");
    L.push("|---|---|---|---|");
    for (const a of advisories) {
      L.push(`| [${a.ghsa_id}](${a.html_url}) | ${a.state} | ${a.severity ?? "—"} | ${esc(a.summary)} |`);
    }
    L.push("");
  }
  if (security.length) {
    L.push(`### Open issues/PRs matching security content (${security.length})`);
    L.push("");
    L.push(table(security, now));
    L.push("");
    for (const i of security) {
      L.push(`- ${link(i)} — matched: ${i.vuln.reasons.join(", ")}`);
    }
    L.push("");
  } else {
    L.push("No open issue or PR matched a confirmed security pattern.");
    L.push("");
  }

  L.push(`## 2. Top ${args.top} issues by signal`);
  L.push("");
  L.push(table(issues.sort(byScore).slice(0, args.top), now, { base: true }));
  L.push("");

  L.push(`## 3. Top ${args.top} pull requests by signal`);
  L.push("");
  L.push(table(prs.sort(byScore).slice(0, args.top), now, { pr: true, base: true }));
  L.push("");

  L.push("## 4. Highest raw demand (most upvoted issues, ignoring decay)");
  L.push("");
  L.push(
    table(
      issues
        .filter((i) => i.upvotes > 0)
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 20),
      now
    )
  );
  L.push("");

  L.push("## 5. Busiest threads (most discussion, ignoring reactions)");
  L.push("");
  L.push(
    table(
      all
        .slice()
        .sort((a, b) => b.comments + (b.reviews ?? 0) - (a.comments + (a.reviews ?? 0)))
        .slice(0, 20),
      now
    )
  );
  L.push("");

  const clusters = findClusters(all);
  if (clusters.length) {
    const dupTotal = clusters.reduce((n, g) => n + g.length, 0);
    L.push(`## 6. Likely duplicate clusters (${clusters.length} clusters, ${dupTotal} items)`);
    L.push("");
    L.push("Items whose titles overlap heavily — each cluster is probably one decision, not many.");
    L.push("");
    for (const g of clusters) {
      L.push(`**${g.length}× — ${esc(g[0].title)}**`);
      L.push("");
      L.push(table(g, now));
      L.push("");
    }
  }

  const untriaged = all.filter((i) => !i.prior).sort(byScore);
  L.push(`## 7. Highest signal with no triage write-up yet (${untriaged.length} untriaged)`);
  L.push("");
  L.push(`Nothing under \`${args.outDir}/{issues,prs}/<n>/results.md\` covers these. This is the work queue.`);
  L.push("");
  L.push(table(untriaged.slice(0, args.top), now, { base: true }));
  L.push("");

  if (maybeSecurity.length) {
    L.push(`## 8. Possible security (weak keyword match, ${maybeSecurity.length})`);
    L.push("");
    L.push(table(maybeSecurity.slice(0, 25), now));
    L.push("");
  }

  L.push("## Scoring");
  L.push("");
  L.push("```");
  L.push(`engagement = ${W.upvote}·ln(1+upvotes) + ${W.softReaction}·ln(1+other reactions)`);
  L.push(`           + ${W.voice}·ln(1+participants-1) + ${W.comment}·ln(1+comments+reviews)`);
  L.push(
    `decay      = ${DECAY_FLOOR} + ${(1 - DECAY_FLOOR).toFixed(2)} · 0.5^(months idle / ${DECAY_HALF_LIFE_MONTHS})`
  );
  L.push(`penalty    = product of ${JSON.stringify(PENALTY)}`);
  L.push(
    `score      = engagement · decay · penalty + ${SECURITY_BONUS} if security (+${SECURITY_MAYBE_BONUS} if possible)`
  );
  L.push("```");
  L.push("");
  L.push(
    "Each channel is log-compressed on its own so one runaway thread can't dominate, and reactions outweigh comments because a reaction is one-per-person while a comment count can be two people arguing."
  );
  L.push("");
  return L.join("\n");
}

/* -------------------------------------------------------------------------- */
/* existing triage write-ups                                                  */
/* -------------------------------------------------------------------------- */

/** Reads `verdict`/`status` out of the frontmatter of any existing .triage/*<N>/results.md. */
function loadPriorTriage(outDir: string): Map<string, { verdict: string; status: string }> {
  const map = new Map<string, { verdict: string; status: string }>();
  for (const kind of ["issues", "prs"] as const) {
    const dir = path.join(outDir, kind);
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir)) {
      const file = path.join(dir, entry, "results.md");
      if (!fs.existsSync(file)) continue;
      const fm = fs.readFileSync(file, "utf8").split(/^---\s*$/m)[1] ?? "";
      map.set(`${kind === "issues" ? "issue" : "pr"}:${entry}`, {
        verdict: /^verdict:\s*(.+)$/m.exec(fm)?.[1].trim() ?? "—",
        status: /^status:\s*(.+)$/m.exec(fm)?.[1].trim() ?? "—",
      });
    }
  }
  return map;
}

/* -------------------------------------------------------------------------- */
/* advisories                                                                 */
/* -------------------------------------------------------------------------- */

interface Advisory {
  ghsa_id: string;
  state: string;
  severity: string | null;
  summary: string;
  html_url: string;
}

function fetchAdvisories(repo: string): Advisory[] {
  try {
    const raw = execFileSync("gh", ["api", `repos/${repo}/security-advisories`, "--paginate"], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    const list = JSON.parse(raw) as Advisory[];
    return list.filter((a) => a.state !== "closed" && a.state !== "published");
  } catch {
    // No admin/security access on this repo — not fatal.
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* main                                                                       */
/* -------------------------------------------------------------------------- */

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const now = Date.now();
  process.stderr.write(`Fetching ${args.repo}...\n`);

  const [issues, prs] = await Promise.all([
    fetchAll(args.repo, "issue", args.page),
    fetchAll(args.repo, "pr", args.page),
  ]);
  const advisories = fetchAdvisories(args.repo);
  const prior = loadPriorTriage(args.outDir);

  const all = [...issues, ...prs]
    .map((i) => {
      const s = score(i, now);
      s.prior = prior.get(`${i.kind}:${i.number}`);
      return s;
    })
    // Ties are common once the security bonus flattens quiet reports; break by recency.
    .sort((a, b) => b.score - a.score || Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  fs.mkdirSync(args.outDir, { recursive: true });
  const mdPath = path.join(args.outDir, "signal-report.md");
  const jsonPath = path.join(args.outDir, "signal-report.json");
  fs.writeFileSync(mdPath, buildReport(all, args, now, advisories));
  fs.writeFileSync(
    jsonPath,
    `${JSON.stringify(
      all.map(({ body, ...rest }) => rest),
      null,
      2
    )}\n`
  );
  process.stderr.write(`\nWrote ${mdPath} and ${jsonPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(1);
});
