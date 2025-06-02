// import { z } from "zod/v4";

import type { z } from "zod/v4";

export type RefinedSchema<T extends z.core.$ZodType | z.core.$ZodUnion = z.core.$ZodType | z.core.$ZodUnion> =
  T extends z.core.$ZodUnion
    ? RefinedUnionSchema<T> // <-- Type instantiation is excessively deep and possibly infinite.
    : never;

export type RefinedTypeSchema<T extends object> = T;
export type RefinedUnionSchema<T extends z.core.$ZodUnion> = T;
