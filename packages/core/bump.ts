import { execa } from "execa";
import { version } from "./src/versions.js";

const $ = execa({ stdout: "inherit", stderr: "inherit" });

console.log(version);
const coreVersion = `${version.major}.${version.minor}.${version.patch}`;

await $(`pnpm`, ["version", coreVersion, "--allow-same-version"]);
