import { compile } from "./packages/zod/src/v4/core/compile.js";
import * as z from "./packages/zod/src/v4/index.js";

const schema = z.object({ name: z.string(), age: z.number() });
const validate = compile(schema);
console.log(validate({ name: "Alice", age: 30 }));
