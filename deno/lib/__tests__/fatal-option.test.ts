// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";



const compoundIssuesRefinement = (_val: any, ctx: z.RefinementCtx) => {
  if (ctx.issues.length === 0) return
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: "Compound issue added"
  })
}

test("check options allow both fatal and messages", () => {
  const schema = z.string().min(4, { message: "Too short", fatal: true })

  expect(schema.safeParse("asdf").success).toEqual(true)
  expect(schema.superRefine(compoundIssuesRefinement).safeParse('asdf').success).toEqual(true)

  const resultNonFatal = schema.superRefine(compoundIssuesRefinement).safeParse('asd')
  expect(resultNonFatal.success).toEqual(false)
  if (!resultNonFatal.success) expect(resultNonFatal.error.issues.length).toEqual(1)
  if (!resultNonFatal.success) expect(resultNonFatal.error.issues[0].message).toEqual("Too short")
})

type TestSchema<T> = {
  schema: (fatal: boolean) => z.ZodFirstPartySchemaTypes,
  valid: T,
  invalid: T,
}

const parseTestSchema = <T>({ schema, valid, invalid }: TestSchema<T>) => {
  expect(schema(true).superRefine(compoundIssuesRefinement).safeParse(valid).success).toEqual(true);
  expect(schema(false).superRefine(compoundIssuesRefinement).safeParse(valid).success).toEqual(true);

  const resultNonFatal = schema(false).superRefine(compoundIssuesRefinement).safeParse(invalid)
  expect(resultNonFatal.success).toEqual(false);
  if (!resultNonFatal.success) expect(resultNonFatal.error.issues.length).toEqual(2);

  const resultFatal = schema(true).superRefine(compoundIssuesRefinement).safeParse(invalid)
  expect(resultFatal.success).toEqual(false);
  if (!resultFatal.success) expect(resultFatal.error.issues.length).toEqual(1);
}

describe("string fatal validations", () => {
  const validationTests: Record<string, TestSchema<string>> = {
    min: {
      schema: (fatal: boolean): z.ZodString => z.string().min(4, { fatal }),
      valid: "asdf",
      invalid: "asd",
    },
    max: {
      schema: (fatal: boolean): z.ZodString => z.string().max(4, { fatal }),
      valid: "asdf",
      invalid: "asdfs",
    },
    length: {
      schema: (fatal: boolean): z.ZodString => z.string().length(4, { fatal }),
      valid: "asdf",
      invalid: "asdfs",
    },
    email: {
      schema: (fatal: boolean): z.ZodString => z.string().email({ fatal }),
      valid: "test@test.com",
      invalid: "test@@test.com"
    },
    url: {
      schema: (fatal: boolean): z.ZodString => z.string().url({ fatal }),
      valid: "https://google.com",
      invalid: "google"
    },
    emoji: {
      schema: (fatal: boolean): z.ZodString => z.string().emoji({ fatal }),
      valid: "👍",
      invalid: "thumbs-up"
    },
    uuid: {
      schema: (fatal: boolean): z.ZodString => z.string().uuid({ fatal }),
      valid: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      invalid: "aaaa"
    },
    cuid: {
      schema: (fatal: boolean): z.ZodString => z.string().cuid({ fatal }),
      valid: "cjsm1x5x0000a0a6gk1r4v2x6",
      invalid: "aaaa"
    },
    includes: {
      schema: (fatal: boolean): z.ZodString => z.string().includes("test", { fatal }),
      valid: "this is a test",
      invalid: "this is a aaaa"
    },
    cuid2: {
      schema: (fatal: boolean): z.ZodString => z.string().cuid2({ fatal }),
      valid: "cjsm1x5x0000a0a6gk1r4v2x6",
      invalid: "👍"
    },
    ulid: {
      schema: (fatal: boolean): z.ZodString => z.string().ulid({ fatal }),
      valid: "01E1Z3NDEKTSV4RRFFQ69G5FAV",
      invalid: "aaaa"
    },
    regex: {
      schema: (fatal: boolean): z.ZodString => z.string().regex(/test/, { fatal }),
      valid: "this is a test",
      invalid: "this is a aaaa",
    },
    // trim
    // toLowerCase
    // toUpperCase
    datetime: {
      schema: (fatal: boolean): z.ZodString => z.string().datetime({ fatal }),
      valid: "2020-01-01T00:00:00.000Z",
      invalid: "2020-01-01T00:00:00.000",
    },
    ip: {
      schema: (fatal: boolean): z.ZodString => z.string().ip({ fatal }),
      valid: "0.0.0.0",
      invalid: "a",
    }
  }

  // eslint-disable-next-line ban/ban
  test.each(Object.keys(validationTests))("z.string().%s()", (key) => parseTestSchema(validationTests[key]))
});


