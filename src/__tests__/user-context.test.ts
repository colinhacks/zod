// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

class UserContext {
  counter: number;

  constructor(counter: number) {
    this.counter = counter;
  }

  inc = () => this.counter++;
}

const zRefineString = z.string().superRefine((arg, ctx) => {
  (ctx.userContext as UserContext).inc();
  return arg;
});

test("refine with user context", async () => {
  const ctx = new UserContext(0);

  expect(ctx.counter).toEqual(0);
  zRefineString.parse("", {
    userContext: ctx,
  });
  expect(ctx.counter).toEqual(1);
});

test("refine with user context", async () => {
  const schema = z.object({
    a: zRefineString,
  });

  const ctx = new UserContext(0);

  expect(ctx.counter).toEqual(0);
  schema.parse(
    { a: "" },
    {
      userContext: ctx,
    }
  );
  expect(ctx.counter).toEqual(1);
});
