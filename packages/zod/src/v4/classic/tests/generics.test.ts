import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

function nest<TData extends z.ZodType>(schema: TData) {
  return z.object({
    nested: schema,
  });
}

test("generics", () => {
  const a = nest(z.object({ a: z.string() }));
  type a = z.infer<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<{ nested: { a: string } }>();

  const b = nest(z.object({ a: z.string().optional() }));
  type b = z.infer<typeof b>;
  expectTypeOf<b>().toEqualTypeOf<{ nested: { a?: string | undefined } }>();
});

test("generics with optional", () => {
  async function stripOuter<TData extends z.ZodType>(schema: TData, data: unknown) {
    return z
      .object({
        nested: schema.optional(),
      })
      .transform((data) => {
        return data.nested;
      })
      .parse({ nested: data });
  }

  const result = stripOuter(z.object({ a: z.string() }), { a: "asdf" });
  expectTypeOf<typeof result>().toEqualTypeOf<Promise<{ a: string } | undefined>>();
});

// test("assignability", () => {
//   const createSchemaAndParse = <K extends string, VS extends z.ZodString>(key: K, valueSchema: VS, data: unknown) => {
//     const schema = z.object({
//       [key]: valueSchema,
//     });
//     // return { [key]: valueSchema };
//     const parsed = schema.parse(data);
//     return parsed;
//     // const inferred: z.infer<z.ZodObject<{ [k in K]: VS }>> = parsed;
//     // return inferred;
//   };
//   const parsed = createSchemaAndParse("foo", z.string(), { foo: "" });
//   expectTypeOf<typeof parsed>().toEqualTypeOf<{ foo: string }>();
// });

test("nested no undefined", () => {
  const inner = z.string().or(z.array(z.string()));
  const outer = z.object({ inner });
  type outerSchema = z.infer<typeof outer>;
  expectTypeOf<outerSchema>().toEqualTypeOf<{ inner: string | string[] }>();

  expect(outer.safeParse({ inner: undefined }).success).toEqual(false);
});

test("generic on output type", () => {
  const createV4Schema = <Output>(opts: {
    schema: z.ZodType<Output>;
  }) => {
    return opts.schema;
  };

  createV4Schema({
    schema: z.object({
      name: z.string(),
    }),
  })?._zod?.output?.name;
});

// Every ZodObject method that returns a ZodObject resolves its shape and config against `this`, so a schema passed into a generic wrapper keeps its concrete shape instead of collapsing to the `ZodObject` default.
test("object methods keep the shape through a generic wrapper", () => {
  const src = z.object({ a: z.string(), b: z.number().optional() });
  type Src = typeof src;
  type Infer<F extends (...args: never) => z.ZodType> = z.infer<ReturnType<F>>;
  type Base = { a: string; b?: number | undefined };

  const keyof_ = <T extends z.ZodObject>(s: T) => s.keyof();
  const catchall = <T extends z.ZodObject>(s: T) => s.catchall(z.bigint());
  const passthrough = <T extends z.ZodObject>(s: T) => s.passthrough();
  const loose = <T extends z.ZodObject>(s: T) => s.loose();
  const strict = <T extends z.ZodObject>(s: T) => s.strict();
  const strip = <T extends z.ZodObject>(s: T) => s.strip();
  const extend = <T extends z.ZodObject>(s: T) => s.extend({ c: z.boolean() });
  const safeExtend = <T extends z.ZodObject>(s: T) => s.safeExtend({ c: z.boolean() });
  const merge = <T extends z.ZodObject>(s: T) => s.merge(z.object({ c: z.boolean() }));
  const pick = <T extends z.ZodObject>(s: T) => s.pick({ a: true });
  const omit = <T extends z.ZodObject>(s: T) => s.omit({ a: true });
  const partial = <T extends z.ZodObject>(s: T) => s.partial();
  const partialMask = <T extends z.ZodObject>(s: T) => s.partial({ a: true });
  const exactPartial = <T extends z.ZodObject>(s: T) => s.exactPartial();
  const exactPartialMask = <T extends z.ZodObject>(s: T) => s.exactPartial({ a: true });
  const required = <T extends z.ZodObject>(s: T) => s.required();
  const requiredMask = <T extends z.ZodObject>(s: T) => s.required({ b: true });

  expectTypeOf<Infer<typeof keyof_<Src>>>().toEqualTypeOf<"a" | "b">();
  expectTypeOf<Infer<typeof strict<Src>>>().toEqualTypeOf<Base>();
  expectTypeOf<Infer<typeof strip<Src>>>().toEqualTypeOf<Base>();
  expectTypeOf<Infer<typeof extend<Src>>>().toEqualTypeOf<{ a: string; c: boolean; b?: number | undefined }>();
  expectTypeOf<Infer<typeof safeExtend<Src>>>().toEqualTypeOf<{ a: string; c: boolean; b?: number | undefined }>();
  expectTypeOf<Infer<typeof merge<Src>>>().toEqualTypeOf<{ a: string; c: boolean; b?: number | undefined }>();
  expectTypeOf<Infer<typeof pick<Src>>>().toEqualTypeOf<{ a: string }>();
  expectTypeOf<Infer<typeof omit<Src>>>().toEqualTypeOf<{ b?: number | undefined }>();
  expectTypeOf<Infer<typeof partial<Src>>>().toEqualTypeOf<{ a?: string | undefined; b?: number | undefined }>();
  expectTypeOf<Infer<typeof partialMask<Src>>>().toEqualTypeOf<{ a?: string | undefined; b?: number | undefined }>();
  expectTypeOf<Infer<typeof exactPartial<Src>>>().toEqualTypeOf<{ a?: string; b?: number | undefined }>();
  expectTypeOf<Infer<typeof exactPartialMask<Src>>>().toEqualTypeOf<{ a?: string; b?: number | undefined }>();
  expectTypeOf<Infer<typeof required<Src>>>().toEqualTypeOf<{ a: string; b: number }>();
  expectTypeOf<Infer<typeof requiredMask<Src>>>().toEqualTypeOf<{ a: string; b: number }>();

  // The catchall variants carry an index signature alongside the concrete keys, so assert the keys directly.
  expectTypeOf<Infer<typeof catchall<Src>>["a"]>().toEqualTypeOf<string>();
  expectTypeOf<Infer<typeof catchall<Src>>[string]>().toEqualTypeOf<bigint>();
  expectTypeOf<Infer<typeof passthrough<Src>>["a"]>().toEqualTypeOf<string>();
  expectTypeOf<Infer<typeof loose<Src>>["a"]>().toEqualTypeOf<string>();
  expectTypeOf<Infer<typeof loose<Src>>[string]>().toEqualTypeOf<unknown>();
});

