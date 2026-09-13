import * as z from "zod";
import { measureStable } from "./memory/harness.js";

const N = 5_000;

const shape = (k: number) => {
  const s: Record<string, z.ZodType> = {};
  for (let i = 0; i < k; i++) s[`k${i}`] = z.string();
  return s;
};
const sample = (k: number) => Object.fromEntries(Array.from({ length: k }, (_, i) => [`k${i}`, "v"]));

for (const k of [3, 10]) {
  const input = sample(k);
  const rows: Array<[string, (i: number) => unknown]> = [
    [`z.object() ${k} keys, cold`, () => z.object(shape(k))],
    [
      `z.object() ${k} keys, + safeParse`,
      () => {
        const s = z.object(shape(k));
        s.safeParse(input);
        return s;
      },
    ],
    [
      `z.object() ${k} keys, + safeParse + validate`,
      () => {
        const s = z.object(shape(k));
        s.safeParse(input);
        z.validate(s, input);
        return s;
      },
    ],
    [
      `z.object() ${k} keys, + validate only`,
      () => {
        const s = z.object(shape(k));
        z.validate(s, input);
        return s;
      },
    ],
  ];
  for (const [label, factory] of rows) {
    const m = measureStable(label, N, factory);
    console.log(`${label.padEnd(42)} ${m.bytesEach.toFixed(0).padStart(8)} B`);
  }
  console.log();
}
