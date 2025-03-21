import * as z from "@zod/mini";
z;

const b = z.literal(["z.string()"]);
b.def;
