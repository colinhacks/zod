import { z, ZodFormattedError } from "./src";

enum Color {
  RED,
  GREEN,
  BLUE,
}

console.log(Color[1]);
async function main() {
  const schema = z.string().catch("1234");
  const result = await schema.parse(1234);

  console.log(Object.keys(Color));
}
main();
