import * as z from "zod/mini"

const schema = z.string();

console.log(schema.parse("hello"));

