import type * as z from "zod";

const test = {} as z.ZodObject<z.ZodRawShape>;
const prop: z.core.$ZodType = test.shape.prop;

type MyShape = { readonly [k: string]: z.ZodType };
