import { readFileSync, writeFileSync } from "node:fs";

const packageJsonPath = "./package.json";

try {
  // Read the package.json file
  const packageJson = readFileSync(packageJsonPath, "utf-8");

  // Replace occurrences of "types": "./dist/commonjs/ with "types": "./dist/esm/
  const updatedPackageJson = packageJson.replace(/"types": "\.\/dist\/commonjs\//g, '"types": "./dist/esm/');

  // Write the updated content back to package.json
  writeFileSync(packageJsonPath, updatedPackageJson, "utf-8");

  console.log('Successfully updated "types" paths in package.json');
} catch (error) {
  console.error("Error updating package.json:", error);
}
