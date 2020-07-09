import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';

export interface ZodUnionDef<
  T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]] = [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]
> extends z.ZodTypeDef {
  t: z.ZodTypes.union;
  options: T;
}

export class ZodUnion<T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]> extends z.ZodType<
  T[number]['_type'],
  ZodUnionDef<T>
> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => ({
    t: this._def.t,
    options: this._def.options.map(x => x.toJSON()),
  });

  distribute = <U extends z.ZodTypeAny>(f: (option: T[number]) => U): ZodUnion<[U, U, ...U[]]> => {
    return ZodUnion.create(this._def.options.map(f) as [U, U, ...U[]]);
  }

  static create = <T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>(types: T): ZodUnion<T> => {
    return new ZodUnion({
      t: z.ZodTypes.union,
      options: types,
    });
  };

  static make = <T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>(...types: T): ZodUnion<T> => {
    return new ZodUnion({
      t: z.ZodTypes.union,
      options: types,
    });
  };
}
