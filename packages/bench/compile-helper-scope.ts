import * as z from "zod/v4";
import * as zcore from "zod/v4/core";
import { isValidBase64URL, isValidJWT, parseValidURL } from "zod/v4/core";
import { metabench } from "./metabench.js";

const DATA = Array.from({ length: 1000 }, () => "SGVsbG8gV29ybGQ");
const JWT_DATA = Array.from({ length: 1000 }, () => "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature");
const URL_DATA = Array.from({ length: 1000 }, () => "  https://example.com/path?x=1  ");

const base64url = z.string().base64url();
const compiledBase64url = zcore.compile(base64url);
const fastBase64url = zcore.compileFastpass(base64url);

const jwt = z.jwt();
const compiledJwt = zcore.compile(jwt);
const fastJwt = zcore.compileFastpass(jwt);

const url = z.url();
const compiledUrl = zcore.compile(url);
const fastUrl = zcore.compileFastpass(url);

function makeScopedValidator(extraConstants: number) {
  const names = ["helper"];
  const values: unknown[] = [isValidBase64URL];
  for (let i = 0; i < extraConstants; i++) {
    names.push(`unused${i}`);
    values.push({ i });
  }
  const F = Function;
  const factory = new F(...names, `return (input) => helper(input);`);
  return factory(...values) as (input: string) => boolean;
}

const scoped1 = makeScopedValidator(0);
const scoped10 = makeScopedValidator(10);
const scoped50 = makeScopedValidator(50);

console.log("=== Correctness ===");
console.log("base64url runtime:", base64url.safeParse(DATA[0]).success);
console.log("base64url compiled:", compiledBase64url.safeParse(DATA[0]).success);
console.log("base64url fast:", fastBase64url(DATA[0]) !== zcore.INVALID);
console.log("jwt runtime:", jwt.safeParse(JWT_DATA[0]).success);
console.log("jwt compiled:", compiledJwt.safeParse(JWT_DATA[0]).success);
console.log("url runtime:", url.safeParse(URL_DATA[0]).success);
console.log("url compiled:", compiledUrl.safeParse(URL_DATA[0]).success);
console.log("");

await metabench("compiled string-format helpers", {
  "base64url direct helper"() {
    for (const d of DATA) isValidBase64URL(d);
  },
  "base64url compileFastpass"() {
    for (const d of DATA) fastBase64url(d);
  },
  "base64url compiled.safeParse"() {
    for (const d of DATA) compiledBase64url.safeParse(d);
  },
  "base64url zod.safeParse"() {
    for (const d of DATA) base64url.safeParse(d);
  },
  "jwt direct helper"() {
    for (const d of JWT_DATA) isValidJWT(d);
  },
  "jwt compileFastpass"() {
    for (const d of JWT_DATA) fastJwt(d);
  },
  "jwt compiled.safeParse"() {
    for (const d of JWT_DATA) compiledJwt.safeParse(d);
  },
  "jwt zod.safeParse"() {
    for (const d of JWT_DATA) jwt.safeParse(d);
  },
  "url direct helper"() {
    for (const d of URL_DATA) parseValidURL(d, url._zod.def as any);
  },
  "url compileFastpass"() {
    for (const d of URL_DATA) fastUrl(d);
  },
  "url compiled.safeParse"() {
    for (const d of URL_DATA) compiledUrl.safeParse(d);
  },
  "url zod.safeParse"() {
    for (const d of URL_DATA) url.safeParse(d);
  },
}).run();

await metabench("closure scope constant count (runtime)", {
  "1 scoped helper"() {
    for (const d of DATA) scoped1(d);
  },
  "1 helper + 10 unused constants"() {
    for (const d of DATA) scoped10(d);
  },
  "1 helper + 50 unused constants"() {
    for (const d of DATA) scoped50(d);
  },
}).run();

await metabench("closure scope constant count (construction)", {
  "construct 1 scoped helper"() {
    makeScopedValidator(0);
  },
  "construct helper + 10 constants"() {
    makeScopedValidator(10);
  },
  "construct helper + 50 constants"() {
    makeScopedValidator(50);
  },
}).run();
