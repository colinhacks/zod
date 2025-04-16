import { execa } from "execa";

const $ = execa({ stdout: "inherit", stderr: "inherit" });
import { ARKTYPE, ZOD, ZOD3, generate } from "../generate.js";

const SHARED = {
  numSchemas: 500,
  numKeys: 5,
  numExtends: 1,
};
console.log("╔════════════════╗");
console.log("║     Zod v3     ║");
console.log("╚════════════════╝");
await generate({
  ...ZOD3,
  schemaType: "z.object",
  ...SHARED,
});

await $`pnpm run build:bench`;

console.log("╔════════════════╗");
console.log("║     Zod v4     ║");
console.log("╚════════════════╝");
await generate({
  ...ZOD,
  schemaType: "z.object",
  ...SHARED,
});

await $`pnpm run build:bench`;

// console.log("╔═════════════════╗");
// console.log("║     ArkType     ║");
// console.log("╚═════════════════╝");
// await generate({
//   ...ARKTYPE,
//   ...SHARED
// });

// await $`pnpm run build:bench`;
