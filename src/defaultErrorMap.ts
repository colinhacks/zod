import { ZodErrorCode, ZodSuberrorOptionalMessage } from './ZodError';
import { util } from './helpers/util';

type ErrorMapCtx = {
  // path: (string | number)[];
  // details: any;
  defaultError: string;
  data: any;
  // metadata: object;
};

export type ZodErrorMap = typeof defaultErrorMap;
export const defaultErrorMap = (error: ZodSuberrorOptionalMessage, _ctx: ErrorMapCtx): { message: string } => {
  let message: string;
  switch (error.code) {
    case ZodErrorCode.invalid_type:
      if (error.received === 'undefined') {
        message = 'Required';
      } else {
        message = `Expected ${error.expected}, received ${error.received}`;
      }
      break;
    case ZodErrorCode.nonempty_array_is_empty:
      message = `List must contain at least one item`;
      break;
    case ZodErrorCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${error.keys.map(k => `'${k}'`).join(', ')}`;
      break;
    case ZodErrorCode.invalid_union:
      message = `Invalid input`;
      break;
    // case ZodErrorCode.invalid_tuple_length:
    //   message = `Expected list of ${error.expected} items, received ${error.received} items`;
    //   break;
    case ZodErrorCode.invalid_literal_value:
      message = `Input must be "${error.expected}"`;
      break;
    case ZodErrorCode.invalid_enum_value:
      message = `Input must be one of these values: ${error.options.join(', ')}`;
      break;
    case ZodErrorCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodErrorCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodErrorCode.invalid_date:
      message = `Invalid date`;
      break;
    // case ZodErrorCode.too_small:
    //   const tooShortNoun = _ctx.data === 'string' ? 'characters' : 'items';
    //   message = `Too short, should be at least ${error.minimum} ${tooShortNoun}`;
    //   break;
    // case ZodErrorCode.too_big:
    //   const tooLongNoun = _ctx.data === 'string' ? 'characters' : 'items';
    //   message = `Too short, should be at most ${error.maximum} ${tooLongNoun}`;
    //   break;
    case ZodErrorCode.invalid_string:
      message = `Invalid ${error.validation}`;
      break;
    // case ZodErrorCode.invalid_url:
    //   message = 'Invalid URL.';
    //   break;
    // case ZodErrorCode.invalid_uuid:
    //   message = 'Invalid UUID.';
    //   break;
    case ZodErrorCode.too_small:
      if (error.type === 'array')
        message = `Should have ${error.inclusive ? `at least` : `more than`} ${error.minimum} items`;
      else if (error.type === 'string')
        message = `Should be ${error.inclusive ? `at least` : `over`} ${error.minimum} characters`;
      else if (error.type === 'number')
        message = `Value should be greater than ${error.inclusive ? `or equal to ` : ``}${error.minimum}`;
      else message = 'Invalid input';
      break;
    case ZodErrorCode.too_big:
      if (error.type === 'array')
        message = `Should have ${error.inclusive ? `at most` : `less than`} ${error.maximum} items`;
      else if (error.type === 'string')
        message = `Should be ${error.inclusive ? `at most` : `under`} ${error.maximum} characters long`;
      else if (error.type === 'number')
        message = `Value should be less than ${error.inclusive ? `or equal to ` : ``}${error.maximum}`;
      else message = 'Invalid input';
      break;
    case ZodErrorCode.custom_error:
      message = `Invalid input.`;
      break;
    case ZodErrorCode.invalid_intersection_types:
      message = `Intersections only support `;
      break;
    default:
      message = `Invalid input.`;
      util.assertNever(error);
  }
  return { message };
  // return `Invalid input.`;
};
