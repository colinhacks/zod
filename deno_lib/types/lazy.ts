import * as z from './base.ts';
// import { ZodUndefined } from './undefined.ts';
// import { ZodNull } from './null.ts';
// import { ZodUnion } from './union.ts';

export interface ZodLazyDef<T extends z.ZodTypeAny = z.ZodTypeAny>
  extends z.ZodTypeDef {
  t: z.ZodTypes.lazy;
  getter: () => T;
}

export class ZodLazy<T extends z.ZodTypeAny> extends z.ZodType<
  z.output<T>,
  ZodLazyDef<T>,
  z.input<T>
> {
  get schema(): T {
    return this._def.getter();
  }

  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => {
    throw new Error("Can't JSONify recursive structure");
  };

  static create = <T extends z.ZodTypeAny>(getter: () => T): ZodLazy<T> => {
    return new ZodLazy({
      t: z.ZodTypes.lazy,
      getter: getter,
    });
  };
}
