import { expect, test } from "vitest";
import * as z from "../../classic/external.js";

test("ext namespace is mutable and can be extended", () => {
  // Plugin authors can add custom validators to z.ext
  z.ext.cron = () => {
    return z
      .string()
      .refine((val) => /^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3]))/.test(val), { message: "Invalid cron expression" });
  };

  // Consumers can use the extended functionality
  const cronSchema = z.ext.cron();

  // Valid cron expressions should pass
  expect(() => cronSchema.parse("0 0")).not.toThrow();
  expect(() => cronSchema.parse("* *")).not.toThrow();
  expect(() => cronSchema.parse("30 14")).not.toThrow();

  // Invalid cron expressions should fail
  expect(() => cronSchema.parse("invalid")).toThrow();
  expect(() => cronSchema.parse("99 99")).toThrow();
});

test("ext namespace allows multiple plugins", () => {
  // Plugin 1: URL validator
  z.ext.url = (options?: { allowHttp?: boolean }) => {
    return z.string().refine(
      (val) => {
        try {
          const url = new URL(val);
          if (options?.allowHttp === false && url.protocol === "http:") {
            return false;
          }
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid URL" }
    );
  };

  // Plugin 2: Color hex validator
  z.ext.hexColor = () => {
    return z.string().refine((val) => /^#[0-9A-Fa-f]{6}$/.test(val), { message: "Invalid hex color" });
  };

  // Both plugins work independently
  const urlSchema = z.ext.url();
  const colorSchema = z.ext.hexColor();

  expect(() => urlSchema.parse("https://example.com")).not.toThrow();
  expect(() => urlSchema.parse("not-a-url")).toThrow();

  expect(() => colorSchema.parse("#FF5733")).not.toThrow();
  expect(() => colorSchema.parse("red")).toThrow();
});

test("ext namespace doesn't affect core z object", () => {
  // Adding to z.ext shouldn't interfere with core functionality
  z.ext.custom = () => z.string();

  // Core validators still work
  const stringSchema = z.string();
  const numberSchema = z.number();
  const objectSchema = z.object({ name: z.string() });

  expect(() => stringSchema.parse("test")).not.toThrow();
  expect(() => numberSchema.parse(42)).not.toThrow();
  expect(() => objectSchema.parse({ name: "test" })).not.toThrow();
});

test("ext namespace allows factory functions with configuration", () => {
  // Advanced plugin with configuration
  z.ext.range = (min: number, max: number, options?: { inclusive?: boolean }) => {
    const inclusive = options?.inclusive ?? true;
    return z.number().refine(
      (val) => {
        if (inclusive) {
          return val >= min && val <= max;
        }
        return val > min && val < max;
      },
      { message: `Value must be ${inclusive ? "between" : "strictly between"} ${min} and ${max}` }
    );
  };

  const inclusiveRange = z.ext.range(0, 10);
  const exclusiveRange = z.ext.range(0, 10, { inclusive: false });

  // Inclusive range includes boundaries
  expect(() => inclusiveRange.parse(0)).not.toThrow();
  expect(() => inclusiveRange.parse(10)).not.toThrow();
  expect(() => inclusiveRange.parse(5)).not.toThrow();

  // Exclusive range excludes boundaries
  expect(() => exclusiveRange.parse(0)).toThrow();
  expect(() => exclusiveRange.parse(10)).toThrow();
  expect(() => exclusiveRange.parse(5)).not.toThrow();
});

test("ext namespace supports complex plugin patterns", () => {
  // Plugin that returns a schema builder
  z.ext.customEnum = (...values: string[]) => {
    if (values.length === 0) {
      throw new Error("Must provide at least one value");
    }
    return z.enum(values as [string, ...string[]]);
  };

  const statusSchema = z.ext.customEnum("pending", "active", "completed");

  expect(() => statusSchema.parse("pending")).not.toThrow();
  expect(() => statusSchema.parse("active")).not.toThrow();
  expect(() => statusSchema.parse("invalid")).toThrow();
});

test("ext namespace is safe for production builds", () => {
  // This test ensures that z.ext doesn't freeze
  // which was the original issue in #5544

  // Should be able to add properties without TypeError
  expect(() => {
    z.ext.testPlugin = () => z.string();
  }).not.toThrow();

  // Should be able to call the added plugin
  expect(() => {
    const schema = z.ext.testPlugin();
    schema.parse("test");
  }).not.toThrow();
});
