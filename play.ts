// library code
import * as z from "zod/v4/core";

function acceptObjectSchema<T extends z.$ZodObject>(schema: T){
  // parse data
  z.parse(schema, { /* somedata */});
  // inspect internals
  schema._zod.def.shape;
}



// user
acceptObjectSchema(
