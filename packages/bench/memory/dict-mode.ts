/**
 * Reports whether schema instances and their `_zod` internals are in V8
 * dictionary (slow) mode. A dictionary-mode object pays a NameDictionary
 * backing store — roughly 900 B at these property counts — instead of inline
 * slots, and every property read goes through a hash lookup.
 *
 * Run with: node --allow-natives-syntax --import tsx
 */
import * as z from "zod";
import { table } from "./harness.js";

// biome-ignore lint/security/noGlobalEval: V8 natives syntax is not valid in a module body.
const hasFast: (o: object) => boolean = eval("(o) => %HasFastProperties(o)");

const cases: Array<[string, () => any]> = [
  ["z.string()", () => z.string()],
  ["z.number()", () => z.number()],
  ["z.boolean()", () => z.boolean()],
  ["z.bigint()", () => z.bigint()],
  ["z.object({a})", () => z.object({ a: z.string() })],
  ["z.array(str)", () => z.array(z.string())],
  ["z.string().min(1)", () => z.string().min(1)],
  ["z.string().optional()", () => z.string().optional()],
  ["z.email()", () => z.email()],
  ["z.enum(['a'])", () => z.enum(["a"])],
];

// Reference points so the reader can see what fast/slow looks like.
const plain: any = { a: 1, b: 2 };
const forcedSlow: any = {};
Object.defineProperty(forcedSlow, "x", { value: 1, enumerable: false });

console.log(
  `reference: plain literal fast=${hasFast(plain)}, non-enumerable defineProperty fast=${hasFast(forcedSlow)}\n`
);

// two instances each, because the first is not representative: an own accessor transitions cleanly on instance #1 and normalizes every one after it, so a one-instance report says `fast` for a type that is DICT for the rest of the program
table(
  cases.map(([label, f]) => {
    const s = f();
    const second = f();
    return {
      schema: label,
      "inst fast?": hasFast(s) ? "fast" : "DICT",
      "2nd inst": hasFast(second) ? "fast" : "DICT",
      "inst props": Reflect.ownKeys(s).length,
      "_zod fast?": hasFast(s._zod) ? "fast" : "DICT",
      "_zod props": Reflect.ownKeys(s._zod).length,
      "def fast?": hasFast(s._zod.def) ? "fast" : "DICT",
    };
  })
);

// Bisect: which operation in the constructor tips the instance over?
console.log("\nwhat forces dictionary mode:");
const probes: Array<[string, (o: any) => void]> = [
  [
    "plain assignment x25",
    (o) => {
      for (let i = 0; i < 25; i++) o[`p${i}`] = i;
    },
  ],
  [
    "defineProperty all-true x25",
    (o) => {
      for (let i = 0; i < 25; i++)
        Object.defineProperty(o, `p${i}`, { value: i, writable: true, enumerable: true, configurable: true });
    },
  ],
  ["defineProperty enumerable:false x1", (o) => Object.defineProperty(o, "z", { value: 1, enumerable: false })],
  ["defineProperty value-only x1", (o) => Object.defineProperty(o, "z", { value: 1 })],
  ["defineProperty getter x1", (o) => Object.defineProperty(o, "z", { get: () => 1, configurable: true })],
];
table(
  probes.map(([label, apply]) => {
    const o: any = {};
    apply(o);
    return { operation: label, result: hasFast(o) ? "fast" : "DICT" };
  })
);
