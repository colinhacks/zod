import { util } from './helpers/util.ts';
import { ZodIssueCode, ZodIssueOptionalMessage } from './ZodError.ts';

type ErrorMapCtx = {
  defaultError: string;
  data: any;
};

export type ZodErrorMap = typeof defaultErrorMap;

export const defaultErrorMap = (
  error: ZodIssueOptionalMessage,
  _ctx: ErrorMapCtx
): { message: string } => {
  let message: string;
  switch (error.code) {
    case ZodIssueCode.invalid_type:
      if (error.received === 'undefined') {
        message = 'Required';
      } else {
        message = `Expected ${error.expected}, received ${error.received}`;
      }
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${error.keys
        .map((k) => `'${k}'`)
        .join(', ')}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${error.options
        .map((val) => (typeof val === 'string' ? `'${val}'` : val))
        .join(' | ')}, received ${
        typeof _ctx.data === 'string' ? `'${_ctx.data}'` : _ctx.data
      }`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (error.validation !== 'regex') message = `Invalid ${error.validation}`;
      else message = 'Invalid';
      break;
    case ZodIssueCode.too_small:
      if (error.type === 'array')
        message = `Should have ${error.inclusive ? `at least` : `more than`} ${
          error.minimum
        } item(s)`;
      else if (error.type === 'string')
        message = `Should be ${error.inclusive ? `at least` : `over`} ${
          error.minimum
        } character(s) long`;
      else if (error.type === 'number')
        message = `Should be greater than ${
          error.inclusive ? `or equal to ` : ``
        }${error.minimum}`;
      else message = 'Invalid input';
      break;
    case ZodIssueCode.too_big:
      if (error.type === 'array')
        message = `Should have ${error.inclusive ? `at most` : `less than`} ${
          error.maximum
        } items`;
      else if (error.type === 'string')
        message = `Should be ${error.inclusive ? `at most` : `under`} ${
          error.maximum
        } characters long`;
      else if (error.type === 'number')
        message = `Should be less than ${
          error.inclusive ? `or equal to ` : ``
        }${error.maximum}`;
      else message = 'Invalid input';
      break;
    case ZodIssueCode.custom:
      message = `Invalid input.`;
      break;
    default:
      message = `Invalid input.`;
      util.assertNever(error);
  }
  return { message };
  // return `Invalid input.`;
};
