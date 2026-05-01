import { describe, expect, test } from "vitest";
import * as z from "zod";

describe("z.latitude / z.longitude (classic)", () => {
  test("latitude accepts valid bounds and rejects out-of-range", () => {
    const lat = z.latitude();
    expect(lat.parse(0)).toBe(0);
    expect(lat.parse(45.5)).toBe(45.5);
    expect(lat.parse(-90)).toBe(-90); // inclusive lower bound
    expect(lat.parse(90)).toBe(90); // inclusive upper bound
    expect(() => lat.parse(-90.0001)).toThrow();
    expect(() => lat.parse(90.0001)).toThrow();
    expect(() => lat.parse(91)).toThrow();
    expect(() => lat.parse(-180)).toThrow();
  });

  test("longitude accepts valid bounds and rejects out-of-range", () => {
    const lng = z.longitude();
    expect(lng.parse(0)).toBe(0);
    expect(lng.parse(135.7)).toBe(135.7);
    expect(lng.parse(-180)).toBe(-180);
    expect(lng.parse(180)).toBe(180);
    expect(() => lng.parse(-180.0001)).toThrow();
    expect(() => lng.parse(180.0001)).toThrow();
    expect(() => lng.parse(360)).toThrow();
  });

  test("rejects non-number input", () => {
    expect(() => z.latitude().parse("45" as any)).toThrow();
    expect(() => z.longitude().parse(null as any)).toThrow();
  });

  test("z.number().latitude() chainable form is equivalent to z.latitude()", () => {
    expect(z.number().latitude().parse(45)).toBe(45);
    expect(() => z.number().latitude().parse(91)).toThrow();
    expect(z.number().longitude().parse(135)).toBe(135);
    expect(() => z.number().longitude().parse(181)).toThrow();
  });

  test("composes with other number checks", () => {
    // Constrain to integer latitudes only
    const intLat = z.number().int().latitude();
    expect(intLat.parse(45)).toBe(45);
    expect(() => intLat.parse(45.5)).toThrow(); // not int
    expect(() => intLat.parse(91)).toThrow(); // out of range
  });

  test("propagates the inferred output type as `number`", () => {
    const lat = z.latitude();
    type T = z.output<typeof lat>;
    // Mutual-extends check: T is exactly `number`, not a sub/supertype.
    type _assert = [T] extends [number] ? ([number] extends [T] ? true : false) : false;
    const _: _assert = true;
    void _;
  });

  test("error messages reference the actual bound (no new error code)", () => {
    const result = z.latitude().safeParse(91);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Issue should be from the existing too_big check, not a new
      // `not_latitude` code — confirms the sugar approach didn't grow
      // the public issue surface.
      expect(result.error.issues[0]?.code).toBe("too_big");
    }
  });
});
