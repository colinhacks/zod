import { expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

// These are pure type-level checks. They run no assertions, so the value of
// the test is in the `expectTypeOf` calls — failures surface as type errors.

test("ZodPreprocess<B> is assignable to ZodPipe<$ZodTransform, B>", () => {
  const pre = z.preprocess((v) => v, z.string().optional());
  const _asPipe: z.ZodPipe<z.core.$ZodTransform, z.ZodOptional<z.ZodString>> = pre;
  const _asCorePipe: z.core.$ZodPipe<z.core.$ZodTransform, z.ZodOptional<z.ZodString>> = pre;
  expectTypeOf(_asPipe).toMatchTypeOf<z.ZodPipe>();
  expectTypeOf(_asCorePipe).toMatchTypeOf<z.core.$ZodPipe>();
});

test("ZodPreprocess narrows optin/optout to B's values", () => {
  const optionalInside = z.preprocess((v) => v, z.string().optional());
  expectTypeOf<(typeof optionalInside)["_zod"]["optin"]>().toEqualTypeOf<"optional">();
  expectTypeOf<(typeof optionalInside)["_zod"]["optout"]>().toEqualTypeOf<"optional">();

  // Schemas with no explicit optin/optout (e.g. ZodString) inherit
  // `optin?: "optional" | undefined` from $ZodTypeInternals, so the field
  // surfaces as `"optional" | undefined` after the override.
  const required = z.preprocess((v) => v, z.string());
  expectTypeOf<(typeof required)["_zod"]["optin"]>().toEqualTypeOf<"optional" | undefined>();
  expectTypeOf<(typeof required)["_zod"]["optout"]>().toEqualTypeOf<"optional" | undefined>();
});

test("ZodPreprocess output/input inference unchanged from a plain pipe", () => {
  const pre = z.preprocess((v) => v, z.number().optional());
  expectTypeOf<z.output<typeof pre>>().toEqualTypeOf<number | undefined>();
  expectTypeOf<z.input<typeof pre>>().toEqualTypeOf<unknown>();
});
