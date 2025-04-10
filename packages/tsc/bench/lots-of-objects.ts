import { execa } from "execa";

const $ = execa({ stdout: "inherit", stderr: "inherit" });
import { ARKTYPE, ZOD, ZOD3, generate } from "../generate.js";

console.log("╔════════════════╗");
console.log("║     Zod v3     ║");
console.log("╚════════════════╝");
await generate({
  path: "src/index.ts",
  ...ZOD3,
  schemaType: "z.object",
  numSchemas: 500,
  numKeys: 10,
});

await $`pnpm run build:bench`;

console.log("╔════════════════╗");
console.log("║     Zod v4     ║");
console.log("╚════════════════╝");
await generate({
  path: "src/index.ts",
  ...ZOD,
  schemaType: "z.object",
  numSchemas: 500,
  numKeys: 10,
});

await $`pnpm run build:bench`;

console.log("╔═════════════════╗");
console.log("║     ArkType     ║");
console.log("╚═════════════════╝");
await generate({
  path: "src/index.ts",
  ...ARKTYPE,
  numSchemas: 500,
  numKeys: 10,
});

await $`pnpm run build:bench`;
