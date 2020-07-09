import * as z from '.';

const A = z
  .object({
    a: z.string().optional(),
    b: z.number().min(3),
    c: z.boolean().array(),
  })
  .refine(obj => obj.c[0] === true, { message: 'First item in c must be true', path: ['c'] })
  .optional();

// A.parse({ asdf: 'asdf' });
// A.parse({ asdf: undefined });
// A.parse(undefined);
// A.parse({});
// A.parse({ asdf: 1234 });

A.parseAsync({ a: 1324, b: 2, c: [false, 'false'], d: 1234 }).catch(err => {
  console.log(err.formErrors);
});
// // z.date().parse(new Date('invalid'));

// // const myFunc = z.function(z.tuple([z.string()]), z.boolean()).implement(str => str.length > 5);

// // try {
// //   myFunc(12 as any);
// // } catch (err) {
// //   console.log(JSON.stringify(err, null, 2));
// // }

// const $Cat = z.object({
//   type: z.literal('cat'),
//   ability: z.literal('meow'),
// });
// const $Dog = z.object({
//   type: z.literal('dog'),
//   ability: z.literal('bark'),
// });
// const $AnimalAbility = z.union([$Cat, $Dog]).distribute($A => $A.shape.ability);
// type Ability = z.infer<typeof $AnimalAbility>; // "meow" | "bark"
