import { z, ZodFormattedError } from "./src";

enum Color {
  RED,
  GREEN,
  BLUE,
}

z.string().datetime();

async function main() {
  const schema = z.coerce.string();
  console.log(schema.parse(1234));
  console.log(schema.parse(1234n));
  console.log(schema.parse(true));
  console.log(schema.parse(new Date()));

  const n = z.coerce.number();
  console.log(schema.parse(1234));
  console.log(schema.parse(1234n));
  console.log(schema.parse(true));
  console.log(schema.parse(new Date()));
}
main();

const user = z
  .object({
    email: z.string(),
    username: z.string(),
  })
  .partial();

const requiredEmail = user.required({
  email: true,
});

const TUNA = Symbol("tuna");
const schema = z.literal(TUNA);
schema.parse(TUNA); // Symbol(tuna)
schema.parse(Symbol("nottuna")); // Error
