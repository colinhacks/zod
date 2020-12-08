import * as z from '.';

const Schema = z.union([
  z.object({
    statusCode: z.literal(200),
    body: z.object({
      id: z.string(),
    }),
  }),
  z.object({
    statusCode: z.literal(403),
    body: z.object({
      message: z.string(),
      reason: z.string().nullable(),
    }),
  }),
]);

(async () => {
  const obj = {
    statusCode: 200,
    body: { id: 'f8a2ebc9-72ba-4f45-ad4d-16f956259ed3' },
  };
  console.log(Schema.parse(obj)); // Works
  console.log(await Schema.parseAsync(obj)); // Error
})();
