import * as z from "zod";

const schema = z.boolean();
console.log(schema.parse(true));
