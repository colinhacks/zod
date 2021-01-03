import * as z from "./base.ts";

export interface ZodNullableDef<T extends z.ZodTypeAny = z.ZodTypeAny>
  extends z.ZodTypeDef {
  t: z.ZodTypes.nullable;
  innerType: T;
}

// This type allows for nullable flattening
export type ZodNullableType<
  T extends z.ZodTypeAny
> = T extends ZodNullable<z.ZodTypeAny> ? T : ZodNullable<T>;

export class ZodNullable<
  T extends z.ZodTypeAny
  //  Output extends T['_output'] | null = T['_output'] | null,
  //  Input extends T['_input'] | null = T['_input'] | null
> extends z.ZodType<
  T["_output"] | null,
  ZodNullableDef<T>,
  T["_input"] | null
> {
  // An nullable nullable is the original nullable
  // nullable: () => ZodNullableType<this> = () => this as ZodNullableType<this>;
  toJSON = () => ({
    t: this._def.t,
    innerType: this._def.innerType.toJSON(),
  });

  static create = <T extends z.ZodTypeAny>(type: T): ZodNullableType<T> => {
    if (type instanceof ZodNullable) return type as ZodNullableType<T>;
    return new ZodNullable({
      t: z.ZodTypes.nullable,
      innerType: type,
    }) as ZodNullableType<T>;
  };
}
