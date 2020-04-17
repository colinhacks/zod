// import * as z from '.';

// const Animal = z
//   .object({
//     species: z
//       .string()
//       .nullable()
//       .nullable(),
//   })
//   .augment({
//     population: z.number(),
//   });

// type Animal = z.infer<typeof Animal>;

// const masked = Animal.mask({
//   species: true,
// });

// masked.parse({ species: 'asdf', population: 1234 } as any);

// const person = z.object({ name: z.string(), bestfriend: z.lazy(() => person).optional() });

// export const stackProps = z
//     .object({
//         direction: z.enum(["asdf","qwer"]).optional(),
//         wrap: z.boolean().optional(),
//         grow: z.boolean().optional(),
//         shrink: z.boolean().optional(),
//     })

// type PropType = z.TypeOf<typeof stackProps>
