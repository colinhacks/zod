import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
// import { ZodObject } from './object';

export interface ZodLazyDef<T extends z.ZodAny = z.ZodAny> extends z.ZodTypeDef {
  t: z.ZodTypes.lazy;
  getter: () => T;
}

export class ZodLazy<T extends z.ZodAny> extends z.ZodType<z.TypeOf<T>, ZodLazyDef<T>> {
  get schema(): T {
    return this._def.getter();
  }

  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => {
    throw new Error("Can't JSONify recursive structure");
  };

  static create = <T extends z.ZodAny>(getter: () => T): ZodLazy<T> => {
    return new ZodLazy({
      t: z.ZodTypes.lazy,
      getter: getter,
    });
  };

  //  static recursion = <Rels extends { [k: string]: any }, T extends ZodObject<any>>(
  //    getter: () => T,
  //  ) => {};
}

// type
