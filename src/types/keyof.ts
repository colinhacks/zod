import * as z from './base';
import { EnumLike } from './nativeEnum';

export interface ZodKeyofDef<T extends EnumLike = EnumLike>
  extends z.ZodTypeDef {
  t: z.ZodTypes.keyof;
  values: (keyof T)[];
}

export class ZodKeyof<T extends EnumLike> extends z.ZodType<
  keyof T,
  ZodKeyofDef<T>
> {
  toJSON = (): object => ({
    t: this._def.t,
    values: this._def.values.map((x) => x.toString()),
  });

  static create = <T extends EnumLike>(object: T): ZodKeyof<T> => {
    return new ZodKeyof<T>({
      t: z.ZodTypes.keyof,
      // Note that this cast is not correct in the general case
      // See e.g. https://github.com/Microsoft/TypeScript/issues/12870
      values: Object.keys(object) as (keyof T)[],
    });
  };
}
