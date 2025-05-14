import * as z from "zod/v4-mini"

const schema = z.boolean();
console.log(schema.parse(true));
