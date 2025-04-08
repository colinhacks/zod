import * as z from "zod";

const schema = z.string().min(5);
console.log(schema.parse("hi"));
