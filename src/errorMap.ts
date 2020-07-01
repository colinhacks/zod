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
  switch (error.code) {
    case ZodErrorCode.invalid_type:
      return `Invalid input: expected ${error.expected}, received ${error.received}`;
    case ZodErrorCode.nonempty_array_is_empty:
      return `List must contain at least one item`;
    case ZodErrorCode.unrecognized_keys:
      return `Unrecognized key(s) in object: ${error.keys.map(k => `'${k}'`).join(', ')}`;
    case ZodErrorCode.invalid_union:
      return `Invalid input`;
    case ZodErrorCode.invalid_array_length:
      return `Expected list of ${error.expected} items, received ${error.received} items`;
    case ZodErrorCode.invalid_literal_value:
      return `Input must be "${error.expected}"`;
    case ZodErrorCode.invalid_enum_value:
      return `Input must be one of these values: ${error.options.join(', ')}`;
    case ZodErrorCode.invalid_arguments:
      return `Invalid function arguments`;
    case ZodErrorCode.invalid_return_type:
      return `Invalid function return type`;
    case ZodErrorCode.invalid_date:
      return `Invalid date`;
    case ZodErrorCode.custom_error:
      return `Invalid input.`;
    default:
      util.assertNever(error);
  }
  return `Invalid input.`;
};
