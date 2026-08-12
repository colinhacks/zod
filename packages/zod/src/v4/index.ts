import z4 from "./classic/index.js";
export * from "./classic/index.js";
// See the note in `src/index.ts` — aliasing keeps the default export shakable.
// Aliased rather than `export { default } from`, which emits a CJS getter.
export { z4 as default };
