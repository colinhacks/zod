import fs from "node:fs";
import path from "node:path";

const localesDir = "packages/zod/src/v4/locales";
const files = fs.readdirSync(localesDir);

for (const file of files) {
  if (file === "index.ts" || file === "en.ts" || file === "he.ts" || !file.endsWith(".ts")) {
    continue;
  }

  const filePath = path.join(localesDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  if (content.includes("semver:")) {
    console.log(`Skipping ${file} - already has semver`);
    continue;
  }

  // Find FormatDictionary and insert semver: "semver"
  // We look for jwt entry and insert after it, or before template_literal
  if (content.includes("jwt:")) {
    content = content.replace(/(jwt:\s*["'][^"']+["'],?)/, '$1\n    semver: "semver",');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  } else {
    console.warn(`Warning: Could not find jwt entry in ${file}`);
  }
}
