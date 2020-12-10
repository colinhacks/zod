import * as z from "./base";
import { ZodTypes } from "../ZodTypes"

export interface ZodNativeEnumDef<T extends EnumLike = EnumLike>
  extends z.ZodTypeDef {
  t: ZodTypes.nativeEnum;
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
      t: ZodTypes.nativeEnum,
      values: values,
    });
  };
}
