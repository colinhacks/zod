import { ZodErrorCode, ZodSuberrorOptionalMessage } from './ZodError';
import { util } from './helpers/util';

type ErrorMapCtx = {
  // path: (string | number)[];
  // details: any;
  defaultError: string;
  data: any;
  metadata: object;
};

export type ErrorMap = typeof defaultErrorMap;
export const defaultErrorMap = (error: ZodSuberrorOptionalMessage, _ctx: ErrorMapCtx): string => {
  let message: string;
  switch (error.code) {
    case ZodErrorCode.invalid_type:
      message = `Invalid input: expected ${error.expected}, received ${error.received}`;
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
    case ZodErrorCode.invalid_array_length:
      message = `Expected list of ${error.expected} items, received ${error.received} items`;
      break;
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
    case ZodErrorCode.custom_error:
      message = `Invalid input.`;
      break;
    default:
      message = `Invalid input.`;
      util.assertNever(error);
  }
  return message;
  // return `Invalid input.`;
};
