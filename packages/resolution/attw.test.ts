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
    expect(outputWithoutFirstLine).toMatchInlineSnapshot();
  }, 30000); // 30 second timeout for the command
});
