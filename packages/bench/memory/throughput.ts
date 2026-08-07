/**
 * Construction and parse throughput, so memory work can be shown not to cost
 * speed. Reports ops/sec; compare runs across commits.
 */
import * as z from "zod";
import { table } from "./harness.js";

function bench(label: string, fn: () => void, ms = 800): { label: string; opsPerSec: number } {
  // Warm up so the JIT has tiered up before timing.
  for (let i = 0; i < 5_000; i++) fn();

  let ops = 0;
  const start = process.hrtime.bigint();
  const budget = BigInt(ms) * 1_000_000n;
  while (process.hrtime.bigint() - start < budget) {
    for (let i = 0; i < 200; i++) fn();
    ops += 200;
  }
  const elapsed = Number(process.hrtime.bigint() - start) / 1e9;
  return { label, opsPerSec: ops / elapsed };
}

const shape = { a: z.string(), b: z.number(), c: z.boolean() };
const objSchema = z.object(shape);
const strSchema = z.string();
const minSchema = z.string().min(1);
const arrSchema = z.array(z.string());
const unionSchema = z.union([z.string(), z.number()]);
const data = { a: "x", b: 1, c: true };
const arrData = ["a", "b", "c", "d"];

const results = [
  // construction
  bench("construct z.string()", () => void z.string()),
  bench("construct z.number()", () => void z.number()),
  bench("construct z.bigint()", () => void z.bigint()),
  bench("construct z.object(3)", () => void z.object({ a: z.string(), b: z.number(), c: z.boolean() })),
  bench("construct z.array(str)", () => void z.array(z.string())),
  bench("construct .min(1)", () => void z.string().min(1)),
  // parsing (hot path must not regress)
  bench("parse string", () => void strSchema.parse("hello")),
  bench("parse string.min", () => void minSchema.parse("hello")),
  bench("parse object(3)", () => void objSchema.parse(data)),
  bench("parse array(4)", () => void arrSchema.parse(arrData)),
  bench("parse union", () => void unionSchema.parse("hi")),
  bench("safeParse object", () => void objSchema.safeParse(data)),
  // method access (the lazy-bind getters)
  bench("first .optional() on new", () => void z.string().optional()),
  bench("first .email() on new", () => void z.string().email()),
];

table(results.map((r) => ({ bench: r.label, "ops/sec": Math.round(r.opsPerSec).toLocaleString() })));
