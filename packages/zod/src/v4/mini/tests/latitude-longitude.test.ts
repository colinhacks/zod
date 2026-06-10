import { describe, expect, test } from "vitest";
import * as z from "zod/v4-mini";

describe("z.latitude / z.longitude (mini)", () => {
  test("latitude bounds", () => {
    const lat = z.latitude();
    expect(z.parse(lat, 0)).toBe(0);
    expect(z.parse(lat, -90)).toBe(-90);
    expect(z.parse(lat, 90)).toBe(90);
    expect(() => z.parse(lat, 91)).toThrow();
    expect(() => z.parse(lat, -91)).toThrow();
  });

  test("longitude bounds", () => {
    const lng = z.longitude();
    expect(z.parse(lng, 0)).toBe(0);
    expect(z.parse(lng, -180)).toBe(-180);
    expect(z.parse(lng, 180)).toBe(180);
    expect(() => z.parse(lng, 181)).toThrow();
    expect(() => z.parse(lng, -181)).toThrow();
  });

  test("rejects non-number", () => {
    expect(() => z.parse(z.latitude(), "45")).toThrow();
  });
});
