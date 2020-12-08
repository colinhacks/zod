import { crazySchema } from "../crazySchema";
import * as z from "../index";

test("ZodCodeGenerator", () => {
  const gen = new z.ZodCodeGenerator();
  gen.generate(crazySchema);
  gen.dump();
});
