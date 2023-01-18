import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

test("refine + union", () => {
  const stringIsValid = (value: string): value is "a" | "b" =>
    ["a", "b"].includes(value);

  const fooSchema = z.object({
    type: z.string().refine(stringIsValid).or(z.literal("c")),
  });

  util.assertIs<
    z.ZodType<{
      type: "a" | "b" | "c";
    }>
  >(fooSchema);
});

test("refine + object", () => {
  const stringIsValid = (value: string): value is "a" | "b" =>
    ["a", "b"].includes(value);

  const fooSchema = z.object({
    type: z.string().refine(stringIsValid),
  });

  util.assertIs<
    z.ZodType<{
      type: "a" | "b";
    }>
  >(fooSchema);
});

test("refine + array", () => {
  const stringIsValid = (value: string): value is "a" | "b" =>
    ["a", "b"].includes(value);

  const fooSchema = z.object({
    type: z.string().refine(stringIsValid),
  });

  type Foo = z.infer<typeof fooSchema>;

  type Bar = {
    children: Foo[];
  };

  const barSchema = z.object({
    children: fooSchema.array(),
  });

  util.assertIs<z.ZodType<Bar>>(barSchema);
});

test("refine + promise", () => {
  const stringIsValid = (value: string): value is "a" | "b" =>
    ["a", "b"].includes(value);

  const fooSchema = z.object({
    type: z.string().refine(stringIsValid).promise(),
  });

  util.assertIs<
    z.ZodType<{
      type: Promise<"a" | "b">;
    }>
  >(fooSchema);
});
