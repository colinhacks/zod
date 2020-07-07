/* eslint-disable @typescript-eslint/no-explicit-any */
import * as z from './base';
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';
import { ZodObject } from './object';
// import { ZodObject } from './object';

export interface ZodLazyObjectDef<T extends ZodObject<any> = ZodObject<any>> extends z.ZodTypeDef {
  t: z.ZodTypes.lazyobject;
  getter: () => T;
}

export class ZodLazyObject<T extends ZodObject<any>> extends z.ZodType<z.TypeOf<T>, ZodLazyObjectDef<T>> {
  get schema(): T {
    return this._def.getter();
  }

  optional = () => {
    return this;
  };

  nullable = () => {
    return this;
  };

  toJSON = () => {
    throw new Error("Can't JSONify recursive structure");
  };

  static create = <T extends ZodObject<any>>(getter: () => T): ZodLazyObject<T> => {
    return new ZodLazyObject({
      t: z.ZodTypes.lazyobject,
      getter,
    });
  };

  augment = (arg: any) => {
    return ZodLazyObject.create(() => this._def.getter().augment(arg));
  };

  //  static recursion = <Rels extends { [k: string]: any }, T extends ZodObject<any>>(
  //    getter: () => T,
  //  ) => {};
}

// type
