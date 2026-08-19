# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

The project uses pnpm workspaces. Key commands:

- `pnpm build` - Build all packages (runs recursive build command)
- `pnpm vitest run` - Run all tests with Vitest. Includes the compile-mode project, which re-runs the zod tests with global AOT compilation enabled (see `wiki/compile.md`).
- `pnpm vitest run <path>` - Run specific test file (e.g., `packages/zod/src/v4/classic/tests/string.test.ts`)
- `pnpm vitest run <path> -t "<pattern>"` - Run specific test(s) within a file (e.g., `-t "MAC"`)
- `pnpm vitest run --update` - Update all test snapshots
- `pnpm vitest run <path> --update` - Update snapshots for specific test file
- `pnpm test:watch` - Run tests in watch mode
- `pnpm vitest run --coverage` - Run tests with coverage report
- `pnpm test:compile` - Focused alias for just the compile-mode project. Already covered by `pnpm test`; use this when iterating on compile-related changes.
- `pnpm dev` - Execute code with tsx under source conditions
- `pnpm dev <file>` - Execute `<file>` with tsx & proper resolution conditions. Usually use for `play.ts`.
- `pnpm dev:play` - Quick alias to run play.ts for experimentation
- `pnpm check:comments` - Fail on stacked `//` comment lines (`--fix` joins them)
- `pnpm lint` - Run biome linter with auto-fix
- `pnpm format` - Format code with biome
- `pnpm fix` - Run both format and lint

## Rules

