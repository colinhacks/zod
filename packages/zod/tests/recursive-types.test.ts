import { expect, expectTypeOf, test } from "vitest";
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

  const LL = z
    .object({
      value: z.number(),
      get next() {
        return LL.nullable();
      },
    })
    .or(z.null());

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

//////////////   LAZY   //////////////

test("schema getter", () => {
  z.lazy(() => z.string()).parse("asdf");
});

test("lazy proxy", () => {
  const schema = z.lazy(() => z.string())._zod._getter.min(6);
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

test("recursive union wit z.lazy", () => {
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

test("mutual recursion with lazy", () => {
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

// TODO
test("mutual recursion with cyclical data", () => {
  const a: any = { val: 1 };
  const b: any = { val: 2 };
  a.b = b;
  b.a = a;
});

test("complicated self-recursion", () => {
  const Category = z.object({
    name: z.string(),
    age: z.optional(z.number()),
    get nullself() {
      return Category.nullable();
    },
    get optself() {
      return Category.optional();
    },
    get self() {
      return Category;
    },
    get subcategories() {
      return z.array(Category);
    },
    nested: z.object({
      get sub() {
        return Category;
      },
    }),
  });

  type _Category = z.output<typeof Category>;
});
