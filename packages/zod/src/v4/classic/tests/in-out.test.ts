import { describe, expect, test } from "vitest";
import * as z from "zod";
import { inputOf, outputOf } from "zod";

describe("z.in / z.out", () => {
  test("flat codec: in/out give the right side", () => {
    const c = z.codec(z.string(), z.bigint(), {
      decode: (s) => BigInt(s),
      encode: (n) => n.toString(),
    });
    expect(z.in(c).parse("1")).toBe("1");
    expect(z.out(c).parse(1n)).toBe(1n);
  });

  test("codec nested in object: out works recursively (regression #5224)", () => {
    const c = z.codec(z.string(), z.bigint(), {
      decode: (s) => BigInt(s),
      encode: (n) => n.toString(),
    });
    const obj = z.object({ b: c });

    // z.out replaces the codec with its output side; the resulting
    // object schema accepts the decoded shape directly.
    const decoded = z.out(obj);
    expect(decoded.parse({ b: 1n })).toEqual({ b: 1n });

    // z.in replaces the codec with its input side; the resulting object
    // schema accepts the encoded shape directly.
    const encoded = z.in(obj);
    expect(encoded.parse({ b: "1" })).toEqual({ b: "1" });
  });

  test("nested across record / map: matches the use case in #5224", () => {
    const keyCodec = z.codec(z.string(), z.enum(["a", "b"]), {
      decode: (s) => (s === "a" || s === "b" ? s : z.NEVER),
      encode: (s) => s,
    });
    const valueObject = z.object({
      n: z.codec(z.string(), z.bigint(), { decode: (s) => BigInt(s), encode: (n) => n.toString() }),
    });

    const fullCodec = z.codec(z.record(z.in(keyCodec), z.in(valueObject)), z.map(z.out(keyCodec), z.out(valueObject)), {
      decode: (input) => {
        const m = new Map<"a" | "b", { n: bigint }>();
        for (const [k, v] of Object.entries(input)) {
          m.set(keyCodec.decode(k), valueObject.decode(v));
        }
        return m;
      },
      encode: (input) => {
        const out: Record<string, { n: string }> = {};
        for (const [k, v] of input.entries()) {
          out[keyCodec.encode(k)] = valueObject.encode(v);
        }
        return out;
      },
    });

    expect(fullCodec.decode({ a: { n: "1" } })).toEqual(new Map([["a", { n: 1n }]]));
    expect(fullCodec.encode(new Map([["b", { n: 2n }]]))).toEqual({ b: { n: "2" } });
  });

  test("inputOf / outputOf are destructure-safe aliases", () => {
    const c = z.codec(z.string(), z.bigint(), {
      decode: (s) => BigInt(s),
      encode: (n) => n.toString(),
    });
    expect(inputOf(c).parse("1")).toBe("1");
    expect(outputOf(c).parse(1n)).toBe(1n);
    // Same identity as the keyword forms.
    expect(inputOf).toBe(z.in);
    expect(outputOf).toBe(z.out);
  });

  test("schema without pipes is returned untouched (semantically)", () => {
    const s = z.object({ a: z.string() });
    expect(z.in(s).parse({ a: "x" })).toEqual({ a: "x" });
    expect(z.out(s).parse({ a: "x" })).toEqual({ a: "x" });
  });
});
