import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Are The Types Wrong (attw) tests", () => {
  it("should run attw --pack node_modules/zod and check output", async () => {
    // check if node_modules/zod/index.js exists
    const zodIndexPath = path.join(__dirname, "node_modules", "zod", "index.js");
    if (!existsSync(zodIndexPath)) {
      // Zod has not been build
      return;
    }

    const result = await execa("pnpm", ["attw", "--pack", "node_modules/zod", "--format", "ascii"], {
      cwd: __dirname,
      reject: false, // Don't throw on non-zero exit codes
    });

    // Combine stdout and stderr for comprehensive output
    const output = result.stdout + (result.stderr ? "\n" + result.stderr : "");
    // remove first line
    const outputWithoutFirstLine = output.split("\n").slice(2).join("\n").trim();
    expect(outputWithoutFirstLine).toMatchInlineSnapshot(`
      "💀 Import failed to resolve to type declarations or JavaScript files. https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/NoResolution.md

      🐛 Import resolved to types through a conditional package.json export, but only after failing to resolve through an earlier condition. This behavior is a TypeScript bug (https://github.com/microsoft/TypeScript/issues/50762). It may misrepresent the runtime behavior of this import and should not be relied upon. https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FallbackCondition.md


      "@exodus/zod/package.json"

      node10: 🟢 (JSON)
      node16 (from CJS): 🟢 (JSON)
      node16 (from ESM): 🟢 (JSON)
      bundler: 🟢 (JSON)

      ***********************************

      "@exodus/zod"

      node10: 🟢 
      node16 (from CJS): 💀 Resolution failed
      node16 (from ESM): 🐛 Used fallback condition
      bundler: 🐛 Used fallback condition

      ***********************************

      "@exodus/zod/v4"

      node10: 🟢 
      node16 (from CJS): 💀 Resolution failed
      node16 (from ESM): 🐛 Used fallback condition
      bundler: 🐛 Used fallback condition

      ***********************************

      "@exodus/zod/v4/core"

      node10: 🟢 
      node16 (from CJS): 💀 Resolution failed
      node16 (from ESM): 🐛 Used fallback condition
      bundler: 🐛 Used fallback condition

      ***********************************"
    `);
  }, 30000); // 30 second timeout for the command
});
