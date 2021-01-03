import { ZodTypes } from "../ZodTypes";
import { ZodType, ZodTypeDef } from "./base";

export interface ZodNativeEnumDef<T extends EnumLike = EnumLike>
  extends ZodTypeDef {
  t: ZodTypes.nativeEnum;
  values: T;
}

type EnumLike = { [k: string]: string | number; [nu: number]: string };

export class ZodNativeEnum<T extends EnumLike> extends ZodType<
  T[keyof T],
  ZodNativeEnumDef<T>
> {
  toJSON = () => this._def;
  static create = <T extends EnumLike>(values: T): ZodNativeEnum<T> => {
    return new ZodNativeEnum({
      t: ZodTypes.nativeEnum,
      values: values,
    });
  };
}
