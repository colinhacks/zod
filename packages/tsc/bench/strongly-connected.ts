import { execa } from "execa";

const $ = execa({ stdout: "inherit", stderr: "inherit" });
import { ZOD, ZOD3, generate } from "../generate.js";

console.log("\n\n===   Zod v4   ===");
await generate({
  path: "src/index.ts",
  ...ZOD3,
  schemaType: "z.object",
  numSchemas: 5000,
  numKeys: 3,
  // numRefs: 1,
  // methods: [""],
});

await $`pnpm run build:bench`;
