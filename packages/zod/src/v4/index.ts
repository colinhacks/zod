import * as z4 from "./classic/external.js";
export * from "./classic/index.js";
// See the note in `src/index.ts` — aliasing keeps the default export shakable. Aliased from the namespace, not from `./classic/index.js`'s default, so both the tsc and Babel CJS outputs stay a plain `exports.default =` rather than a getter.
export { z4 as default };
