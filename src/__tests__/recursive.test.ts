import * as z from '../index';

interface A {
  val: number;
  b: B;
}

interface B {
  val: number;
  a: A;
}

const A: z.ZodType<A> = z.lazy(() =>
  z.object({
    val: z.number(),
    b: B,
    // fun: z.function(z.tuple([z.string()]), z.number()),
  }),
);

const B: z.ZodType<B> = z.lazy(() =>
  z.object({
    val: z.number(),
    a: A,
  }),
);

const a: any = { val: 1 };
const b: any = { val: 2 };
a.b = b;
b.a = a;

test('valid check', () => {
  A.parse(a);
  B.parse(b);
});

test('masking check', () => {
  const FragmentOnA = z
    .object({
      val: z.number(),
      b: z
        .object({
          val: z.number(),
          a: z
            .object({
              val: z.number(),
            })
            .nonstrict(),
        })
        .nonstrict(),
    })
    .nonstrict();

  const fragment = FragmentOnA.parse(a);
  console.log(JSON.stringify(fragment, null, 2));
});

test('invalid check', () => {
  expect(() => A.parse({} as any)).toThrow();
});

test('toJSON throws', () => {
  const checker = () => A.toJSON();
  expect(checker).toThrow();
});

test('schema getter', () => {
  (A as z.ZodLazy<any>).schema;
});

test('self recursion', () => {
  const BaseCategory = z.object({
    name: z.string(),
  });
  interface Category extends z.infer<typeof BaseCategory> {
    subcategories: Category[];
  }
  const Category: z.ZodType<Category> = BaseCategory.merge(
    z.object({
      subcategories: z.lazy(() => z.array(Category)),
    }),
  );

  const untypedCategory: any = {
    name: 'Category A',
  };
  // creating a cycle
  untypedCategory.subcategories = [untypedCategory];
  Category.parse(untypedCategory); // parses successfully
});
