import * as z from './base';
// import { ZodUndefined } from './undefined';

// import { ZodNull } from './null';

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
  T['_type'] | undefined,
  ZodOptionalDef<T>
> {
  optional: () => ZodOptionalType<this> = () => this as ZodOptionalType<this>; // An optional optional is the original optional

  // null nullable: () => ZodOptional<[this, ZodNull]> = () => ZodOptional.create([this, ZodNull.create()]);

  toJSON = () => ({
    t: this._def.t,
    innerType: this._def.innerType,
  });

  // distribute = would only need to delegate to the innerType i think

  // distribute = <F extends (arg: T[number]) => z.ZodTypeAny>(f: F): ZodOptional<{ [k in keyof T]: ReturnType<F> }> => {
  //   return ZodOptional.create(this._def.options.map(f) as any);
  // };
  static create = <T extends z.ZodTypeAny>(type: T): ZodOptionalType<T> => {
    if (type.isOptional()) return type as ZodOptionalType<T>;

    return new ZodOptional({
      t: z.ZodTypes.optional,
      innerType: type,
    }) as ZodOptionalType<T>;
  };
}
