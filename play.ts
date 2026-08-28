import { z } from "zod";
import * as m from "zod/mini";
declare const gc: () => void;
const TAG = process.env.TAG ?? "?";
let sink = 0;
function bench(label: string, body: () => void, iters: number) {
  for (let i = 0; i < 4; i++) body();
  const s: number[] = [];
  for (let k = 0; k < 15; k++) { if (typeof gc === "function") gc(); const t0 = process.hrtime.bigint(); body(); s.push(Number(process.hrtime.bigint() - t0) / iters); }
  s.sort((a, b) => a - b);
  console.log(`RESULT ${TAG} ${label} ${s[0].toFixed(2)}`);
}
const A = 150_000, B = 30_000, C = 6_000;
const User = z.object({ id: z.string(), age: z.number(), tags: z.array(z.string()), email: z.email() });
const data = { id: "x", age: 3, tags: ["a"], email: "a@b.co" };
bench("string-ctor", () => { for (let j = 0; j < A; j++) sink += z.string() ? 0 : 1; }, A);
bench("number-ctor", () => { for (let j = 0; j < A; j++) sink += z.number() ? 0 : 1; }, A);
bench("object2-ctor", () => { for (let j = 0; j < B; j++) sink += z.object({ a: z.string(), b: z.number() }) ? 0 : 1; }, B);
bench("array-ctor", () => { for (let j = 0; j < B; j++) sink += z.array(z.string()) ? 0 : 1; }, B);
bench("moltar-ctor", () => { for (let j = 0; j < C; j++) sink += z.object({ id: z.string(), age: z.number(), tags: z.array(z.string()), email: z.email(), nested: z.object({ a: z.string(), b: z.number(), c: z.boolean() }) }) ? 0 : 1; }, C);
bench("clone-ctor", () => { for (let j = 0; j < B; j++) sink += z.string().min(1).max(9) ? 0 : 1; }, B);
bench("mini-string-ctor", () => { for (let j = 0; j < A; j++) sink += m.string() ? 0 : 1; }, A);
bench("mini-object-ctor", () => { for (let j = 0; j < B; j++) sink += m.object({ a: m.string(), b: m.number() }) ? 0 : 1; }, B);
bench("object-parse", () => { for (let j = 0; j < B; j++) sink += User.parse(data) ? 0 : 1; }, B);
bench("string-parse", () => { const s2 = z.string(); for (let j = 0; j < A; j++) sink += s2.parse("hello") ? 0 : 1; }, A);
if (sink === -1) console.log(sink);
