import * as z from './base';
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';
import { ZodErrorCode } from '../ZodError';
import { errorUtil } from '../helpers/errorUtil';

export interface ZodNumberDef extends z.ZodTypeDef {
  t: z.ZodTypes.number;
}

export class ZodNumber extends z.ZodType<number, ZodNumberDef> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;
  static create = (): ZodNumber => {
    return new ZodNumber({
      t: z.ZodTypes.number,
    });
  };

  min = (minimum: number, message?: errorUtil.ErrMessage) =>
    this._refinement({
      check: data => data >= minimum,
      code: ZodErrorCode.too_small,
      minimum,
      type: 'number',
      inclusive: true,
      ...errorUtil.errToObj(message),
    });

  max = (maximum: number, message?: errorUtil.ErrMessage) =>
    this._refinement({
      check: data => data <= maximum,
      code: ZodErrorCode.too_big,
      maximum,
      type: 'number',
      inclusive: true,
      ...errorUtil.errToObj(message),
    });

  int = (message?: errorUtil.ErrMessage) =>
    this._refinement({
      check: data => Number.isInteger(data),
      code: ZodErrorCode.invalid_type,
      expected: 'integer',
      received: 'number',
      ...errorUtil.errToObj(message),
    });

  positive = (message?: errorUtil.ErrMessage) =>
    this._refinement({
      check: data => data > 0,
      code: ZodErrorCode.too_small,
      minimum: 0,
      type: 'number',
      inclusive: false,
      ...errorUtil.errToObj(message),
    });

  negative = (message?: errorUtil.ErrMessage) =>
    this._refinement({
      check: data => data < 0,
      code: ZodErrorCode.too_big,
      maximum: 0,
      type: 'number',
      inclusive: false,
      ...errorUtil.errToObj(message),
    });

  nonpositive = (message?: errorUtil.ErrMessage) =>
    this._refinement({
      check: data => data <= 0,
      code: ZodErrorCode.too_big,
      maximum: 0,
      type: 'number',
      inclusive: true,
      ...errorUtil.errToObj(message),
    });

  nonnegative = (message?: errorUtil.ErrMessage) =>
    this._refinement({
      check: data => data >= 0,
      code: ZodErrorCode.too_small,
      minimum: 0,
      type: 'number',
      inclusive: true,
      ...errorUtil.errToObj(message),
    });
}
