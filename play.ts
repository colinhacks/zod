import type { ZodType, ZodUnion, z } from "zod/v4";

export type RefinedSchema<T extends z.ZodType<object> | ZodUnion> = T extends ZodUnion
  ? RefinedUnionSchema<T>
  : T extends ZodType<infer O extends object>
    ? RefinedTypeSchema<O>
    : never;

export type RefinedTypeSchema<T extends object> = any;

export type RefinedUnionSchema<T extends ZodUnion> = any;

type A = z.ZodUnion extends z.ZodType<object> ? true : false;
type B = z.ZodType<object> extends z.ZodUnion ? true : false;
