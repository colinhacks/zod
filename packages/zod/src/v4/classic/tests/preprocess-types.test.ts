import { expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

test("ZodPreprocess<B> assignable to ZodPipe<$ZodTransform, B>", () => {
  const pre = z.preprocess((v) => v, z.string().optional());
  const _asPipe: z.ZodPipe<z.core.$ZodTransform, z.ZodOptional<z.ZodString>> = pre;
  const _asCorePipe: z.core.$ZodPipe<z.core.$ZodTransform, z.ZodOptional<z.ZodString>> = pre;
  expectTypeOf(_asPipe).toMatchTypeOf<z.ZodPipe>();
  expectTypeOf(_asCorePipe).toMatchTypeOf<z.core.$ZodPipe>();
});

test("ZodPreprocess optin/optout defer to B", () => {
  const optionalInside = z.preprocess((v) => v, z.string().optional());
  expectTypeOf<(typeof optionalInside)["_zod"]["optin"]>().toEqualTypeOf<"optional" | "defaulted">();
  expectTypeOf<(typeof optionalInside)["_zod"]["optout"]>().toEqualTypeOf<"optional">();

  const required = z.preprocess((v) => v, z.string());
  expectTypeOf<(typeof required)["_zod"]["optin"]>().toEqualTypeOf<"optional" | "defaulted" | undefined>();
  expectTypeOf<(typeof required)["_zod"]["optout"]>().toEqualTypeOf<"optional" | undefined>();
});

test("ZodPreprocess input/output inference", () => {
  const pre = z.preprocess((v) => v, z.number().optional());
  expectTypeOf<z.output<typeof pre>>().toEqualTypeOf<number | undefined>();
  expectTypeOf<z.input<typeof pre>>().toEqualTypeOf<unknown>();
});

test("ZodPreprocess narrows input from an annotated preprocessor arg", () => {
  const trimmed = z.preprocess((val: string | null | undefined) => val?.trim() ?? "", z.string());
  expectTypeOf<z.input<typeof trimmed>>().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<z.output<typeof trimmed>>().toEqualTypeOf<string>();

  const obj = z.object({ a: z.preprocess((v: string | number) => String(v), z.string()) });
  expectTypeOf<z.input<typeof obj>>().toEqualTypeOf<{ a: string | number }>();
  expectTypeOf<z.output<typeof obj>>().toEqualTypeOf<{ a: string }>();
});

// The narrowing must ride on the transform's input only. Binding its output too makes $ZodPipeDef's codec-only `transform?` field contravariant in the preprocessor's return type, which drops the bare-type assignability below.
test("narrowed ZodPreprocess still assignable to the bare type", () => {
  const pre = z.preprocess((v: string) => v.length, z.number());
  const _bare: z.ZodPreprocess<z.ZodNumber> = pre;
  const _bareCore: z.core.$ZodPreprocess = pre;
  expectTypeOf<(typeof pre)["_zod"]["optin"]>().toEqualTypeOf<"optional" | "defaulted" | undefined>();
});
