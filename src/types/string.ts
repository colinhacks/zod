import * as z from './base';
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';
import { StringValidation, ZodIssueCode } from '../ZodError';
import { errorUtil } from '../helpers/errorUtil';

export interface ZodStringDef extends z.ZodTypeDef {
  t: z.ZodTypes.string;
  validation: {
    uuid?: true;
    custom?: ((val: any) => boolean)[];
  };
}

const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
const uuidRegex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/i;

export class ZodString extends z.ZodType<string, ZodStringDef> {
  inputSchema = this;
  outputSchema = this;

  toJSON = () => this._def;
  min = (minLength: number, message?: errorUtil.ErrMessage) =>
    this.refinement(data => data.length >= minLength, {
      code: ZodIssueCode.too_small,
      minimum: minLength,
      type: 'string',
      inclusive: true,
      ...errorUtil.errToObj(message),
    });

  max = (maxLength: number, message?: errorUtil.ErrMessage) =>
    this.refinement(data => data.length <= maxLength, {
      code: ZodIssueCode.too_big,
      maximum: maxLength,
      type: 'string',
      inclusive: true,
      ...errorUtil.errToObj(message),
    });

  length(len: number, message?: errorUtil.ErrMessage) {
    return this.min(len, message).max(len, message);
  }

  protected _regex = (
    regex: RegExp,
    validation: StringValidation,
    message?: errorUtil.ErrMessage,
  ) =>
    this.refinement(data => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,

      ...errorUtil.errToObj(message),
    });

  email = (message?: errorUtil.ErrMessage) =>
    this._regex(emailRegex, 'email', message);

  url = (message?: errorUtil.ErrMessage) =>
    this.refinement(
      data => {
        try {
          new URL(data);
          return true;
        } catch {
          return false;
        }
      },
      {
        code: ZodIssueCode.invalid_string,
        validation: 'url',
        ...errorUtil.errToObj(message),
      },
    );

  // url = (message?: errorUtil.ErrMessage) => this._regex(urlRegex, 'url', message);

  uuid = (message?: errorUtil.ErrMessage) =>
    this._regex(uuidRegex, 'uuid', message);

  regex = (regexp: RegExp, message?: errorUtil.ErrMessage) =>
    this._regex(regexp, 'regex', message);

  nonempty = (message?: errorUtil.ErrMessage) =>
    this.min(1, errorUtil.errToObj(message));

  static create = (): ZodString => {
    return new ZodString({
      t: z.ZodTypes.string,
      validation: {},
    });
  };
}
