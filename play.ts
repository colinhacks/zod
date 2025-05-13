import type * as z4 from "zod";
import * as z from "zod3";

z;

type Schema = z.ZodType | z4.core.$ZodType;

declare const schema: Schema;

if ("_zod" in schema) {
  schema._zod;
} else {
  schema._def;
}