describe("number fatal validations", () => {
  const validationTests: Record<string, TestSchema<number>> = {
    min: {
      schema: (fatal: boolean): z.ZodNumber => z.number().min(4, { fatal }),
      valid: 5,
      invalid: 3,
    },
    max: {
      schema: (fatal: boolean): z.ZodNumber => z.number().max(4, { fatal }),
      valid: 3,
      invalid: 5,
    },
    int: {
      schema: (fatal: boolean): z.ZodNumber => z.number().int({ fatal }),
      valid: 3,
      invalid: 3.5,
    },
    multipleOf: {
      schema: (fatal: boolean): z.ZodNumber => z.number().multipleOf(2, { fatal }),
      valid: 4,
      invalid: 3,
    },
    finite: {
      schema: (fatal: boolean): z.ZodNumber => z.number().finite({ fatal }),
      valid: 3,
      invalid: Infinity,
    },
    gte: {
      schema: (fatal: boolean): z.ZodNumber => z.number().gte(4, { fatal }),
      valid: 4,
      invalid: 3,
    },
    gt: {
      schema: (fatal: boolean): z.ZodNumber => z.number().gt(4, { fatal }),
      valid: 5,
      invalid: 4,
    },
    lte: {
      schema: (fatal: boolean): z.ZodNumber => z.number().lte(4, { fatal }),
      valid: 4,
      invalid: 5,
    },
    lt: {
      schema: (fatal: boolean): z.ZodNumber => z.number().lt(4, { fatal }),
      valid: 3,
      invalid: 4,
    },
    positive: {
      schema: (fatal: boolean): z.ZodNumber => z.number().positive({ fatal }),
      valid: 3,
      invalid: -3,
    },
    negative: {
      schema: (fatal: boolean): z.ZodNumber => z.number().negative({ fatal }),
      valid: -3,
      invalid: 3,
    },
    nonpositive: {
      schema: (fatal: boolean): z.ZodNumber => z.number().nonpositive({ fatal }),
      valid: -3,
      invalid: 3,
    },
    nonnegative: {
      schema: (fatal: boolean): z.ZodNumber => z.number().nonnegative({ fatal }),
      valid: 3,
      invalid: -3,
    },
    safe: {
      schema: (fatal: boolean): z.ZodNumber => z.number().safe({ fatal }),
      valid: 3,
      invalid: 9007199254740992,
    }
  }

  // eslint-disable-next-line ban/ban
  test.each(Object.keys(validationTests))("z.number().%s()", (key) => parseTestSchema(validationTests[key]))
});

describe("bigint fatal validations", () => {
  const validationTests: Record<string, TestSchema<bigint>> = {
    gte: {
      schema: (fatal: boolean): z.ZodBigInt => z.bigint().gte(BigInt(4), { fatal }),
      valid: BigInt(4),
      invalid: BigInt(3),
    },
    gt: {
      schema: (fatal: boolean): z.ZodBigInt => z.bigint().gt(BigInt(4), { fatal }),
      valid: BigInt(5),
      invalid: BigInt(4),
    },
    lte: {
      schema: (fatal: boolean): z.ZodBigInt => z.bigint().lte(BigInt(4), { fatal }),
      valid: BigInt(4),
      invalid: BigInt(5),
    },
    lt: {
      schema: (fatal: boolean): z.ZodBigInt => z.bigint().lt(BigInt(4), { fatal }),
      valid: BigInt(3),
      invalid: BigInt(4),
    },
    positive: {
      schema: (fatal: boolean): z.ZodBigInt => z.bigint().positive({ fatal }),
      valid: BigInt(3),
      invalid: BigInt(-3),
    },
    negative: {
      schema: (fatal: boolean): z.ZodBigInt => z.bigint().negative({ fatal }),
      valid: BigInt(-3),
      invalid: BigInt(3),
    },
    nonpositive: {
      schema: (fatal: boolean): z.ZodBigInt => z.bigint().nonpositive({ fatal }),
      valid: BigInt(-3),
      invalid: BigInt(3),
    },
    nonnegative: {
      schema: (fatal: boolean): z.ZodBigInt => z.bigint().nonnegative({ fatal }),
      valid: BigInt(3),
      invalid: BigInt(-3),
    },
    multipleOf: {
      schema: (fatal: boolean): z.ZodBigInt => z.bigint().multipleOf(BigInt(2), { fatal }),
      valid: BigInt(4),
      invalid: BigInt(3),
    },
  }

  // eslint-disable-next-line ban/ban
  test.each(Object.keys(validationTests))("z.bigint().%s()", (key) => parseTestSchema(validationTests[key]))
});

