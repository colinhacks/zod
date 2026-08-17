import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

// Flags stacked `//` comments that hold prose. Lines are never hard-wrapped in this repo — the editor wraps for display — so a paragraph broken across several `//` lines belongs on one long line. Commented-out code, pragmas and list items are exempt; joining those would destroy them.
//
// A block is judged as a whole: unless every line reads as prose, the block is left alone. Classifying line by line would let one code-ish line split a paragraph, and `--fix` would then join the fragment and strand its tail.

const IGNORED_PREFIXES = ["packages/treeshake/", "packages/docs/", "packages/docs-v3/", "packages/integration/"];

const DIRECTIVE =
  /^(?:@ts-|@__|biome-ignore|eslint|prettier-ignore|oxlint|[cv]8 ignore|#(?:region|endregion)|\/|<reference)/;

/** A bullet or numbered item. Starts a fresh block, so a list survives but a wrapped item is still caught. */
const LIST_ITEM = /^(?:[-*•+]\s|\d+[.)]\s)/;

/** Declarations, spelled tightly enough that English keeps clear of them — `class instances collapse to …` is prose, `class Foo {` is not. */
const DECLARATION =
  /^(?:import\s+(?:type\s+)?(?:[{*]|\w+\s*[,{]|\w+\s+from\b)|import\s*["']|export\s+(?:default|const|let|var|function|class|interface|type|enum|abstract|declare|async|[*{])|(?:const|let|var)\s+[\w${[][^=]*=|(?:function|class|interface|enum|namespace|module)\s+\w+\s*[<({]|declare\s+\w)/;

/** Structure that never shows up in an English sentence. Not overridable by `looksLikeEnglish`. */
function hasCodeStructure(body: string): boolean {
  return (
    /[;{([<]$/.test(body) ||
    /^[)}\]>?:|&.]/.test(body) ||
    /^["'[]/.test(body) ||
    /^[A-Z]\w*\s+extends\s/.test(body) ||
    /^[\w$.[\]]+\s*=[^=]/.test(body) ||
    DECLARATION.test(body)
  );
}

/** Weaker hints, all of which prose also uses. A body that reads as English wins over these. */
function hasCodeHints(body: string): boolean {
  return (
    /[,:]$/.test(body) ||
    /`/.test(body) ||
    /=>|&&|\|\||\?\?|===|!==|\+\+/.test(body) ||
    /^[\w$.[\]"']+[<(]/.test(body) ||
    /^\w+\s*:\s*[\w$]+[.<([]/.test(body) ||
    /^(?:type|return|throw|await|async|if|else|for|while|do|switch|case|try|catch|finally|new|delete|yield|readonly|static|public|private|protected|abstract|class|interface|function|import|export|const|let|var|enum|namespace|declare)\b/.test(
      body
    )
  );
}

function looksLikeEnglish(body: string): boolean {
  const words = body.split(/\s+/).filter(Boolean);
  if (words.length < 3) return false;
  const wordy = words.filter((w) => /^[A-Za-z][A-Za-z'-]*[.,;:!?)]?$/.test(w)).length;
  return wordy / words.length >= 0.6;
}

function isProse(body: string): boolean {
  if (hasCodeStructure(body)) return false;
  return looksLikeEnglish(body) || !hasCodeHints(body);
}

interface Block {
  line: number;
  bodies: string[];
}

/** Line-owning `//` comments, keyed by zero-based line number. Trailing `// note` after code never stacks. */
function ownLineComments(fileName: string, text: string, lines: string[]): Map<number, string> {
  const sf = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, /* setParentNodes */ false);

  // Every comment is leading or trailing trivia of some token, so walking the tree finds them all — and the parser has already told strings, templates and regexes apart from real comments for us.
  const starts = new Set<number>();
  const collect = (ranges: ts.CommentRange[] | undefined) => {
    for (const r of ranges ?? []) {
      if (r.kind === ts.SyntaxKind.SingleLineCommentTrivia) starts.add(r.pos);
    }
  };
  const visit = (node: ts.Node) => {
    collect(ts.getLeadingCommentRanges(text, node.pos));
    collect(ts.getTrailingCommentRanges(text, node.end));
    node.forEachChild(visit);
  };
  visit(sf);
  collect(ts.getLeadingCommentRanges(text, sf.endOfFileToken.pos));

  const owned = new Map<number, string>();
  for (const pos of starts) {
    const { line, character } = sf.getLineAndCharacterOfPosition(pos);
    if (lines[line].slice(0, character).trim() !== "") continue;
    owned.set(line, lines[line].trim().slice(2).trim());
  }
  return owned;
}

function proseBlocks(fileName: string, text: string, lines: string[]): Block[] {
  const owned = ownLineComments(fileName, text, lines);
  const blocks: Block[] = [];

  for (const line of [...owned.keys()].sort((a, b) => a - b)) {
    const body = owned.get(line)!;
    // A bare `//` is a paragraph break, and a directive belongs to whatever it annotates. Both end the block rather than joining it.
    if (body === "" || DIRECTIVE.test(body)) continue;
    const last = blocks.at(-1);
    if (last && last.line + last.bodies.length === line && !LIST_ITEM.test(body)) last.bodies.push(body);
    else blocks.push({ line, bodies: [body] });
  }

  return blocks.filter((b) => b.bodies.length > 1 && b.bodies.every(isProse));
}

function trackedFiles(): string[] {
  const paths = execFileSync("git", ["ls-files", "-z", "*.ts", "*.mts", "*.cts"], { encoding: "utf8" }).split("\0");
  // Dedupe: `git ls-files` repeats an unmerged path once per conflict stage, which would triple-count a file mid-rebase.
  return [...new Set(paths)].filter(
    (f) => f && !/\.d\.[cm]?ts$/.test(f) && !IGNORED_PREFIXES.some((p) => f.startsWith(p))
  );
}

const fix = process.argv.includes("--fix");
let violations = 0;
let touched = 0;

for (const file of trackedFiles()) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  const blocks = proseBlocks(file, text, lines);
  if (blocks.length === 0) continue;
  violations += blocks.length;

  if (fix) {
    for (const block of blocks) {
      const indent = lines[block.line].match(/^[ \t]*/)![0];
      lines[block.line] = `${indent}// ${block.bodies.join(" ")}`;
      for (let i = 1; i < block.bodies.length; i++) lines[block.line + i] = null as unknown as string;
    }
    writeFileSync(file, lines.filter((l) => l !== null).join("\n"));
    touched++;
    continue;
  }

  for (const block of blocks) {
    console.error(`${file}:${block.line + 1}: ${block.bodies.length} stacked comment lines`);
    for (const body of block.bodies) console.error(`    // ${body}`);
  }
}

if (violations === 0) {
  console.log("✅ No stacked comment lines");
} else if (fix) {
  console.log(`✅ Joined ${violations} stacked comment block(s) across ${touched} file(s)`);
} else {
  console.error(
    `\n❌ ${violations} stacked comment block(s). Join each into one line, or run \`pnpm check:comments --fix\`.`
  );
  process.exit(1);
}
