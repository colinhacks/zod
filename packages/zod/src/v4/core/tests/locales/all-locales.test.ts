import { expect, test } from "vitest";
import * as z from "zod/v4";

type LocaleFactory = () => { localeError: z.core.$ZodErrorMap };

const localeEntries = Object.entries(z.locales) as [string, LocaleFactory][];

function issueMessage(result: { success: true } | { success: false; error: z.core.$ZodError }): string {
  expect(result.success).toBe(false);
  if (result.success) throw new Error("expected parsing to fail");

  const message = result.error.issues[0]?.message;
  expect(message).toEqual(expect.any(String));
  expect(message.length).toBeGreaterThan(0);
  return message;
}

function expectLocaleMessage(
  name: string,
  result: { success: true } | { success: false; error: z.core.$ZodError }
): void {
  expect(issueMessage(result), `${name} should return an error message`).toEqual(expect.any(String));
}

test.each(localeEntries)("locale %s handles the common issue codes", (name, locale) => {
  z.config(locale());

  expectLocaleMessage(name, z.number().safeParse("not a number"));
  expectLocaleMessage(name, z.enum(["red", "blue"]).safeParse("green"));
  expectLocaleMessage(name, z.number().max(3).safeParse(4));
  expectLocaleMessage(name, z.number().min(3).safeParse(2));
  expectLocaleMessage(name, z.string().regex(/^ok$/).safeParse("nope"));
  expectLocaleMessage(name, z.string().startsWith("ok").safeParse("nope"));
  expectLocaleMessage(name, z.string().endsWith("ok").safeParse("nope"));
  expectLocaleMessage(name, z.string().includes("ok").safeParse("nope"));
  expectLocaleMessage(name, z.string().email().safeParse("nope"));
  expectLocaleMessage(name, z.number().multipleOf(3).safeParse(10));
  expectLocaleMessage(name, z.object({ value: z.string() }).strict().safeParse({ value: "ok", extra: true }));
  expectLocaleMessage(name, z.union([z.string(), z.number()]).safeParse(false));
  expectLocaleMessage(name, z.map(z.string(), z.number()).safeParse(new Map([[1, 2]])));
  expectLocaleMessage(name, z.map(z.string(), z.number()).safeParse(new Map([["one", "two"]])));
  expectLocaleMessage(name, z.set(z.string()).safeParse(new Set([1])));
});
