import type { $ZodType } from "./base.js";
import { randomString } from "./util.js";

export class Doc {
  content: string[];
  ctx: Record<string, any> = {};
  fns: Record<string, string[]>;
  indent = 0;
  replacers: Record<string, string> = {
    $await: "await",
  };
  constructor() {
    this.fns = {};
    this.content = [];
  }
  get arg() {
    return randomString();
  }

  scopedFn(schema: $ZodType, fn: (doc: Doc) => void) {}
  write(line: string) {
    this.content.push(line);
  }
  writeAsync(id: string, name: string, fn: (doc: Doc) => void) {
    this.write(`function ${name}(input, path) {`);
    this.indent += 2;
    this.write(`  const ctx = globalCtx[${id}]`);
    fn(this);
    this.indent -= 2;
    this.write(`}`);

    this.write(`async function ${name}Async(input, path) {`);
    this.indent += 2;
    this.write(`  const ctx = globalCtx[${id}]`);
    fn(this);
    this.indent -= 2;
    this.write(`}`);
  }
  finalize(arg: string) {
    const lines = [...this.content.map((x) => `  ${x}`), "  return true;"];
    return new Function(arg, lines.join("\n"));
  }
}

// object.parse
function parse(input, globalCtx) {
  const result = {
    issues: [],
    value: input,
  };
  // object.scope
  function parse_object(input, path) {
    const issues = [];
    if (typeof input !== "object" || input === null) {
      issues.push({
        code: "invalid_type",
        expected: "object",
        input,
      });
      return issues;
    }
  }

  // per key
  // a
  function parse_string(input, path) {}
}
// object
