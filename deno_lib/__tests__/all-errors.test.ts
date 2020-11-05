const test = Deno.test;
import { expect } from "https://deno.land/x/expect/mod.ts";import * as z from '../index.ts';

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
    expect(error.flatten()).toEqual({
      formErrors: [],
      fieldErrors: {
        a: ['Expected string, received null'],
        b: ['Expected string, received null'],
      },
    });
  }
});
