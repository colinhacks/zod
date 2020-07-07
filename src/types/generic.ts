import { ZodTypeAny, ZodLazy } from '..';
import { ZodType, ZodTypeDef, ZodTypes } from './base';
import { ZodNull } from './null';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';

export interface ZodGenericDef<
  T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]] = [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]],
  U extends ZodTypeAny = ZodTypeAny
> extends ZodTypeDef {
  t: ZodTypes.generic;
  options: ZodUnion<T> | ZodLazy<ZodUnion<T>>;
  body: (t: T[number]) => U;
}

export class ZodGeneric<T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]], U extends ZodTypeAny> extends ZodType<
  U['_type'],
  ZodGenericDef<T, U>
> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  static create = <T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]], U extends ZodTypeAny>(
    options: ZodUnion<T> | ZodLazy<ZodUnion<T>>,
    body: (t: T[number]) => U,
  ): ZodGeneric<T, U> => {
    return new ZodGeneric({
      t: ZodTypes.generic,
      options,
      body,
    });
  };

  toJSON = () => {
    throw new Error('Cannot convert generic type to JSON');
  };
}
