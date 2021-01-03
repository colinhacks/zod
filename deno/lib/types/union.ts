import { ZodTypes } from "../ZodTypes.ts";
import { ZodType, ZodTypeDef, ZodTypeAny } from "./base.ts";

// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';

export interface ZodUnionDef<
  T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]] = [
    ZodTypeAny,
    ZodTypeAny,
    ...ZodTypeAny[]
  ]
> extends ZodTypeDef {
  t: ZodTypes.union;
  options: T;
}

export class ZodUnion<
  T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]
> extends ZodType<T[number]["_output"], ZodUnionDef<T>, T[number]["_input"]> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = (): object => ({
    t: this._def.t,
    options: this._def.options.map((x) => x.toJSON()),
  });

  get options() {
    return this._def.options;
  }

  // distribute = <F extends (arg: T[number]) => ZodTypeAny>(f: F): ZodUnion<{ [k in keyof T]: ReturnType<F> }> => {
  //   return ZodUnion.create(this._def.options.map(f) as any);
  // };

  static create = <T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>(
    types: T
  ): ZodUnion<T> => {
    return new ZodUnion({
      t: ZodTypes.union,
      options: types,
    });
  };
}
