import { execa } from "execa";

const $ = execa({ stdout: "inherit", stderr: "inherit" });
import { ARKTYPE, ZOD, ZOD3, generate } from "../generate.js";

console.log("╔════════════════╗");
console.log("║     Zod v3     ║");
console.log("╚════════════════╝");
await generate({
  path: "src/index.ts",
  ...ZOD3,
  numSchemas: 0,
  numKeys: 0,
  custom: `
  export const schema = z.string();
  export type schema = z.infer<typeof schema>;
  `
});

await $`pnpm run build:bench`;

console.log("╔════════════════╗");
console.log("║     Zod v4     ║");
console.log("╚════════════════╝");
await generate({
  path: "src/index.ts",
  ...ZOD,
  numSchemas: 0,
  numKeys: 0,
  custom: `
  export const schema = z.string();
  export type schema = z.infer<typeof schema>;
  `
});

await $`pnpm run build:bench`;
