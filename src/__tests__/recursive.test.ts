import * as z from '../index';

interface A {
  val: number;
  b: B;
}

interface B {
  val: number;
  a: A;
}

test('recursives', () => {
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
  A.parse(a);
  B.parse(b);
  expect(() => A.parse({})).toThrow();
});
