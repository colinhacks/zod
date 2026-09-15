/**
 * Sanity-checks the measurement harness against allocations of known size.
 * If these controls don't land near their theoretical sizes, no zod number
 * produced by the same harness is trustworthy.
 */
import { fmtBytes, measureStable, table } from "./harness.js";

const N = 20_000;

const controls: Array<[string, string, (i: number) => unknown]> = [
  ["{}", "~32 B", () => ({})],
  ["{a:1,b:2,c:3}", "~56 B", () => ({ a: 1, b: 2, c: 3 })],
  ["new Array(10)", "~120 B", () => new Array(10).fill(0)],
  ["new Set()", "~100 B", () => new Set()],
  ["new Set(['a','b','c'])", "~200 B", () => new Set(["a", "b", "c"])],
  ["new Map()", "~100 B", () => new Map()],
  ["closure over 1 var", "~100 B", (i) => () => i],
  ["new Uint8Array(1024)", "~1088 B", () => new Uint8Array(1024)],
  ["10-char string", "~40 B", (i) => `str-${i}-xxxx`.slice(0, 10) + String(i)],
  [
    "obj w/ getter (defineProperty)",
    "~200 B",
    () => {
      const o: any = {};
      Object.defineProperty(o, "x", { get: () => 1, configurable: true });
      return o;
    },
  ],
];

console.log(`harness calibration, n=${N}\n`);

table(
  controls.map(([label, expected, factory]) => {
    const m = measureStable(label, N, factory, 5);
    return { control: label, expected, measured: fmtBytes(m.bytesEach), bytes: m.bytesEach.toFixed(0) };
  })
);
