import { ZodTypes } from "../ZodTypes";
import { ZodType, ZodTypeDef } from "./base/type";
import { ZodTypeAny } from "./base/type-any";

export interface ZodNullableDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  t: ZodTypes.nullable;
  innerType: T;
}

// This type allows for nullable flattening
export type ZodNullableType<
  T extends ZodTypeAny
> = T extends ZodNullable<ZodTypeAny> ? T : ZodNullable<T>;

export class ZodNullable<
  T extends ZodTypeAny
  //  Output extends T['_output'] | null = T['_output'] | null,
  //  Input extends T['_input'] | null = T['_input'] | null
> extends ZodType<T["_output"] | null, ZodNullableDef<T>, T["_input"] | null> {
  // An nullable nullable is the original nullable
  // nullable: () => ZodNullableType<this> = () => this as ZodNullableType<this>;
  toJSON = () => ({
    t: this._def.t,
    innerType: this._def.innerType.toJSON(),
  });

  static create = <T extends ZodTypeAny>(type: T): ZodNullableType<T> => {
    if (type instanceof ZodNullable) return type as ZodNullableType<T>;
    return new ZodNullable({
      t: ZodTypes.nullable,
      innerType: type,
    }) as ZodNullableType<T>;
  };
}
