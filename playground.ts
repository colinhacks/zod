import { z } from "./src";

async function main() {
  const schema = z.object({ x: z.unknown() });
  type s = z.infer<typeof schema>;
  // s has { x?: unknown } but should be { x: unknown }

  const result = schema.parse({});
  console.log(result);
}
main();
