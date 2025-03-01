import { expect, test } from "vitest";

import { z } from "zod";

test("schema getter", () => {
  z.lazy(() => z.string()).parse("asdf");
});

test("lazy proxy", () => {
  const schema = z.lazy(() => z.string()).min(6);
  schema.parse("123456");
  expect(schema.safeParse("12345").success).toBe(false);
});

interface Category {
  name: string;
  subcategories: Category[];
}

const testCategory: Category = {
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

test("recursion with z.lazy", () => {
  const Category: z.ZodType<Category> = z.lazy(() =>
    z.object({
      name: z.string(),
      subcategories: z.array(Category),
    })
  );
  Category.parse(testCategory);
});

type LinkedList = null | { value: number; next: LinkedList };

const linkedListExample = {
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

test("recursion involving union type", () => {
  const LinkedListSchema: z.ZodType<LinkedList> = z.lazy(() =>
    z.union([
      z.null(),
      z.object({
        value: z.number(),
        next: LinkedListSchema,
      }),
    ])
  );
  LinkedListSchema.parse(linkedListExample);
});

interface A {
  val: number;
  b: B;
}

interface B {
  val: number;
  a?: A | undefined;
}

const Alazy: z.ZodType<A> = z.lazy(() =>
  z.object({
    val: z.number(),
    b: Blazy,
  })
);

const Blazy: z.ZodType<B> = z.lazy(() =>
  z.object({
    val: z.number(),
    a: Alazy.optional(),
  })
);

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

test("mutual recursion with cyclical data", () => {
  const a: any = { val: 1 };
  const b: any = { val: 2 };
  a.b = b;
  b.a = a;
});
