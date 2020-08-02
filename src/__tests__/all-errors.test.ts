import * as z from '..';

test('all errors', () => {
  const propertySchema = z.string();
  const schema = z.object({
    a: propertySchema,
    b: propertySchema,
    c: propertySchema.min(0), // The error is properly included when schema reference changes.
  });

  try {
    schema.parse({
      a: null,
      b: null,
      c: null,
    });
  } catch (error) {
    expect(error.formErrors).toStrictEqual({
      formErrors: [],
      fieldErrors: {
        a: ['Expected string, received null'],
        b: ['Expected string, received null'],
        c: ['Expected string, received null'],
      },
    });
  }
});
