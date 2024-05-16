import string from "./string.ts";
import number from "./number.ts";
import boolean from "./boolean.ts";
import datetime from "./datetime.ts";
import object from "./object.ts";
import objectSafe from "./object-safe.ts";
import objectAsync from "./object-async.ts";
import objectSafeAsync from "./object-safeasync.ts";
import objectSmallFail from "./object-fail.ts";
import objectMoltar from "./object-moltar.ts";
import union from "./union.ts";
import discriminatedUnion from "./discriminated-union.ts";
import ipv4Regex from "./ipv4-regex.ts";
import datetimeRegex from "./datetime-regex.ts";
import instanceofBench from "./instanceof.ts";

const argv = new Set(process.argv.slice(2));

if (!argv.size) {
  throw new Error("No benchmarks specified");
}

const ALL = argv.has("--all");

async function run() {
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
    await object();
  }
  if (ALL || argv.has("--object-safe")) {
    await objectSafe();
  }
  if (ALL || argv.has("--object-async")) {
    await objectAsync();
  }
  if (ALL || argv.has("--object-safeasync")) {
    await objectSafeAsync();
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
  if (ALL || argv.has("--instanceof")) {
    await instanceofBench();
  }
}

run();
// exit on Ctrl-C
process.on("SIGINT", function () {
  console.log("Exiting...");
  process.exit();
});
