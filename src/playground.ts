// import * as z from '.';
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
