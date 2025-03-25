import * as z from "zod";

const schema = z.string();
console.log(schema.parse("hi"));