test("object methods keep the catchall config through a generic wrapper", () => {
  const strictSrc = z.strictObject({ a: z.string() });
  const looseSrc = z.looseObject({ a: z.string() });
  const partial = <T extends z.ZodObject>(s: T) => s.partial();
  const pick = <T extends z.ZodObject>(s: T) => s.pick({ a: true });

  expectTypeOf<ReturnType<typeof partial<typeof strictSrc>>["_zod"]["config"]>().toEqualTypeOf<z.core.$strict>();
  expectTypeOf<ReturnType<typeof pick<typeof looseSrc>>["_zod"]["config"]>().toEqualTypeOf<z.core.$loose>();
});

test("a recursive schema survives a generic wrapper", () => {
  const Node = z.object({
    id: z.string(),
    get children() {
      return z.array(Node);
    },
  });
  const strict = <T extends z.ZodObject>(s: T) => s.strict();
  const StrictNode = strict(Node);

  type StrictNode = z.infer<typeof StrictNode>;
  expectTypeOf<StrictNode["id"]>().toEqualTypeOf<string>();
  expectTypeOf<StrictNode["children"][number]["children"][number]["id"]>().toEqualTypeOf<string>();
  expect(StrictNode.parse({ id: "a", children: [{ id: "b", children: [] }] })).toEqual({
    id: "a",
    children: [{ id: "b", children: [] }],
  });
});

// chaining a mask-taking method onto another object method is the case the excess-key guard used to reject
test("chained object methods keep the shape through a generic wrapper", () => {
  const src = z.object({ a: z.string(), b: z.number().optional() });
  type Src = typeof src;
  type Infer<F extends (...args: never) => z.ZodType> = z.infer<ReturnType<F>>;

  const strictPick = <T extends z.ZodObject>(s: T) => s.strict().pick({ a: true });
  const partialOmit = <T extends z.ZodObject>(s: T) => s.partial().omit({ a: true });
  const looseRequired = <T extends z.ZodObject>(s: T) => s.loose().required({ b: true });
  const catchallPartial = <T extends z.ZodObject>(s: T) => s.catchall(z.string()).partial({ a: true });
  const stripExactPartial = <T extends z.ZodObject>(s: T) => s.strip().exactPartial({ a: true });

  expectTypeOf<Infer<typeof strictPick<Src>>>().toEqualTypeOf<{ a: string }>();
  expectTypeOf<Infer<typeof partialOmit<Src>>>().toEqualTypeOf<{ b?: number | undefined }>();
  expectTypeOf<Infer<typeof looseRequired<Src>>["b"]>().toEqualTypeOf<number>();
  expectTypeOf<Infer<typeof catchallPartial<Src>>["a"]>().toEqualTypeOf<string | undefined>();
  expectTypeOf<Infer<typeof stripExactPartial<Src>>>().toEqualTypeOf<{ a?: string; b?: number | undefined }>();

  // known limitation: safeExtend keeps a compatibility guard that references `Shape`, and it cannot resolve against a chained receiver
  // @ts-expect-error
  const _chainedSafeExtend = <T extends z.ZodObject>(s: T) => s.strict().safeExtend({ x: z.bigint() });
  void _chainedSafeExtend;
});
