import * as z from './base';
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';
import { ZodErrorCode } from '../ZodError';

export interface ZodArrayDef<T extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
  t: z.ZodTypes.array;
  type: T;
  nonempty: boolean;
}


export class ZodArray<T extends z.ZodTypeAny> extends z.ZodType<T['_type'][], ZodArrayDef<z.ZodTypeAny>> {
  toJSON = () => {
    return {
      t: this._def.t,
      nonempty: this._def.nonempty,
      type: this._def.type.toJSON(),
    };
  };

  get element() {
    return this._def.type;
  }

  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  min = (minLength: number, message?: string | { message?: string }) =>
    this._refinement({
      check: data => data.length >= minLength,
      code: ZodErrorCode.too_small,
      type: 'array',
      inclusive: true,
      minimum: minLength,
      ...(typeof message === 'string' ? { message } : message),
    });

  max = (maxLength: number, message?: string | { message?: string }) =>
    this._refinement({
      check: data => data.length <= maxLength,
      code: ZodErrorCode.too_big,
      type: 'array',
      inclusive: true,
      maximum: maxLength,
      ...(typeof message === 'string' ? { message } : message),
    });

  length = (len: number, message?: string) => this.min(len, { message }).max(len, { message });

  nonempty: () => ZodNonEmptyArray<T> = <T extends z.ZodTypeAny>() => {
    return new ZodNonEmptyArray<T> ({ ...this._def, nonempty: true } as any);
  };

  static create = <T extends z.ZodTypeAny>(schema: T): T extends ZodArray<z.ZodTypeAny> ? ZodArray<ZodArray<z.ZodTypeAny>> : ZodArray<T> => {
    return new ZodArray({
      t: z.ZodTypes.array,
      type: schema,
      nonempty: false,
    }) as any;
  };
}

export class ZodNonEmptyArray<T extends z.ZodTypeAny> extends z.ZodType<[T['_type'], ...T['_type'][]], ZodArrayDef<T>> {
  toJSON = () => {
    return {
      t: this._def.t,
      type: this._def.type.toJSON(),
    };
  };

  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  min = (minLength: number, message?: string | { message?: string }) =>
    this._refinement({
      check: data => data.length >= minLength,
      code: ZodErrorCode.too_small,
      minimum: minLength,
      type: 'array',
      inclusive: true,
      ...(typeof message === 'string' ? { message } : message),
    });

  max = (maxLength: number, message?: string | { message?: string }) =>
    this._refinement({
      check: data => data.length <= maxLength,
      code: ZodErrorCode.too_big,
      maximum: maxLength,
      type: 'array',
      inclusive: true,
      ...(typeof message === 'string' ? { message } : message),
    });

  length = (len: number, message?: string) => this.min(len, { message }).max(len, { message });
}
