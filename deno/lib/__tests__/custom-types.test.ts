// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import {
  INVALID,
  ParseContext,
  z,
  ZodNumber,
  ZodNumberDef,
  ZodString,
  ZodStringDef,
  ZodType,
} from "../index.ts";
import { PseudoPromise } from "../PseudoPromise.ts";

class MyCustomString extends ZodString {
  constructor(def: ZodStringDef) {
    super(def);
  }
  _parse(ctx: ParseContext): any {
    if (ctx.data === "FAIL") {
      throw new Error("No failure!");
    }
    const result = super._parse(ctx);
    if (result === INVALID) {
      return "...";
    } else {
      return result;
    }
  }
}

class MyCustomNumber extends ZodNumber {
  constructor(def: ZodNumberDef) {
    super(def);
  }
  _parse(ctx: ParseContext): any {
    return PseudoPromise.resolve(null).then(() => {
      if (ctx.data === 0) {
        throw new Error("No zeros!");
      }
      const result = super._parse(ctx);
      if (result === INVALID) {
        return INVALID;
      } else {
        return result * 10;
      }
    });
  }
}

class MyCustomAsync extends ZodType<string, {}> {
  _parse(ctx: ParseContext): any {
    return PseudoPromise.resolve(null).then(() =>
      Promise.resolve(ctx.data).then((v) => {
        if (v === "FAIL") {
          throw new Error("No failure!");
        } else if (v === "") {
          return INVALID;
        } else {
          return v;
        }
      })
    );
  }
}

const customString = () =>
  new MyCustomString({
    isEmail: false,
    isURL: false,
    isUUID: false,
    minLength: null,
    maxLength: { value: 4 },
  });

const customNum = () =>
  new MyCustomNumber({
    minimum: null,
    maximum: null,
    isInteger: { message: "must be int" },
  });

const customAsync = () => new MyCustomAsync({});

test("parse custom test", () => {
  const schema = z.object({
    id: customString(),
  });
  expect(schema.parse({ id: "tsers" })).toEqual({ id: "..." });
  expect(schema.parse({ id: "123" })).toEqual({ id: "123" });
  expect(schema.safeParse({ id: "FAIL" }).success).toEqual(false);
});

test("parse custom pseudopromise test", () => {
  const schema = z.object({
    id: customNum(),
  });
  expect(schema.parse({ id: 2 })).toEqual({ id: 20 });
  expect(schema.safeParse({ id: 0 }).success).toEqual(false);
  const failureResult = schema.safeParse({ id: 123.4 });
  expect(failureResult.success).toEqual(false);
  if (!failureResult.success) {
    expect(failureResult.error.issues[0].message).toEqual("must be int");
  }
});

test("parse custom async test", async () => {
  const schema = z.object({
    id: customAsync(),
  });
  expect(await schema.parseAsync({ id: "123" })).toEqual({ id: "123" });
  expect((await schema.spa({ id: "" })).success).toEqual(false);
  expect((await schema.spa({ id: "FAIL" })).success).toEqual(false);
});
