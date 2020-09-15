import * as z from './base';
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';

export interface ZodUnionDef<
  T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]] = [
    z.ZodTypeAny,
    z.ZodTypeAny,
    ...z.ZodTypeAny[],
  ]
> extends z.ZodTypeDef {
  t: z.ZodTypes.union;
  options: T;
}

export class ZodUnion<
  T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]
> extends z.ZodType<T[number]['_input'], ZodUnionDef<T>, T[number]['_output']> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = (): object => ({
    t: this._def.t,
    options: this._def.options.map(x => x.toJSON()),
  });

  // distribute = <F extends (arg: T[number]) => z.ZodTypeAny>(f: F): ZodUnion<{ [k in keyof T]: ReturnType<F> }> => {
  //   return ZodUnion.create(this._def.options.map(f) as any);
  // };

  static create = <T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>(
    types: T,
  ): ZodUnion<T> => {
    return new ZodUnion({
      t: z.ZodTypes.union,
      options: types,
    });
  };
}
