import * as z from "zod/v4-mini"

const schema = z.string().check(z.minLength(5));

console.log(schema.parse("hi"));
