import { describe, expect, test } from "vitest";
import * as z from "zod";

describe("z.iban", () => {
  const valid: [string, string][] = [
    ["Norway (15, minimum)", "NO9386011117947"],
    ["Belgium (16)", "BE68539007547034"],
    ["Netherlands (18)", "NL91ABNA0417164300"],
    ["Germany (22)", "DE89370400440532013000"],
    ["Great Britain (22)", "GB29NWBK60161331926819"],
    ["Turkey (26)", "TR610000100000000000000001"],
    ["France (27)", "FR1420041010050500013M02606"],
    ["Cyprus (28)", "CY17002001280000001200527600"],
    ["Malta (31)", "MT84MALT011000012345MTLCAST001S"],
    ["Maximum length (34)", "AA73AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"],
    ["Maximum length mixed (34)", "ZZ560123456789ABCDEFGHIJKLMNOPQRST"],
  ];

  test.each(valid)("accepts %s", (_label, n) => {
    expect(z.iban().parse(n)).toBe(n);
  });

  test("rejects lowercase characters", () => {
    expect(() => z.iban().parse("no9386011117947")).toThrow();
    expect(() => z.iban().parse("de89370400440532013000")).toThrow();
    expect(() => z.iban().parse("FR1420041010050500013m02606")).toThrow();
  });

  test("rejects spaces and hyphens", () => {
    expect(() => z.iban().parse("NO93 8601 1117 947")).toThrow();
    expect(() => z.iban().parse(" DE89370400440532013000")).toThrow();
    expect(() => z.iban().parse("DE89370400440532013000 ")).toThrow();
    expect(() => z.iban().parse("NO93-8601-1117-947")).toThrow();
    expect(() => z.iban().parse("DE89-3704-0044-0532-0130-00")).toThrow();
  });

  test("rejects special characters", () => {
    expect(() => z.iban().parse("NO938601111794!")).toThrow();
    expect(() => z.iban().parse("DE8937040044053201300@")).toThrow();
    expect(() => z.iban().parse("")).toThrow();
  });

  test("rejects inputs outside length bounds (15-34)", () => {
    expect(() => z.iban().parse("NO938601111794")).toThrow();
    expect(() => z.iban().parse("AA73AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")).toThrow();
  });

  test("rejects invalid check digits (checksum failure)", () => {
    expect(() => z.iban().parse("NO9386011117948")).toThrow();
    expect(() => z.iban().parse("DE89370400440532013001")).toThrow();
    expect(() => z.iban().parse("FR1420041010050500013M02607")).toThrow();
  });

  test("rejects check digits outside 02-98", () => {
    // mod 97 alone accepts all three; `98 - remainder` can only ever emit 02-98
    expect(() => z.iban().parse("DE00000000000000000066")).toThrow();
    expect(() => z.iban().parse("DE01000000000000000048")).toThrow();
    expect(() => z.iban().parse("DE99000000000000000030")).toThrow();
  });

  test("carries the shape regex as its JSON Schema pattern", () => {
    expect(z.toJSONSchema(z.iban())).toMatchObject({
      format: "iban",
      pattern: z.regexes.iban.source,
    });
  });

  test("round-trips through JSON Schema with the checksum intact", () => {
    const schema = z.fromJSONSchema(z.toJSONSchema(z.iban()));
    expect(schema.safeParse("DE89370400440532013000").success).toBe(true);
    expect(schema.safeParse("DE89370400440532013001").success).toBe(false);
  });

  test("error message references IBAN", () => {
    const result = z.iban().safeParse("not-an-iban");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/IBAN/i);
    }
  });
});
