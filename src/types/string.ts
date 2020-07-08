import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
import { ZodErrorCode } from '..';
import { errorUtil } from '../helpers/errorUtil';
// import { ParseParams } from '../parser';

export interface ZodStringDef extends z.ZodTypeDef {
  t: z.ZodTypes.string;
  validation: {
    uuid?: true;
    custom?: ((val: any) => boolean)[];
  };
}

const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
const urlRegex = /^((https?|ftp):)?\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
const uuidRegex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/g;

export class ZodString extends z.ZodType<string, ZodStringDef> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;

  min = (minLength: number, message?: errorUtil.ErrMessage) =>
    this._refinement({
      check: data => data.length >= minLength,
      code: ZodErrorCode.too_small,
      minimum: minLength,
      type: 'string',
      inclusive: true,
      ...errorUtil.errToObj(message),
    });
  // this.refine(data => data.length >= minLength, msg || `Value must be ${minLength} or more characters long`);

  max = (maxLength: number, message?: errorUtil.ErrMessage) =>
    this._refinement({
      check: data => data.length <= maxLength,
      code: ZodErrorCode.too_big,
      maximum: maxLength,
      type: 'string',
      inclusive: true,
      ...errorUtil.errToObj(message),
    });
  //  max = (maxLength: number, msg?: string) =>
  //    this.refine(data => data.length <= maxLength, msg || `Value must be ${maxLength} or fewer characters long`);
  length = (len: number, message?: errorUtil.ErrMessage) => this.min(len, message).max(len, message);
  //  length = (len: number, msg?: string) =>
  //    this.refine(data => data.length == len, msg || `Value must be ${len} characters long.`);

  email = (message?: errorUtil.ErrMessage) =>
    this._refinement({
      check: data => emailRegex.test(data),
      code: ZodErrorCode.invalid_string,
      validation: 'email',
      ...errorUtil.errToObj(message),
    });
  //this.refine(data => emailRegex.test(data), errorUtil.errToObj(message));

  url = (message?: errorUtil.ErrMessage) =>
    this._refinement({
      check: data => urlRegex.test(data),
      code: ZodErrorCode.invalid_string,
      validation: 'url',
      ...errorUtil.errToObj(message),
    });
  //  url = (message?: errorUtil.ErrMessage) => this.refine(data => urlRegex.test(data), errorUtil.errToObj(message));

  uuid = (message?: errorUtil.ErrMessage) =>
    this._refinement({
      check: data => uuidRegex.test(data),
      code: ZodErrorCode.invalid_string,
      validation: 'uuid',
      ...errorUtil.errToObj(message),
    });

  nonempty = (message?: errorUtil.ErrMessage) => this.min(1, errorUtil.errToObj(message));
  // validate = <Val extends (arg:this['_type'])=>boolean>(check:Val)=>{
  //   const currChecks = this._def.validation.custom || [];
  //   return new ZodString({
  //     ...this._def,
  //     validation: {
  //       ...this._def.validation,
  //       custom: [...currChecks, check],
  //     },
  //   });
  // }
  // wrap: (value: this['_type'], params?: ParseParams) => ZodValue<this> = (value, params) => {
  //   return new ZodValue(this, this.parse(value, params));
  // };

  static create = (): ZodString => {
    return new ZodString({
      t: z.ZodTypes.string,
      validation: {},
    });
  };
}
// export class ZodValue<S extends z.ZodType<any, any>> {
//   value: S['_type'];
//   schema: S;
//   constructor(schema: S, value: S['_type']) {
//     this.value = value;
//     this.schema = schema;
//   }
// }
