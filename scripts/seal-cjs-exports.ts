#!/usr/bin/env nub

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// zshy's CommonJS output re-exports every symbol through a `__createBinding` accessor, so `require("zod").validate(...)` reads its function through a getter on every call and V8 never sees a constant callee — worth ~3x on z.validate. `__createBinding` copies the source descriptor instead of wrapping it whenever that descriptor is a non-writable, non-configurable data property, so sealing each module's own exports on the way out settles the whole re-export chain up to the entrypoints.
//
// Two things this cannot be. Reassigning `module.exports` to a flat object settles everything in one place, but it blinds `cjs-module-lexer`, so named imports from ESM stop resolving and the attw check goes red. Sealing property by property costs ~18ms of `require("zod")` in map transitions; `Object.freeze` does the same work in ~3ms, and the loop only has to handle the configurable accessors `export { a } from` leaves behind.

const MARKER = "// seal-cjs-exports";

const EPILOGUE = `
${MARKER}
for (const key of Object.getOwnPropertyNames(exports)) {
  const desc = Object.getOwnPropertyDescriptor(exports, key);
  if (!desc || !desc.get || !desc.configurable) continue;
  let value;
  try {
    value = desc.get();
  } catch {
    continue;
  }
  // a circular require may not have settled this one yet, so leave it live
  if (value === undefined) continue;
  Object.defineProperty(exports, key, { value, writable: false, enumerable: desc.enumerable, configurable: false });
}
Object.freeze(exports);
`;

function emittedCjsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "src" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...emittedCjsFiles(full));
    else if (entry.endsWith(".cjs")) out.push(full);
  }
  return out;
}

const pkgDir = resolve(process.argv[2] ?? ".");
let sealed = 0;
for (const file of emittedCjsFiles(pkgDir)) {
  const contents = readFileSync(file, "utf8");
  if (contents.includes(MARKER)) continue;
  writeFileSync(file, contents + EPILOGUE);
  sealed++;
}

console.log(`seal-cjs-exports: sealed the exports of ${sealed} CommonJS module${sealed === 1 ? "" : "s"}`);
