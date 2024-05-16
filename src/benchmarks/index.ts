import string from "./string";
import number from "./number";
import boolean from "./boolean";
import datetime from "./datetime";
import object from "./object";
import objectSafe from "./object-safe";
import objectAsync from "./object-async";
import objectSafeAsync from "./object-safeasync";
import objectSmallFail from "./object-fail";
import objectMoltar from "./object-moltar";
import union from "./union";
import discriminatedUnion from "./discriminated-union";
import ipv4Regex from "./ipv4-regex";
import datetimeRegex from "./datetime-regex";
import instanceofBench from "./instanceof";

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
