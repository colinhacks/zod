import string from "./string.mjs";
import number from "./number.mjs";
import boolean from "./boolean.mjs";
import datetime from "./datetime.mjs";
import objectSmall from "./object-small.mjs";
import objectSmallFail from "./object-small-fail.mjs";
import objectMoltar from "./object-moltar.mjs";
import union from "./union.mjs";
import discriminatedUnion from "./discriminated-union.mjs";
import ipv4Regex from "./ipv4-regex.mjs";
import datetimeRegex from "./datetime-regex.mjs";

const argv = process.argv.slice(2);

if (!argv.length) {
  throw new Error("No benchmarks specified");
} else {
  if (argv.includes("--string")) {
    await string();
  }
  if (argv.includes("--number")) {
    await number();
  }
  if (argv.includes("--boolean")) {
    await boolean();
  }
  if (argv.includes("--datetime")) {
    await datetime();
  }
  if (argv.includes("--object-small")) {
    await objectSmall();
  }
  if (argv.includes("--object-small-fail")) {
    await objectSmallFail();
  }
  if (argv.includes("--object-moltar")) {
    await objectMoltar();
  }
  if (argv.includes("--union")) {
    await union();
  }
  if (argv.includes("--discriminated-union")) {
    await discriminatedUnion();
  }
  if (argv.includes("--ipv4-regex")) {
    await ipv4Regex();
  }
  if (argv.includes("--datetime-regex")) {
    await datetimeRegex();
  }
}

// exit on Ctrl-C
process.on("SIGINT", function () {
  console.log("Exiting...");
  process.exit();
});
