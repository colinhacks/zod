import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';

export interface ZodArrayDef<T extends z.ZodAny = z.ZodAny> extends z.ZodTypeDef {
  t: z.ZodTypes.array;
  type: T;
  nonempty: boolean;
}

export class ZodArray<T extends z.ZodAny> extends z.ZodType<T['_type'][], ZodArrayDef<T>> {
  toJSON = () => {
    return {
      t: this._def.t,
      nonempty: this._def.nonempty,
      type: this._def.type.toJSON(),
    };
  };

  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  nonempty: () => ZodNonEmptyArray<T> = () => {
    return new ZodNonEmptyArray({ ...this._def, nonempty: true });
  };

  static create = <T extends z.ZodAny>(schema: T): ZodArray<T> => {
    return new ZodArray({
      t: z.ZodTypes.array,
      type: schema,
      nonempty: false,
    });
  };
}

export class ZodNonEmptyArray<T extends z.ZodAny> extends z.ZodType<[T['_type'], ...T['_type'][]], ZodArrayDef<T>> {
  toJSON = () => {
    return {
      t: this._def.t,
      type: this._def.type.toJSON(),
    };
  };

  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  static create = <T extends z.ZodAny>(schema: T): ZodArray<T> => {
    return new ZodArray({
      t: z.ZodTypes.array,
      nonempty: true,
      type: schema,
    });
  };
}
