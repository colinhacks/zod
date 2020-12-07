// import * as z from '.';

// const formValuesSchema = z.object({
//   name: z.string(),
//   company: z.string(),
//   email: z.string().email(),
// });

// // only informs, that name and company is required, doesn't report about invalid email
// formValuesSchema.parse({
//   email: 'aaa',
// });

// // now when other values are present, informs about invalid email
// formValuesSchema.parse({
//   name: 'lorem',
//   email: 'aaa',
//   company: 'ipsum',
// });
