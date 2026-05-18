import * as z from "zod/v4";
import * as zcore from "zod/v4/core";
import { isValidBase64 } from "zod/v4/core";
import { metabench } from "./metabench.js";

const INVALID = Symbol("invalid");
const VALID = "SGVsbG8gV29ybGQ=";
const INVALID_LENGTH = "12345";
const INVALID_WHITESPACE = "SGVsbG8gV29ybGQ= ";

const base64 = z.base64();
const compiled = zcore.compile(base64);
const fastpass = zcore.compileFastpass(base64);

const F = Function;

const manualHoisted = new F(
  "INVALID",
  "isValidBase64",
  `return (input) => {
    if (typeof input !== "string") return INVALID;
    if (!isValidBase64(input)) return INVALID;
    return input;
  };`
)(INVALID, isValidBase64) as (input: unknown) => unknown;

const manualInline = new F(
  "INVALID",
  `return (input) => {
    if (typeof input !== "string") return INVALID;
    if (input === "") return input;
    if (/\\s/.test(input)) return INVALID;
    if (input.length % 4 !== 0) return INVALID;
    try {
      atob(input);
      return input;
    } catch {
      return INVALID;
    }
  };`
)(INVALID) as (input: unknown) => unknown;

const ws = /\s/;
const manualInlineHoistedRegex = new F(
  "INVALID",
  "ws",
  `return (input) => {
    if (typeof input !== "string") return INVALID;
    if (input === "") return input;
    if (ws.test(input)) return INVALID;
    if (input.length % 4 !== 0) return INVALID;
    try {
      atob(input);
      return input;
    } catch {
      return INVALID;
    }
  };`
)(INVALID, ws) as (input: unknown) => unknown;

console.log("=== Correctness ===");
for (const value of [VALID, INVALID_LENGTH, INVALID_WHITESPACE]) {
  console.log(value, {
    runtime: base64.safeParse(value).success,
    helper: isValidBase64(value),
    fastpass: fastpass(value) !== zcore.INVALID,
    hoisted: manualHoisted(value) !== INVALID,
    inline: manualInline(value) !== INVALID,
    inlineHoistedRegex: manualInlineHoistedRegex(value) !== INVALID,
  });
}
console.log("");

await metabench("single z.base64() validator — valid input", {
  "runtime helper direct"() {
    return isValidBase64(VALID);
  },
  "manual hoisted helper"() {
    return manualHoisted(VALID);
  },
  "manual inline body"() {
    return manualInline(VALID);
  },
  "manual inline body + hoisted regex"() {
    return manualInlineHoistedRegex(VALID);
  },
  "compileFastpass(z.base64())"() {
    return fastpass(VALID);
  },
  "z.compile(z.base64()).safeParse"() {
    return compiled.safeParse(VALID);
  },
  "z.base64().safeParse"() {
    return base64.safeParse(VALID);
  },
}).run();

await metabench("single z.base64() validator — invalid length", {
  "runtime helper direct"() {
    return isValidBase64(INVALID_LENGTH);
  },
  "manual hoisted helper"() {
    return manualHoisted(INVALID_LENGTH);
  },
  "manual inline body"() {
    return manualInline(INVALID_LENGTH);
  },
  "manual inline body + hoisted regex"() {
    return manualInlineHoistedRegex(INVALID_LENGTH);
  },
  "compileFastpass(z.base64())"() {
    return fastpass(INVALID_LENGTH);
  },
  "z.compile(z.base64()).safeParse"() {
    return compiled.safeParse(INVALID_LENGTH);
  },
  "z.base64().safeParse"() {
    return base64.safeParse(INVALID_LENGTH);
  },
}).run();

