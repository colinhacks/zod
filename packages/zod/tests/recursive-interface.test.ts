import { expect, test } from "vitest";

import { z } from "zod";

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

  const Category = z.interface({
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

  const LinkedListSchema = z.union([
    z.null(),
    z.interface({
      value: z.number(),
      get next() {
        return LinkedListSchema;
      },
    }),
  ]);

  LinkedListSchema.parse(data);
});

const Alazy = z.interface({
  val: z.number(),
  get b() {
    return Blazy;
  },
});

const Blazy = z.interface({
  val: z.number(),
  get a() {
    return Alazy.optional();
  },
});

test("mutual recursion", () => {
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

// test("mutual recursion with cyclical data", () => {
//   const a: any = { val: 1 };
//   const b: any = { val: 2 };
//   a.b = b;
//   b.a = a;

//   Alazy.parse(a);
//   Blazy.parse(b);
// });

test("pick and omit with recursive interface", () => {
  const Category = z.strictInterface({
    name: z.string(),
    get subcategories() {
      return z.array(Category);
    },
  });

  type Category = z.infer<typeof Category>;

  const PickedCategory = Category.pick({ name: true });
  const OmittedCategory = Category.omit({ subcategories: true });

  const picked = { name: "test" };
  const omitted = { name: "test" };

  PickedCategory.parse(picked);
  OmittedCategory.parse(omitted);

  expect(() => PickedCategory.parse({ name: "test", subcategories: [] })).toThrow();
  expect(() => OmittedCategory.parse({ name: "test", subcategories: [] })).toThrow();
});
