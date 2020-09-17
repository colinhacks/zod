import * as z from './base';
// import { ZodUnion } from './union';
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';

export type TypeOfTuple<T extends readonly[z.ZodTypeAny, ...z.ZodTypeAny[]] | readonly []> = {
  [k in keyof T]: T[k] extends z.ZodType<infer U> ? U : never;
};

export interface ZodTupleDef<
  T extends readonly [z.ZodTypeAny, ...z.ZodTypeAny[]] | readonly [] = [
    z.ZodTypeAny,
    ...z.ZodTypeAny[],
  ]
> extends z.ZodTypeDef {
  t: z.ZodTypes.tuple;
  items: T;
}

export class ZodTuple<
  T extends readonly [z.ZodTypeAny, ...z.ZodTypeAny[]] | readonly [] = readonly [z.ZodTypeAny, ...z.ZodTypeAny[]]

> extends z.ZodType<TypeOfTuple<T>, ZodTupleDef<T>> {
  toJSON = () => ({
    t: this._def.t,
    items: (this._def.items as readonly any[]).map(item => item.toJSON()),
  });

  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  static create = <T extends [z.ZodTypeAny, ...z.ZodTypeAny[]] | []>(
    schemas: T,
  ): ZodTuple<T> => {
    return new ZodTuple({
      t: z.ZodTypes.tuple,
      items: schemas,
    });
  };
}
