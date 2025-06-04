import { execa } from "execa";

const $ = execa({ stdout: "inherit", stderr: "inherit" });
import * as gen from "../generate.js";

// console.log("╔═════════════════╗");
// console.log("║     Zod v3      ║");
// console.log("╚═════════════════╝");
// await gen.generateExtendChain({
//   ...gen.ZOD,
//   numSchemas: 14,
//   numKeys: 6,
//   imports: ["import * as z from 'zod'"],
// });

// await $`pnpm run build:bench`;

console.log("╔═══════════════════════╗");
console.log("║     Zod v4 (curr)     ║");
console.log("╚═══════════════════════╝");
await gen.generateExtendChain({
  ...gen.ZOD,
  numSchemas: 3,
  numKeys: 5,
  imports: ["import * as z from 'zod/v4'"],
});

await $`pnpm run build:bench`;
