import { execa } from "execa";

const $ = execa({ stdout: "inherit", stderr: "inherit" });
import { ZOD, ZOD3, generate } from "../generate.js";

console.log("╔════════════════╗");
console.log("║     Zod v4     ║");
console.log("╚════════════════╝");
await generate({
  path: "src/index.ts",
  ...ZOD,
  schemaType: "z.interface",
  numSchemas: 500,
  numKeys: 3,
  numRefs: 1,
  // methods: [""],
});

await $`pnpm run build:bench`;

