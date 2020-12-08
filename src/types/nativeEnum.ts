import * as z from "./base";

export interface ZodNativeEnumDef<T extends EnumLike = EnumLike>
  extends z.ZodTypeDef {
  t: z.ZodTypes.nativeEnum;
  values: T;
}

type EnumLike = { [k: string]: string | number; [nu: number]: string };

export class ZodNativeEnum<T extends EnumLike> extends z.ZodType<
  T[keyof T],
  ZodNativeEnumDef<T>
> {
  toJSON = () => this._def;
  static create = <T extends EnumLike>(values: T): ZodNativeEnum<T> => {
    return new ZodNativeEnum({
      t: z.ZodTypes.nativeEnum,
      values: values,
    });
  };
}
