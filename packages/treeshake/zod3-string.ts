import * as z from "zod3";

const schema = z.string();
console.log(schema.parse("hi"));
