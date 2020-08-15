import * as z from '.';

try {
  z.union([z.object({ a: z.number() }), z.object({ b: z.number() })]).parse({ t: 1 });
} catch (err) {
  if (err instanceof z.ZodError) {
    console.log(JSON.stringify(err.errors, null, 2));
  }
}
