import { z } from "./src";

async function main() {
  const schema = z.array(z.string()).min(5);
  console.log(schema.safeParse("1234".split("")));
  console.log(schema.safeParse("12341234".split("")));
}
main();
