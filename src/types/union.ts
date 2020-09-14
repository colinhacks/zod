import * as z from './base';
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';

export interface ZodUnionDef<
<<<<<<< HEAD
  T extends [z.ZodTypeAny, ...z.ZodTypeAny[]] = [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]
=======
  T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]] = [
    z.ZodTypeAny,
    z.ZodTypeAny,
    ...z.ZodTypeAny[],
  ]
>>>>>>> dev
> extends z.ZodTypeDef {
  t: z.ZodTypes.union;
  options: T;
}

<<<<<<< HEAD
export class ZodUnion<T extends [z.ZodTypeAny, ...z.ZodTypeAny[]]> extends z.ZodType<
  T[number]['_type'],
  ZodUnionDef<T>
> {
  get options(): T {
    return this._def.options;
  }
=======
export class ZodUnion<
  T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]
> extends z.ZodType<T[number]['_type'], ZodUnionDef<T>> {
>>>>>>> dev
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = (): object => ({
    t: this._def.t,
    options: this._def.options.map(x => x.toJSON()),
  });

  // distribute = <F extends (arg: T[number]) => z.ZodTypeAny>(f: F): ZodUnion<{ [k in keyof T]: ReturnType<F> }> => {
  //   return ZodUnion.create(this._def.options.map(f) as any);
  // };

<<<<<<< HEAD
  static create = <T extends [z.ZodTypeAny, ...z.ZodTypeAny[]]>(types: T): ZodUnion<T> => {
=======
  static create = <T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>(
    types: T,
  ): ZodUnion<T> => {
>>>>>>> dev
    return new ZodUnion({
      t: z.ZodTypes.union,
      options: types,
    });
  };
}