- Node.js v24+ required (use nvm if needed); pnpm v10.12.1
- ES modules are used throughout (`"type": "module"`)
- All tests must be written in TypeScript - never use JavaScript
- Use `play.ts` for quick experimentation; use proper tests for all permanent test cases
- Features without tests are incomplete - every new feature or bug fix needs test coverage
- Don't skip tests due to type issues - fix the types instead
- Test both success and failure cases with edge cases
- Keep added tests as minimal and dense as possible without sacrificing comprehensiveness; avoid redundant assertions or broad fixtures when a focused case proves the behavior.
- No log statements (`console.log`, `debugger`) in tests or production code
- Never stack prose across consecutive `//` lines. Lines have no maximum width here — the editor wraps for display — so a paragraph split across several `//` lines is just a hard-wrapped line, and hard wrapping breaks search, diffs and editing. Write one long `//` instead. `pnpm check:comments` enforces this in pre-commit and CI; `--fix` joins the offenders. Commented-out code, `@ts-`/`@__NO_SIDE_EFFECTS__`-style pragmas, bullet lists, and blocks separated by a bare `//` are exempt. When two adjacent comments describe two different statements, separate them with a blank line rather than joining them.
- Ask before generating new files
- Use `util.defineLazy()` for computed properties to avoid circular dependencies
- Never branch on specific schema types in shared code. No `def.type === "optional"` conditionals, no hardcoded lists of wrapper type names, no walks up the wrapper chain hunting for a particular type. Every schema type added later silently falls through such a check, and the list is wrong the moment someone writes a new wrapper. When a shared path needs to know something about a schema, express it as a structural property on the internals — `optin`/`optout`, `values`, `pattern`, `propValues` — and let each type declare its own answer. This is not negotiable in the parse paths; a PR that adds edge-case conditional logic keyed on schema types will be rejected regardless of how well it is tested.
- Performance is critical - parameter reassignment is allowed for optimization
- Any change to `packages/zod/src` must be weighed on **all three axes: runtime performance, memory consumption, and bundle size** — see "The three axes" below. A change that improves one and is only checked on that one is not finished.
- ALWAYS use the `gh` CLI to fetch GitHub information (issues, PRs, etc.) instead of relying on web search or assumptions
- Keep JSDoc as minimal as possible. A self-explanatory type or symbol name needs no doc comment. When a comment is genuinely required, write one short sentence describing behavior — not history, rationale, or examples. Don't add interface-level JSDoc that just restates the interface name.
- When you've modified a PR (or opened/closed/commented on one), include the PR URL liberally in summary messages — at minimum once at the end of any reply that touched it
- When creating a PR, do not include a separate test plan section in the body. Link to any relevant issues under discussion, and use the same copywriting guidelines from "Commenting on issues and PRs": concise maintainer voice, prose over templates, and validation details only when they are material to the reader.
- Format validators (`z.iso.*`, `z.email()`, `z.url()`, `z.uuid()`, …) are deliberately narrower than the specs they're named after. "The spec allows X" is not a reason to accept X — see "Format validators: spec compliance is not the bar" below.
- NEVER bump the version in `packages/zod/package.json` (or any package's `package.json`). A version bump is the only thing that triggers a release; everything else (including direct pushes to `main`) is recoverable until that happens. If a version bump is genuinely needed, ask first.

## The three axes

Zod is judged on **runtime performance**, **memory consumption**, and **bundle size** at once, and they trade against each other constantly. Optimizing one in isolation is how regressions land: a change that buys bundle bytes can cost construction speed, and one that saves memory can cost both. Any non-trivial change to `packages/zod/src` — and any change to `core/` at all, since every build ships it — needs a number on all three before it is done. Report them together, including the ones that got worse.

`zod/mini` deserves its own line on the bundle axis: it is sold on size, so a fixed cost lands very differently there (~200 B is 6% of the smallest mini bundle and 1% of classic's).

| axis    | how to measure                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| runtime | `packages/bench/*.ts` via `pnpm bench <name>`, plus construction cost — parse and construction move independently                                 |
| memory  | `packages/bench/memory/schema-footprint.ts` and `realworld.ts` (retained bytes per schema; run under `--expose-gc`)                               |
| bundle  | bundle a `packages/treeshake` fixture with esbuild `--minify` under `--conditions=@zod/source` and gzip it, for both a classic and a mini fixture |

### Benchmarking traps

These produced hours of wrong conclusions; check them before believing a number.

- **Check `uptime` first.** A loaded machine invents effects of ±16%. Numbers taken above a load average of ~8 are worthless.
- **Interleave the two revisions.** Running all of A then all of B puts any drift entirely on whichever ran second. Alternating round-by-round took per-side spread from 2.5x to 4%.
- **Loading two zod revisions into one process makes call sites polymorphic.** It is fine for comparing construction, unreliable for tight leaf parses.
- **Allocating benchmarks can't be timed by a fixed-duration loop.** `z.array().parse()` allocates per call, so a time-boxed harness samples whatever the collector is doing — it gave +8.2% and −17.3% on consecutive identical runs. Use a fixed iteration count with `gc()` between samples and take the minimum.
- **Make sure the work isn't optimized away.** If a micro-benchmark reports ~1e9 ops/sec, V8 eliminated the loop; consume the result.

### Property placement, specifically

Most of the memory in a schema is its own-property count, not its closures. V8 sizes an instance's backing store in steps and `$constructor` assigns nothing itself, so instances get no in-object slots: **≤12 own properties cost 128 bytes, 13–20 cost 848, ≥21 cost 1616** (`packages/bench/memory/prop-slack.ts` measures this). Members therefore live on the prototype and materialize per instance on first read.

If you touch that machinery, three things bite:

- **Moving a property between definition sites changes its descriptor**, and writability/enumerability/configurability are part of the public contract. `packages/bench/memory/` has a surface-diff approach for this: dump every descriptor, alias and assign/delete semantic on both revisions and diff them. It caught four real regressions that tests did not.
- **Redefining an accessor demotes the object to dictionary mode**, which cost 2x on `z.object().parse` once. Run `packages/bench/memory/dict-mode.ts` after any change here — every instance must report `fast`.
- **A bound function pays a call-time trampoline.** Fine for cold builder methods, measurably not fine on the parse path.

## Cutting a release

Only do this when the user explicitly asks. Pushing a version bump to `main` triggers `.github/workflows/release.yml`, which publishes to npm + JSR and creates a `v<version>` GitHub release. There is no undo.

Three files must be bumped together — `pnpm check:semver` runs in pre-commit and `prepublishOnly`, and will fail the commit if they disagree:

- `packages/zod/package.json` — `version`
- `packages/zod/jsr.json` — `version`
- `packages/zod/src/v4/core/versions.ts` — `major` / `minor` / `patch`

Procedure:

```bash
# Make sure main is clean and up to date first.
git checkout main && git pull

# Bump all three files to the new x.y.z, then:
git add packages/zod/package.json packages/zod/jsr.json packages/zod/src/v4/core/versions.ts
git commit -m "<x.y.z>"   # commit message is just the version, e.g. "4.4.3"
git push origin main
```

The release workflow only fires on changes under `packages/zod/package.json`, `packages/zod/src/**`, or the workflow file itself, so the bump must include `package.json`. Watch the Actions tab to confirm `build_and_publish` succeeds.

## Format validators: spec compliance is not the bar

Zod's format validators — `z.iso.*`, `z.email()`, `z.url()`, `z.uuid()`, and the rest — are named after specs but do not implement them. Each one matches the profile that real producers emit and real consumers accept, which is almost always far narrower than what the grammar permits. That narrowness is the product, not a gap in it.

So **"the spec allows X, therefore Zod must accept X" is not an argument**, and a PR that widens a format regex on that basis alone will be closed. The question is never what the spec permits; it's whether accepting the wider form helps more people than rejecting it hurts. A form that shows up in real payloads and breaks real integrations is worth fixing. A form that only appears when someone reads the grammar and constructs a string from it is not — when one of those reaches a validator in production it's a bug or an attack, and rejecting it is the useful behavior.

Three things make a widening request an automatic no:

- **The spec permits the form only "by mutual agreement" of the two parties.** A general-purpose validator is never party to that agreement, so it can't honor the clause. ISO 8601 expanded years (`+010000-01-01T00:00:00.000Z`) are the canonical case: the standard also requires the parties to agree the digit count, and runtimes disagree — JavaScript emits six digits, Java's `Instant` emits five, Python rejects both. Declined in #6154.
- **The wider form breaks the JSON Schema output.** `z.iso.datetime()` and `z.iso.date()` emit `format: "date-time"` and `format: "date"`, which mean RFC 3339 — four-digit years, no sign. Widening those regexes makes `z.toJSONSchema()` emit a pattern that conformant consumers reject.
- **The cost lands on everyone.** These regexes live in `core/regexes.ts`, so every added alternation is bytes in every bundle including `zod/mini`, plus more backtracking on a hot parse path. Weigh it on all three axes above before you argue for it at all.

For calibration on how narrow these already are: `z.iso.datetime()` rejects basic format (`20200101T061500Z`), week dates (`2020-W01-1`), ordinal dates (`2020-001`), comma decimal separators, and `24:00`. Every one of those is valid ISO 8601. None of them are going in either.

Point anyone who genuinely needs a wider format at `z.string().regex()` or `z.string().refine()`. That escape hatch is the answer, not a wider default.

## Triaging issues and PRs

Follow the `triage` skill at [`.claude/skills/triage/SKILL.md`](.claude/skills/triage/SKILL.md) whenever you're asked to investigate, triage, or form an opinion on an issue or PR. It is the single source of truth for the procedure. Claude and Codex both auto-discover it (Codex via the `.codex/skills` symlink); read it directly if your agent doesn't.

For a draft **security advisory** — a GHSA id, the Security tab, a private vulnerability report — use the `security-advisory` skill at [`.claude/skills/security-advisory/SKILL.md`](.claude/skills/security-advisory/SKILL.md) instead. It shares the conventions above but reorders the work: the fix lands on `main` before any reporter comment is drafted, since the comment's whole value is the PR it links to.

Write-ups live in the gitignored `.triage/` tree — one directory per ticket, `.triage/issues/NNNN/results.md` and `.triage/prs/NNNN/results.md`, with scratch files and repros alongside. When investigating a PR from its worktree, resolve the root repo first (`git worktree list | head -1`) and write results back there; a relative write lands in the worktree's own ignored `.triage/` where nobody will find it.

## Iterating on a contributor PR in a worktree

When asked to make changes on top of an open PR (e.g. as a maintainer review suggestion), use a worktree so `main` stays clean:

```bash
# 1. Fetch the PR as a local branch and create a worktree for it
git fetch origin pull/<N>/head:pr-<N>
git worktree add ~/.cursor/worktrees/zod/pr-<N> pr-<N>
cd ~/.cursor/worktrees/zod/pr-<N>
pnpm install --frozen-lockfile   # fast, pnpm store is shared across worktrees

# 2. Look up the PR's head info — you'll need the contributor's fork URL
#    and the head ref name to push back.
gh pr view <N> --repo colinhacks/zod \
  --json headRefName,headRepositoryOwner,maintainerCanModify

# 3. If maintainerCanModify is true, add the fork as a remote and push to
#    the PR's head ref (NOT to your local branch name).
git remote add <contributor> git@github.com:<contributor>/zod.git
git push <contributor> pr-<N>:<headRefName>                 # first push
git push <contributor> pr-<N>:<headRefName> --force-with-lease   # for amends
```

Notes:

- Do NOT use `gh pr checkout --detach` for this — it moves your _current_ working tree into detached HEAD instead of creating a worktree.
- Husky pre-commit runs biome format/lint via lint-staged; pre-push runs the full vitest suite. Both are fast and act as a safety net — don't bypass with `--no-verify` unless you have a specific reason.
- **Preserve contributor commits.** Never `git reset --hard` or otherwise rewrite history that erases the contributor's work, even if you're rewriting the actual change. They need to stay in the PR's commit list to get credit on the merged PR. If their approach was wrong, add a `Revert "..."` commit (or just a plain commit that undoes those lines) and then add your replacement commit on top. Force-pushing a single clobbering commit strips them from the GitHub contributors graph.
- When done, clean up: `git worktree remove ~/.cursor/worktrees/zod/pr-<N>` and `git branch -D pr-<N>` (and optionally `git remote remove <contributor>`).

## Commenting on issues and PRs

When posting on a maintainer's behalf via `gh` (PR comments, issue comments, reviews), match the house tone. The register is authoritative and friendly — concise, not bubbly, not over-explaining, not effusive. Comments come from a maintainer handing down decisions, not negotiating them. Friendly does not mean deferential.

- Exclamation points are fine in moderation, especially to soften a decline or close out a thread ("Thanks for looking into this!"). Don't stack them and don't sprinkle them through technical writeups.
- Skip effusive praise: "Great work", "Awesome", "Thanks so much for this", "Thanks for the careful writeup", "you clearly read the RFC". A short flat-affect affirmation walks the line well — "Good investigation." or "Solid catch." with a period, no exclamation, no superlatives. Warmth otherwise comes from a short closer ("Thanks for looking into this, though 👍"), not a preamble that butters up the contributor before the decision.
- No "PTAL", "WDYT", or sign-off flourishes asking the contributor to re-review changes the maintainer pushed on top. State what changed and the merge intent. ("LGTM" is fine as a literal verdict at the end of a substantive review, not as a sign-off.)
- When the user gives you exact wording for a comment, use it verbatim (fixing only obvious typos). Do not "improve" their phrasing to match this style guide — their direct instruction wins.
- Lead with the decision or action: "Going to merge as-is." "Closing this out." "I'd be open to a top-level utility but not as a method." Then the reasoning.
- First person, owned opinions. "I don't think this should be a method." "I'm hesitant to add this." Don't hide behind passive voice or "we could perhaps consider".
- Speak with authority. No hedging ("maybe", "I think perhaps", "if that's okay"), no apologizing for decisions, no asking permission to land changes the maintainer has already made. Decisions are stated as decisions.
- Be direct when declining, but not curt. "out of scope", "behaving as intended", "this is more complicated than it looks" — firm, with a concrete reason. A friendly closer ("thanks for looking into this") is fine.
- Cross-reference by number: `#4433`, `commit 2f8414bc`, `merged in #5718`. Concrete and verifiable.
- Length matches substance. Default to 1–4 sentences. Go long only when the content earns it (root-cause writeups, benchmark results, pointing to a canonical thread).
- Pick the one or two strongest reasons and write them as prose. Resist enumerating every objection in a bullet list — even when each point is fair, it reads as piling on. The strongest argument plus a concrete escape hatch (e.g. "`z.email().max(254)` already does this") is usually enough.
- Don't lift informal or coarse phrasing from external sources (blog posts, issues, comments) into the maintainer voice, even in quotes. Paraphrase the substance — quoted-in-context still reads as the maintainer talking.
- Use prose with inline backticks for symbols. Reach for fenced code blocks only when showing non-trivial code is genuinely clearer than describing it.
- Skip emojis in substantive technical writeups. A small `👍` in a casual closer is good — it keeps a decline or sign-off sounding warm and friendly without leaning on praise.
- Bot mentions are bare imperatives: `@pullfrog review`, `@pullfrog fix merge conflicts`, `@pullfrog re-review fresh.`
- When pushing a follow-up on top of a contributor's PR, state what changed, why it differs from the original approach, and that the maintainer is merging. Never ask the contributor to review the maintainer's changes — they are final, not a proposal. Don't thank them for "letting" the maintainer rewrite their work.
- When posting comments with code samples via `gh`, do NOT pass the body inline through a heredoc that requires escaping backticks. Backslash-escaped backticks (`` \` ``) inside a `$(cat <<'EOF' ... EOF)` body get sent to GitHub literally and break inline code and template literals inside fenced blocks. Instead, write the comment to a file and pass it via `--body-file <path>` (for `gh pr/issue comment`) or `-F body=@<path>` (for `gh api`). This preserves backticks and `${...}` exactly as written.

## Pushing to a new branch (don't accidentally push to main)

When the user asks for a "new PR" or "new branch", the work has to land on a non-`main` ref on the remote. The footgun: `git worktree add <path> -b <branch> origin/main` (and `git checkout -b <branch> origin/main`) silently set the new branch's upstream to `refs/heads/main` because the start point is a remote-tracking ref. A subsequent `git push -u origin <branch>` then pushes to `refs/heads/main`, not to a new remote branch. Two of these in a row have happened.

Avoid by being explicit on the first push:

```bash
# Always use a refspec on the initial push so the remote ref name is unambiguous.
git push -u origin <branch>:refs/heads/<branch>
```

Then verify the output. The line you want to see is:

```
* [new branch]      <branch> -> <branch>
```

If the right-hand side says `main`, the push went to main — abort or revert.

Use `git push origin HEAD:refs/heads/<branch>` for subsequent pushes if you didn't `-u` originally. Don't rely on `git push -u origin <branch>` alone — its behavior depends on the upstream config, which `worktree add -b ... origin/main` set wrong for you.
