import { z } from "../index";

describe("string.slug()", () => {
  const schema = z.string().slug();

  it("accepts valid slugs", () => {
    expect(schema.parse("hello-world")).toBe("hello-world");
    expect(schema.parse("v2-api")).toBe("v2-api");
    expect(schema.parse("a")).toBe("a");
    expect(schema.parse("x123")).toBe("x123");
  });

  it("rejects invalid slugs", () => {
    const bad = [
      "-abc", "abc-", "two--dashes", "Bad", "with space", "emoji-🚀", "UPPER", "under_score"
    ];
    for (const s of bad) {
      expect(() => schema.parse(s)).toThrow();
    }
  });

  it("supports custom error message", () => {
    const custom = z.string().slug("Please use lowercase letters, numbers and single hyphens");
    expect(() => custom.parse("Bad-Value")).toThrow(/Please use lowercase/);
  });
});