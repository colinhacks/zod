import * as z from '..';

test('refinement', () => {
  const obj1 = z.object({
    first: z.string(),
    second: z.string(),
  });
  const obj2 = obj1.partial();
  const obj3 = obj2.refine(data => data.first || data.second, 'Either first or second should be filled in.');

  expect(obj1 === (obj2 as any)).toEqual(false);
  expect(obj2 === obj3).toEqual(false);

  expect(() => obj1.parse({})).toThrow();
  expect(() => obj2.parse({ third: 'adsf' })).toThrow();
  expect(() => obj3.parse({})).toThrow();
  obj3.parse({ first: 'a' });
  obj3.parse({ second: 'a' });
  obj3.parse({ first: 'a', second: 'a' });
});

test('refinement 2', () => {
  try {
    const validationSchema = z
      .object({
        email: z.string().email(),
        password: z.string(),
        confirmPassword: z.string(),
      })
      .refine(data => data.password === data.confirmPassword, 'Both password and confirmation must match');

    validationSchema.parse({
      email: 'aaaa@gmail.com',
      password: 'aaaaaaaa',
      confirmPassword: 'bbbbbbbb',
    });
  } catch (err) {
    console.log(JSON.stringify(err.errors, null, 2));
  }
});
