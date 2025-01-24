import type { $ZodType } from "./base.js";
import { randomString } from "./util.js";

type ModeWriter = (doc: Doc, modes: { execution: "sync" | "async"; result?: "clone" | "cast" }) => void;
export class Doc {
  content: string[];
  scopes: Record<string, string[]>;
  scope: string | null = null;
  ctx: Record<string, any> = {};
  indent = 0;

  constructor() {
    this.scopes = {};
    this.content = [];
  }
  get arg() {
    return randomString();
  }

  register(...schemas: $ZodType[]) {
    for (const schema of schemas) {
      schema._docParse(this);
    }
  }

  indented(fn: (doc: Doc) => void) {
    this.indent += 1;
    fn(this);
    this.indent -= 1;
  }

  call(schema: $ZodType, params: { execution: "sync" | "async" }) {
    if (!this.scopes[schema["~id"]]) {
      this.scopes[schema["~id"]] = [];
      schema._docParse(this);
    }
    return `${schema["~id"]}_parse_${params.execution}`;
  }

  parser(
    schema: $ZodType,
    ctx: any,
    fn: (doc: Doc, modes: { execution: "sync" | "async"; result?: "clone" | "cast" }) => void
  ) {
    const id = schema["~id"];
    this.scoped(id, ctx, (doc) => {
      doc.write(`function ${id + "_parse_sync"}(input, path) {`);
      doc.write(`const ctx = globalCtx.${id}`);
      doc.indented((doc) => {
        fn(doc, { execution: "sync" });
      });
      doc.write(`}`);

      doc.write(`async function ${id + "_parse_async"}(input, path) {`);
      doc.indented((doc) => {
        fn(doc, { execution: "async" });
      });
      doc.write(`}`);
    });
  }

  scoped(name: string, ctx: any, fn: (doc: Doc) => void) {
    const prev = this.scope;
    this.ctx[name] = ctx;
    this.scope = name;
    fn(this);
    this.scope = prev;
  }

  write(fn: ModeWriter): void;
  write(line: string): void;
  write(arg: any) {
    if (typeof arg === "function") {
      (arg as ModeWriter)(this, { execution: "sync" });
      (arg as ModeWriter)(this, { execution: "async" });
      return;
    }

    const line = arg as string;
    const cleaned = line.trim().split("\n");
    // .map((x) => x.trim());
    if (this.scope) {
      this.scopes[this.scope] = this.scopes[this.scope] || [];
      for (const line of cleaned) {
        this.scopes[this.scope].push(" ".repeat(this.indent * 2) + line);
      }
      // this.scopes[this.scope].push(" ".repeat(this.indent * 2) + line.trim());
    } else {
      for (const line of cleaned) {
        this.content.push(" ".repeat(this.indent * 2) + line.trim());
      }
      // this.content.push(" ".repeat(this.indent * 2) + line.trim());
    }
  }

  finalize() {
    const lines = [
      `  const result = { value: null, issues: [], aborted: false };`,
      ...this.content.map((x) => `  ${x}`),
      "  return result;",
    ];
    return new Function("input", lines.join("\n"));
  }

  compile() {
    const lines = [...this.content.map((x) => `  ${x}`)];
    console.log(lines.join("\n"));
    return new Function("def", "payload", "ctx", lines.join("\n"));
  }

  static build(schema: $ZodType, modes: { execution: "sync" | "async" }): (...args: any[]) => any {
    const doc = new Doc();
    const fn = doc.call(schema, modes);
    const lines = [];
    lines.push(`const result = { value: null, issues: [], aborted: false };`);

    for (const key in doc.scopes) {
      // lines.push(`function ${key}(input, path) {`);
      lines.push(doc.scopes[key].join("\n"));
      // lines.push("}");
    }

    lines.push(`result.value = ${fn}(input, [])`);
    lines.push(`return result;`);

    const body = lines.join("\n");

    const func = new Function("globalCtx", "input", body);
    return func.bind(null, doc.ctx);
  }

  linearize(arg: string) {
    const lines = [
      // `  const result = { result: null, issues: [], aborted: false};`,
      ...this.content.map((x) => `  ${x}`),
      // "  return result;",
      "  return true",
    ];
    return new Function(arg, lines.join("\n"));
  }
}

// object.parse
// function parse(input, globalCtx) {
//   const result = {
//     issues: [],
//     value: input,
//   };
//   // object.scope
//   function parse_object(input, path) {
//     const issues = [];
//     if (typeof input !== "object" || input === null) {
//       issues.push({
//         code: "invalid_type",
//         expected: "object",
//         input,
//       });
//       return issues;
//     }
//   }

//   // per key
//   // a
//   function parse_string(input, path) {}
// }
// // object
