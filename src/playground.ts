// import * as z from '.';
// const Direction = z.union([
//   z.literal('column'),
//   z.literal('row'),
//   z.literal('column-reverse'),
//   z.literal('row-reverse'),
// ]);

// const Alignment = z.union([
//   z.literal('flex-start'),
//   z.literal('flex-end'),
//   z.literal('center'),
//   z.literal('space-between'),
//   z.literal('space-around'),
//   z.literal('space-evenly'),
//   z.literal('baseline'),
//   z.literal('stretch'),
// ]);

// export const stackProps = z
//   .object({
//     direction: Direction.optional(),
//     horizontalAlign: Alignment.optional(),
//     verticalAlign: Alignment.optional(),
//     wrap: z.boolean().optional(),
//     grow: z.boolean().optional(),
//     shrink: z.boolean().optional(),
//   })
//   // .merge(zodComponentProps);

//   type PropType = z.TypeOf<typeof stackProps>
