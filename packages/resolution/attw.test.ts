import path from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Are The Types Wrong (attw) tests", () => {
  it("should run attw --pack node_modules/zod and check output", async () => {
    const result = await execa("pnpm", ["attw", "--pack", "node_modules/zod", "--format", "json"], {
      cwd: __dirname,
      reject: false, // Don't throw on non-zero exit codes
    });

    // Combine stdout and stderr for comprehensive output
    const output = result.stdout + (result.stderr ? "\n" + result.stderr : "");

    expect(output.trim()).toMatchInlineSnapshot(`
      "zod v3.25.67

      🎭 Import resolved to a CommonJS type declaration file, but an ESM JavaScript file. https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseCJS.md


      [90m┌───────────────────[39m[90m┬────────────────────[39m[90m┬────────────────────────[39m[90m┬────────────────────────[39m[90m┬────────────────────────[39m[90m┬────────────────────────[39m[90m┬────────────────────────[39m[90m┬────────────────────────[39m[90m┬────────────────────────[39m[90m┬────────────────────┐[39m
      [90m│[39m[31m                   [39m[90m│[39m[31m "zod/package.json" [39m[90m│[39m[31m "zod"                  [39m[90m│[39m[31m "zod/v3"               [39m[90m│[39m[31m "zod/v4"               [39m[90m│[39m[31m "zod/v4-mini"          [39m[90m│[39m[31m "zod/v4/mini"          [39m[90m│[39m[31m "zod/v4/core"          [39m[90m│[39m[31m "zod/v4/locales"       [39m[90m│[39m[31m "zod/v4/locales/*" [39m[90m│[39m
      [90m├───────────────────[39m[90m┼────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────┤[39m
      [90m│[39m node10            [90m│[39m 🟢 (JSON)          [90m│[39m 🟢                     [90m│[39m 🟢                     [90m│[39m 🟢                     [90m│[39m 🟢                     [90m│[39m 🟢                     [90m│[39m 🟢                     [90m│[39m 🟢                     [90m│[39m (wildcard)         [90m│[39m
      [90m├───────────────────[39m[90m┼────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────┤[39m
      [90m│[39m node16 (from CJS) [90m│[39m 🟢 (JSON)          [90m│[39m 🟢 (CJS)               [90m│[39m 🟢 (CJS)               [90m│[39m 🟢 (CJS)               [90m│[39m 🟢 (CJS)               [90m│[39m 🟢 (CJS)               [90m│[39m 🟢 (CJS)               [90m│[39m 🟢 (CJS)               [90m│[39m (wildcard)         [90m│[39m
      [90m├───────────────────[39m[90m┼────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────┤[39m
      [90m│[39m node16 (from ESM) [90m│[39m 🟢 (JSON)          [90m│[39m 🎭 Masquerading as CJS [90m│[39m 🎭 Masquerading as CJS [90m│[39m 🎭 Masquerading as CJS [90m│[39m 🎭 Masquerading as CJS [90m│[39m 🎭 Masquerading as CJS [90m│[39m 🎭 Masquerading as CJS [90m│[39m 🎭 Masquerading as CJS [90m│[39m (wildcard)         [90m│[39m
      [90m├───────────────────[39m[90m┼────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────────[39m[90m┼────────────────────┤[39m
      [90m│[39m bundler           [90m│[39m 🟢 (JSON)          [90m│[39m 🟢                     [90m│[39m 🟢                     [90m│[39m 🟢                     [90m│[39m 🟢                     [90m│[39m 🟢                     [90m│[39m 🟢                     [90m│[39m 🟢                     [90m│[39m (wildcard)         [90m│[39m
      [90m└───────────────────[39m[90m┴────────────────────[39m[90m┴────────────────────────[39m[90m┴────────────────────────[39m[90m┴────────────────────────[39m[90m┴────────────────────────[39m[90m┴────────────────────────[39m[90m┴────────────────────────[39m[90m┴────────────────────────[39m[90m┴────────────────────┘[39m"
    `);
  }, 30000); // 30 second timeout for the command
});
