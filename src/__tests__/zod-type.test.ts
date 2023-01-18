import { test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

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
