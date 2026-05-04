import { describe, expect, test } from "vitest";
import * as z from "zod";
import { inputOf, outputOf } from "zod";

describe("z.inputOf / z.outputOf", () => {
  test("flat codec: in/out give the right side", () => {
    const c = z.codec(z.string(), z.bigint(), {
      decode: (s) => BigInt(s),
      encode: (n) => n.toString(),
    });
    expect(inputOf(c).parse("1")).toBe("1");
    expect(outputOf(c).parse(1n)).toBe(1n);
  });

  test("codec nested in object: outputOf works recursively (regression #5224)", () => {
    const c = z.codec(z.string(), z.bigint(), {
      decode: (s) => BigInt(s),
      encode: (n) => n.toString(),
    });
    const obj = z.object({ b: c });

    const decoded = outputOf(obj);
    expect(decoded.parse({ b: 1n })).toEqual({ b: 1n });

    const encoded = inputOf(obj);
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

    const fullCodec = z.codec(
      z.record(inputOf(keyCodec), inputOf(valueObject)),
      z.map(outputOf(keyCodec), outputOf(valueObject)),
      {
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
      }
    );

    expect(fullCodec.decode({ a: { n: "1" } })).toEqual(new Map([["a", { n: 1n }]]));
    expect(fullCodec.encode(new Map([["b", { n: 2n }]]))).toEqual({ b: { n: "2" } });
  });

  test("schema without pipes is returned with identity (no clone)", () => {
    const s = z.object({ a: z.string() });
    expect(inputOf(s)).toBe(s);
    expect(outputOf(s)).toBe(s);
  });
});
