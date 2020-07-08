import { ZodParsedType } from './parser';
import { util } from './helpers/util';

export const ZodErrorCode = util.arrayToEnum([
  'invalid_type',
  'nonempty_array_is_empty',
  'custom_error',
  'invalid_union',
  // 'invalid_tuple_length',
  'invalid_literal_value',
  'invalid_enum_value',
  'unrecognized_keys',
  'invalid_arguments',
  'invalid_return_type',
  'invalid_date',
  //  'too_short',
  //  'too_long',
  'invalid_string',
  // 'invalid_url',
  // 'invalid_uuid',
  'too_small',
  'too_big',
]);

export type ZodErrorCode = keyof typeof ZodErrorCode;

export type ZodSuberrorBase = {
  path: (string | number)[];
  code: ZodErrorCode;
  message?: string;
};

interface InvalidTypeError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_type;
  expected: ZodParsedType;
  received: ZodParsedType;
}

interface NonEmptyArrayIsEmptyError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.nonempty_array_is_empty;
}

interface UnrecognizedKeysError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.unrecognized_keys;
  keys: string[];
}

interface InvalidUnionError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_union;
  unionErrors: ZodError[];
}

// interface InvalidArrayLengthError extends ZodSuberrorBase {
//   code: typeof ZodErrorCode.invalid_tuple_length;
//   expected: number;
//   received: number;
// }

interface InvalidLiteralValueError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_literal_value;
  expected: string | number | boolean;
}

interface InvalidEnumValueError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_enum_value;
  options: string[];
}

interface InvalidArgumentsError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_arguments;
  argumentsError: ZodError;
}

interface InvalidReturnTypeError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_return_type;
  returnTypeError: ZodError;
}

interface InvalidDateError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_date;
}

// interface TooShortError extends ZodSuberrorBase {
//   code: typeof ZodErrorCode.too_small;
//   minimum: number;
// }

// interface TooLongError extends ZodSuberrorBase {
//   code: typeof ZodErrorCode.too_big;
//   maximum: number;
// }

interface InvalidStringError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_string;
  validation: 'email' | 'url' | 'uuid';
}

// interface InvalidUrlError extends ZodSuberrorBase {
//   code: typeof ZodErrorCode.invalid_url;
//   validation: | 'url';
// }

// interface InvalidUuidError extends ZodSuberrorBase {
//   code: typeof ZodErrorCode.invalid_uuid;
//   validation: | 'uuid';
// }

interface TooSmallError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.too_small;
  minimum: number;
  inclusive: boolean;
  type: 'array' | 'string' | 'number';
}

interface TooBigError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.too_big;
  maximum: number;
  inclusive: boolean;
  type: 'array' | 'string' | 'number';
}

export interface CustomError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.custom_error;
  params?: { [k: string]: any };
}

export type ZodSuberrorOptionalMessage =
  | InvalidTypeError
  | NonEmptyArrayIsEmptyError
  | UnrecognizedKeysError
  | InvalidUnionError
  // | InvalidArrayLengthError
  | InvalidLiteralValueError
  | InvalidEnumValueError
  | InvalidArgumentsError
  | InvalidReturnTypeError
  | InvalidDateError
  // | TooShortError
  // | TooLongError
  | InvalidStringError // | InvalidEmailError
  // | InvalidUrlError
  // | InvalidUuidError
  | TooSmallError
  | TooBigError
  | CustomError;

export type ZodSuberror = ZodSuberrorOptionalMessage & { message: string };

export class ZodError extends Error {
  errors: ZodSuberror[] = [];

  constructor(errors: ZodSuberror[]) {
    super();
    // restore prototype chain
    const actualProto = new.target.prototype;
    Object.setPrototypeOf(this, actualProto);
    this.errors = errors;
  }

  static create = (errors: ZodSuberror[]) => {
    const error = new ZodError(errors);
    // error.errors = errors;
    return error;
  };

  get message() {
    return this.errors
      .map(({ path, message }) => {
        return path.length ? `${path.join('.')}: ${message}` : `${message}`;
      })
      .join('\n');
  }

  get isEmpty(): boolean {
    return this.errors.length === 0;
  }

  addError = (sub: ZodSuberror) => {
    this.errors = [...this.errors, sub];
  };

  addErrors = (subs: ZodSuberror[] = []) => {
    this.errors = [...this.errors, ...subs];
  };

  // toFormError =
}
