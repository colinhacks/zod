import * as z from '.';

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
  console.log(error);
}
