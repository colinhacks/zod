/**
 * How much does an own property actually cost when it's added by assignment
 * to an object V8 couldn't slack-track (created by a generic constructor that
 * assigns nothing itself)? This is the shape every zod schema instance has,
 * so it sets the payoff for moving methods to the prototype.
 */
import { fmtBytes, measureStable, table } from "./harness.js";

// A constructor that assigns nothing, so V8 infers zero in-object slots and every property lands in a growable backing store — same as $constructor.
function Empty(this: any) {}

function withProps(n: number): () => unknown {
  return () => {
    const o: any = new (Empty as any)();
    for (let i = 0; i < n; i++) o[`p${i}`] = i;
    return o;
  };
}

// Same, but properties defined all at once from a literal (fast path).
function literalProps(n: number): () => unknown {
  const keys = Array.from({ length: n }, (_, i) => `p${i}`);
  return () => {
    const o: any = {};
    for (const k of keys) o[k] = 0;
    return o;
  };
}

const counts = [0, 4, 8, 12, 16, 20, 23, 25, 30, 40];

table(
  counts.map((n) => {
    const a = measureStable(`ctor+${n}`, 20_000, withProps(n), 5);
    const b = measureStable(`lit+${n}`, 20_000, literalProps(n), 5);
    return {
      "own props": n,
      "via generic ctor": fmtBytes(a.bytesEach),
      bytes: a.bytesEach.toFixed(0),
      "via plain literal": fmtBytes(b.bytesEach),
      "per prop": n ? (a.bytesEach / n).toFixed(0) : "-",
    };
  })
);
