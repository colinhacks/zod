import { z } from "zod/v4";

console.dir(z.toJSONSchema(z.string().startsWith("hello").includes("cruel").endsWith("world").regex(/stuff/)), {
  depth: null,
});
