import { ZodIssueCode, ZodIssueOptionalMessage } from './ZodError.ts';
import { util } from './helpers/util.ts';

type ErrorMapCtx = {
  // path: (string | number)[];
  // details: any;
  defaultError: string;
  data: any;
  // metadata: object;
};

export type ZodErrorMap = typeof defaultErrorMap;
export const defaultErrorMap = (
  error: ZodIssueOptionalMessage,
  _ctx: ErrorMapCtx,
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
    case ZodIssueCode.nonempty_array_is_empty:
      message = `List must contain at least one item`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${error.keys
        .map(k => `'${k}'`)
        .join(', ')}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    // case ZodIssueCode.invalid_tuple_length:
    //   message = `Expected list of ${error.expected} items, received ${error.received} items`;
    //   break;
    case ZodIssueCode.invalid_literal_value:
      message = `Input must be "${error.expected}"`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Input must be one of these values: ${error.options.join(
        ', ',
      )}`;
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
    // case ZodIssueCode.too_small:
    //   const tooShortNoun = _ctx.data === 'string' ? 'characters' : 'items';
    //   message = `Too short, should be at least ${error.minimum} ${tooShortNoun}`;
    //   break;
    // case ZodIssueCode.too_big:
    //   const tooLongNoun = _ctx.data === 'string' ? 'characters' : 'items';
    //   message = `Too short, should be at most ${error.maximum} ${tooLongNoun}`;
    //   break;
    case ZodIssueCode.invalid_string:
      if (error.validation !== 'regex') message = `Invalid ${error.validation}`;
      else message = 'Invalid';
      break;
    // case ZodIssueCode.invalid_url:
    //   message = 'Invalid URL.';
    //   break;
    // case ZodIssueCode.invalid_uuid:
    //   message = 'Invalid UUID.';
    //   break;
    case ZodIssueCode.too_small:
      if (error.type === 'array')
        message = `Should have ${error.inclusive ? `at least` : `more than`} ${
          error.minimum
        } items`;
      else if (error.type === 'string')
        message = `Should be ${error.inclusive ? `at least` : `over`} ${
          error.minimum
        } characters`;
      else if (error.type === 'number')
        message = `Value should be greater than ${
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
        message = `Value should be less than ${
          error.inclusive ? `or equal to ` : ``
        }${error.maximum}`;
      else message = 'Invalid input';
      break;
    case ZodIssueCode.custom:
      message = `Invalid input.`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersections only support objects`;
      break;
    default:
      message = `Invalid input.`;
      util.assertNever(error);
  }
  return { message };
  // return `Invalid input.`;
};