describe("date fatal validations", () => {
  const validationTests: Record<string, TestSchema<Date>> = {
    min: {
      schema: (fatal: boolean): z.ZodDate => z.date().min(new Date("2020-01-01T00:00:00.000Z"), { fatal }),
      valid: new Date("2020-01-02T00:00:00.000Z"),
      invalid: new Date("2019-12-31T00:00:00.000Z"),
    },
    max: {
      schema: (fatal: boolean): z.ZodDate => z.date().max(new Date("2020-01-01T00:00:00.000Z"), { fatal }),
      valid: new Date("2019-12-31T00:00:00.000Z"),
      invalid: new Date("2020-01-02T00:00:00.000Z"),
    },
  }

  // eslint-disable-next-line ban/ban
  test.each(Object.keys(validationTests))("z.date().%s()", (key) => parseTestSchema(validationTests[key]))
});

describe("array fatal validations", () => {
  const validationTests: Record<string, TestSchema<Array<any>>> = {
    length: {
      schema: (fatal: boolean): z.ZodArray<any> => z.array(z.string()).length(2, { fatal }),
      valid: ["a", "b"],
      invalid: ["a", "b", "c"],
    },
    min: {
      schema: (fatal: boolean): z.ZodArray<any> => z.array(z.string()).min(2, { fatal }),
      valid: ["a", "b"],
      invalid: ["a"],
    },
    max: {
      schema: (fatal: boolean): z.ZodArray<any> => z.array(z.string()).max(2, { fatal }),
      valid: ["a", "b"],
      invalid: ["a", "b", "c"],
    },
    nonempty: {
      schema: (fatal: boolean): z.ZodArray<any, 'atleastone'> => z.array(z.string()).nonempty({ fatal }),
      valid: ["a", "b"],
      invalid: [],
    }
  }

  // eslint-disable-next-line ban/ban
  test.each(Object.keys(validationTests))("z.array().%s()", (key) => parseTestSchema(validationTests[key]))
});

describe("object fatal validations", () => {
  const validationTests: Record<string, TestSchema<Array<any>>> = {
    exactLength: {
      schema: (fatal: boolean): z.ZodArray<any> => z.array(z.string()).length(2, { fatal }),
      valid: ["a", "b"],
      invalid: ["a", "b", "c"],
    },
    min: {
      schema: (fatal: boolean): z.ZodArray<any> => z.array(z.string()).min(2, { fatal }),
      valid: ["a", "b"],
      invalid: ["a"],
    },
    max: {
      schema: (fatal: boolean): z.ZodArray<any> => z.array(z.string()).max(2, { fatal }),
      valid: ["a", "b"],
      invalid: ["a", "b", "c"],
    },
    nonempty: {
      schema: (fatal: boolean): z.ZodArray<any, 'atleastone'> => z.array(z.string()).nonempty({ fatal }),
      valid: ["a", "b"],
      invalid: [],
    }
  }

  // eslint-disable-next-line ban/ban
  test.each(Object.keys(validationTests))("z.object().%s()", (key) => parseTestSchema(validationTests[key]))
});

describe("set fatal validations", () => {
  const validationTests: Record<string, TestSchema<Set<any>>> = {
    size: {
      schema: (fatal: boolean): z.ZodSet<any> => z.set(z.string()).size(2, { fatal }),
      valid: new Set(["a", "b"]),
      invalid: new Set(["a", "b", "c"]),
    },
    min: {
      schema: (fatal: boolean): z.ZodSet<any> => z.set(z.string()).min(2, { fatal }),
      valid: new Set(["a", "b"]),
      invalid: new Set(["a"]),
    },
    max: {
      schema: (fatal: boolean): z.ZodSet<any> => z.set(z.string()).max(2, { fatal }),
      valid: new Set(["a", "b"]),
      invalid: new Set(["a", "b", "c"]),
    },
    nonempty: {
      schema: (fatal: boolean): z.ZodSet<any> => z.set(z.string()).nonempty({ fatal }),
      valid: new Set(["a", "b"]),
      invalid: new Set([]),
    }
  }

  // eslint-disable-next-line ban/ban
  test.each(Object.keys(validationTests))("z.set().%s()", (key) => parseTestSchema(validationTests[key]))
});





