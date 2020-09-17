import * as z from '../index';

test('all errors', () => {
  const propertySchema = z.string();
  const schema = z.object({
    a: propertySchema,
    b: propertySchema,
  });

  try {
    schema.parse({
      a: null,
      b: null,
    });
  } catch (error) {
    expect(error.flatten()).toStrictEqual({
      formErrors: [],
      fieldErrors: {
        a: ['Expected string, received null'],
        b: ['Expected string, received null'],
      },
    });
  }
});
