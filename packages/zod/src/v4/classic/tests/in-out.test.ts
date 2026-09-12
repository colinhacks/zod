import { describe, expect, test } from "vitest";
import * as z from "zod";

describe("z.input / z.output", () => {
  test("flat codec: input/output give the right side", () => {
    const c = z.codec(z.string(), z.bigint(), {
      decode: (s) => BigInt(s),
      encode: (n) => n.toString(),
    });
    expect(z.input(c).parse("1")).toBe("1");
    expect(z.output(c).parse(1n)).toBe(1n);
  });

  test("codec nested in object: output works recursively (regression #5224)", () => {
    const c = z.codec(z.string(), z.bigint(), {
      decode: (s) => BigInt(s),
      encode: (n) => n.toString(),
    });
    const obj = z.object({ b: c });

    const decoded = z.output(obj);
    expect(decoded.parse({ b: 1n })).toEqual({ b: 1n });

    const encoded = z.input(obj);
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
      z.record(z.input(keyCodec), z.input(valueObject)),
      z.map(z.output(keyCodec), z.output(valueObject)),
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
    expect(z.input(s)).toBe(s);
    expect(z.output(s)).toBe(s);
  });

  test("z.output carries checks attached to a pipe", () => {
    const c = z
      .codec(z.string(), z.number().int(), { decode: Number, encode: String })
      .refine((n) => n > 10, { error: "gt10" });
    const obj = z.object({ list: z.array(c) });
    const decoded = z.output(obj);

    expect(decoded.parse({ list: [50] })).toEqual({ list: [50] });
    // The pipe's own check and the one already on its out side both survive, in that order.
    expect(() => decoded.parse({ list: [5] })).toThrow("gt10");
    expect(() => decoded.parse({ list: [50.5] })).toThrow();
    // A pipe's checks run on the decoded value in both directions, so encode enforces them too.
    expect(() => decoded.encode({ list: [5] })).toThrow("gt10");
    // Carrying them clones the out side rather than mutating it.
    expect(c._zod.def.out._zod.def.checks).toHaveLength(1);
  });

  test("z.input drops a pipe's checks, which constrain a value the input side never produces", () => {
    const c = z.codec(z.string(), z.number(), { decode: Number, encode: String }).refine((n) => n > 10);
    expect(z.input(c).parse("5")).toBe("5");

    // Control: a check that isn't attached to a pipe is left alone.
    expect(() => z.input(z.object({ s: z.string().min(2) })).parse({ s: "a" })).toThrow();
  });

  test("z.input resolves past a preprocess transform, which is not a real input side", () => {
    const p = z.preprocess((v) => String(v), z.string().min(5));
    const encoded = z.input(p);

    expect(encoded.parse("abcde")).toBe("abcde");
    // The bare transform used to come back here: it validated nothing and re-ran the preprocessor.
    expect(() => encoded.parse(1)).toThrow();
    expect(() => encoded.parse("abc")).toThrow();
    // The same resolution the JSON Schema emitter already makes for this schema.
    expect(z.toJSONSchema(p, { io: "input" })).toMatchObject({ type: "string", minLength: 5 });

    // A check on the pipe itself travels with whichever side wins.
    const checked = z.preprocess((v) => String(v), z.string()).refine((s) => s.startsWith("ok"));
    expect(z.input(checked).parse("okay")).toBe("okay");
    expect(() => z.input(checked).parse("nope")).toThrow();

    // Control: a codec has two real sides, so its input side is still `in`, by identity.
    const c = z.codec(z.string(), z.number(), { decode: Number, encode: String });
    expect(z.input(c)).toBe(c._zod.def.in);
  });

  test("a wrapper's stored value survives only on the side it belongs to", () => {
    const c = z.codec(z.string(), z.number(), { decode: Number, encode: String });

    // A default and a catch hold output-side values, so the input projection sheds them.
    expect(z.input(c.default(7)).parse(undefined)).toBe(undefined);
    expect(z.input(c.default(7)).parse("1")).toBe("1");
    expect(() => z.input(c.catch(9)).parse(123 as any)).toThrow();
    expect(z.input(c.catch(9)).parse("1")).toBe("1");
    expect(z.output(c.default(7)).parse(undefined)).toBe(7);
    expect(z.output(c.catch(9)).parse("zz" as any)).toBe(9);

    // A prefault is fed through the schema, so it is input-side and the output projection sheds it.
    expect(z.input(c.prefault("5")).parse(undefined)).toBe("5");
    expect(() => z.output(c.prefault("5")).parse(undefined as any)).toThrow();
    expect(z.output(c.prefault("5")).parse(3)).toBe(3);
  });

  test("a wrapper over a pipe-free schema keeps both its value and its identity", () => {
    const d = z.string().default("x");
    const k = z.string().catch("y");
    const f = z.string().prefault("z");

    expect(z.input(d)).toBe(d);
    expect(z.input(d).parse(undefined)).toBe("x");
    expect(z.input(k)).toBe(k);
    expect(z.output(f)).toBe(f);

    const obj = z.object({ a: z.string().default("q") });
    expect(z.input(obj)).toBe(obj);
    expect(z.input(obj).parse({})).toEqual({ a: "q" });
  });

  test("runtime `z.input` agrees with type-level `z.input<T>`", () => {
    const c = z.codec(z.string(), z.bigint(), {
      decode: (s) => BigInt(s),
      encode: (n) => n.toString(),
    });
    const obj = z.object({ b: c });

    // Runtime: parse the input shape.
    const parsed = z.input(obj).parse({ b: "1" });
    // Type: matches the declared input type.
    const asType: z.input<typeof obj> = parsed;
    expect(asType).toEqual({ b: "1" });
  });
});
