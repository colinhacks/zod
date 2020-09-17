import * as z from './base';

export interface ZodOptionalDef<T extends z.ZodTypeAny = z.ZodTypeAny>
  extends z.ZodTypeDef {
  t: z.ZodTypes.optional;
  innerType: T;
}

// This type allows for optional flattening
export type ZodOptionalType<T extends z.ZodTypeAny> = T extends ZodOptional<
  z.ZodTypeAny
>
  ? T
  : ZodOptional<T>;

export class ZodOptional<T extends z.ZodTypeAny> extends z.ZodType<
  T['_output'] | undefined,
  ZodOptionalDef<T>,
  T['_input'] | undefined
> {
  // An optional optional is the original optional
  // optional: () => ZodOptionalType<this> = () => this as ZodOptionalType<this>;
  toJSON = () => ({
    t: this._def.t,
    innerType: this._def.innerType.toJSON(),
  });

  static create = <T extends z.ZodTypeAny>(type: T): ZodOptionalType<T> => {
    if (type instanceof ZodOptional) return type as ZodOptionalType<T>;

    return new ZodOptional({
      t: z.ZodTypes.optional,
      innerType: type,
    }) as ZodOptionalType<T>;
  };
}
