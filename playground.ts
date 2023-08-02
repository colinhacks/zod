import { z } from "./src/index";

const schema = z.nan();
console.log(schema);
const result = schema.parse("John");
console.log(result);
