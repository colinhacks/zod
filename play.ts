import * as z from "@zod/mini";

const object = z.object({ foo: z.string() });
type ObjectType = z.infer<typeof object>; // { foo: string }

const partial = z.partial(object);

type PartialType = z.infer<typeof partial>; // object
