import { z } from "@zod/mini";
import { expect, expectTypeOf, test } from "vitest";

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
    get next(): z.ZodMiniNullable<typeof LL> {
      return z.nullable(LL);
    },
  });

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
    get a(): z.ZodMiniOptional<typeof Alazy> {
      return z.optional(Alazy);
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

  const PickedCategory = z.pick(Category, { name: true });
  const OmittedCategory = z.omit(Category, { subcategories: true });

  const picked = { name: "test" };
  const omitted = { name: "test" };

  PickedCategory.parse(picked);
  OmittedCategory.parse(omitted);

  expect(() => PickedCategory.parse({ name: "test", subcategories: [] })).toThrow();
  expect(() => OmittedCategory.parse({ name: "test", subcategories: [] })).toThrow();
});
