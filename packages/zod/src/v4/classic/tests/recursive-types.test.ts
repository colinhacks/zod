import { expect, expectTypeOf, test } from "vitest";
import { z } from "zod/v4";

test("recursion with z.lazy", () => {
  const data = {
    name: "I",
    subcategories: [
      {
        name: "A",
        subcategories: [
          {
            name: "1",
            subcategories: [
              {
                name: "a",
                subcategories: [],
              },
            ],
          },
        ],
      },
    ],
  };

  const Category = z.object({
    name: z.string(),
    get subcategories() {
      return z.array(Category);
    },
  });
  type Category = z.infer<typeof Category>;
  Category.parse(data);
});

test("recursion involving union type", () => {
  const data = {
    value: 1,
    next: {
      value: 2,
      next: {
        value: 3,
        next: {
          value: 4,
          next: null,
        },
      },
    },
  };

  const LL = z.object({
    value: z.number(),
    get next() {
      return LL.nullable();
    },
  });
  type LL = z.infer<typeof LL>;
  // type a = LL['next']
  // .or(z.null());

  LL.parse(data);
});

test("mutual recursion - native", () => {
  const Alazy = z.object({
    val: z.number(),
    get b() {
      return Blazy;
    },
  });

  const Blazy = z.object({
    val: z.number(),
    get a() {
      return Alazy.optional();
    },
  });
  const testData = {
    val: 1,
    b: {
      val: 5,
      a: {
        val: 3,
        b: {
          val: 4,
          a: {
            val: 2,
            b: {
              val: 1,
            },
          },
        },
      },
    },
  };

  type Alazy = z.infer<typeof Alazy>;
  Alazy.parse(testData);
  Blazy.parse(testData.b);

  expect(() => Alazy.parse({ val: "asdf" })).toThrow();
});

test("pick and omit with getter", () => {
  const Category = z.strictObject({
    name: z.string(),
    get subcategories() {
      return z.array(Category);
    },
  });

  type Category = z.infer<typeof Category>;

  interface _Category {
    name: string;
    subcategories: _Category[];
  }
  expectTypeOf<Category>().toEqualTypeOf<_Category>();

  const PickedCategory = Category.pick({ name: true });
  const OmittedCategory = Category.omit({ subcategories: true });

  const picked = { name: "test" };
  const omitted = { name: "test" };

  PickedCategory.parse(picked);
  OmittedCategory.parse(omitted);

  expect(() => PickedCategory.parse({ name: "test", subcategories: [] })).toThrow();
  expect(() => OmittedCategory.parse({ name: "test", subcategories: [] })).toThrow();
});

test("recursion compatibility", () => {
  // array
  const A = z.object({
    get array() {
      return A.array();
    },
    get optional() {
      return A.optional();
    },
    get nullable() {
      return A.nullable();
    },
    get nonoptional() {
      return A.nonoptional();
    },
    get readonly() {
      return A.readonly();
    },
    get describe() {
      return A.describe("A recursive type");
    },
    get meta() {
      return A.meta({ description: "A recursive type" });
    },
    get pipe() {
      return A.pipe(z.any());
    },
    get strict() {
      return A.strict();
    },
    get tuple() {
      return z.tuple([A, A]);
    },
    get object() {
      return z
        .object({
          subcategories: A,
        })
        .strict()
        .loose();
    },
    get union() {
      return z.union([A, A]);
    },
    get intersection() {
      return z.intersection(A, A);
    },
    get record() {
      return z.record(z.string(), A);
    },
    get map() {
      return z.map(z.string(), A);
    },
    get set() {
      return z.set(A);
    },
    get lazy() {
      return z.lazy(() => A);
    },
    get promise() {
      return z.promise(A);
    },
  });
});
