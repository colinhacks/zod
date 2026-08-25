import * as z from "./external.js";

export * from "./external.js";
// See the note in `src/index.ts` — aliasing keeps the default export shakable.
export { z, z as default };
