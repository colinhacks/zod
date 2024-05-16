import string from "./string.ts";
import number from "./number.ts";
import boolean from "./boolean.ts";
import datetime from "./datetime.ts";
import objectSmall from "./object.ts";
import objectSmallFail from "./object-fail.ts";
import objectMoltar from "./object-moltar.ts";
import union from "./union.ts";
import discriminatedUnion from "./discriminated-union.ts";
import ipv4Regex from "./ipv4-regex.ts";
import datetimeRegex from "./datetime-regex.ts";

const argv = new Set(process.argv.slice(2));

if (!argv.size) {
  throw new Error("No benchmarks specified");
}

const ALL = argv.has("--all");

if (ALL || argv.has("--string")) {
  await string();
}
if (ALL || argv.has("--number")) {
  await number();
}
if (ALL || argv.has("--boolean")) {
  await boolean();
}
if (ALL || argv.has("--datetime")) {
  await datetime();
}
if (ALL || argv.has("--object")) {
  await objectSmall();
}
if (ALL || argv.has("--object-fail")) {
  await objectSmallFail();
}
if (ALL || argv.has("--object-moltar")) {
  await objectMoltar();
}
if (ALL || argv.has("--union")) {
  await union();
}
if (ALL || argv.has("--discriminated-union")) {
  await discriminatedUnion();
}
if (ALL || argv.has("--ipv4-regex")) {
  await ipv4Regex();
}
if (ALL || argv.has("--datetime-regex")) {
  await datetimeRegex();
}

// exit on Ctrl-C
process.on("SIGINT", function () {
  console.log("Exiting...");
  process.exit();
});
