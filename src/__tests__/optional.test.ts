import * as z from '../index';

function checkSameOptional(a: z.ZodTypeAny) {
  expect(JSON.stringify(z.optional(a).toJSON())).toMatch(
    JSON.stringify(a.optional().toJSON()),
  );
}

it('Should be the same optional as anywhere else', () => {
  checkSameOptional(z.string());
  checkSameOptional(z.number());
  checkSameOptional(z.null());
  checkSameOptional(z.undefined());
  checkSameOptional(z.object({}));
  checkSameOptional(z.tuple([]));
  checkSameOptional(z.boolean());
  checkSameOptional(z.string().min(3));
  checkSameOptional(z.unknown());
  checkSameOptional(z.union([z.number(), z.boolean()]));
  checkSameOptional(z.union([z.number(), z.undefined()]));
  checkSameOptional(z.any());

  checkSameOptional(z.object({ a: z.string() }));
  checkSameOptional(z.object({ a: z.string() }).partial());
  checkSameOptional(z.object({ a: z.string().optional() }));
  checkSameOptional(z.object({ a: z.string().optional() }).partial());
});

function checkErrors(
  a: z.ZodTypeAny,
  bad: any,
) {
  let expected;
  expected = expected;
  try {
    a.parse(bad);
  } catch (error) {
    expected = error.formErrors;
  }
  try {
    a.optional().parse(bad);
  } catch (error) {
    expect(error.formErrors).toStrictEqual(expected);
  }
}

it('Should have error messages appropriate for the underlying type', () => {
  checkErrors(z.string().min(2), 1)
  checkErrors(z.number().min(2), 1)
  checkErrors(z.boolean(), "")
  checkErrors(z.undefined(), null)
  checkErrors(z.null(), {})
  checkErrors(z.object({}), 1)
  checkErrors(z.tuple([]), 1)
  checkErrors(z.unknown(), 1)
});
