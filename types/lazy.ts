import * as z from './base';

export interface ZodLazyDef<T extends z.ZodAny = z.ZodAny>
  extends z.ZodTypeDef {
  t: z.ZodTypes.lazy;
  getter: () => T;
}

export class ZodLazy<T extends z.ZodAny> extends z.ZodType<
  z.TypeOf<T>,
  ZodLazyDef<T>
> {
  get schema(): T {
    return this._def.getter();
  }

  toJSON = () => {
    throw new Error("Can't JSONify recursive structcture");
    // return {
    //   t: this._def.t,
    //   getter: this._def.getter().toJSON(),
    // };
  };

  static create = <T extends z.ZodAny>(getter: () => T): ZodLazy<T> => {
    return new ZodLazy({
      t: z.ZodTypes.lazy,
      getter: getter,
    });
  };
}
