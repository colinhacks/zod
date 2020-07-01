import { ParsedType } from './parser';
import { util } from './helpers/util';

// import { ErrorMap } from "./errorMap";

// type Codes = "not-a-string" | string
export const ZodErrorCode = util.arrayToEnum([
  'invalid_type',
  'nonempty_array_is_empty',
  'custom_error',
  'invalid_union',
  'invalid_array_length',
  // 'not_string',
  // 'not_nan',
  // 'not_number',
  // 'not_boolean',
  // 'not_bigint',
  // 'not_symbol',
  // 'not_function',
  // 'not_undefined',
  // 'not_null',
  // 'not_array',
  // 'not_object',
  'array_empty',
  'invalid_literal_value',
  'invalid_enum_value',
  'unrecognized_keys',
  'invalid_arguments',
  'invalid_return_type',
  'invalid_date',
]);

export type ZodErrorCode = keyof typeof ZodErrorCode;

export type ZodSuberrorBase = {
  // zodPath: (string | number)[];
  path: (string | number)[];
  code: ZodErrorCode;
  message?: string;
  suberrors?: ZodError[];
  // internalMessage: string;
  // code: string;
};

interface InvalidTypeError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_type;
  expected: ParsedType;
  received: ParsedType;
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
}

interface InvalidArrayLengthError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_array_length;
  expected: number;
  received: number;
}

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
}

interface InvalidReturnTypeError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_return_type;
}

interface InvalidDateError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_date;
}

interface CustomError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.custom_error;
  params?: { [k: string]: any };
}

export type ZodSuberrorOptionalMessage =
  | InvalidTypeError
  | NonEmptyArrayIsEmptyError
  | UnrecognizedKeysError
  | InvalidUnionError
  | InvalidArrayLengthError
  | InvalidLiteralValueError
  | InvalidEnumValueError
  | InvalidArgumentsError
  | InvalidReturnTypeError
  | InvalidDateError
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

  //  static fromString = (message: string) => {
  //    return ZodError.create([
  //      {
  //        path: [],
  //        message,
  //      },
  //    ]);
  //  };

  //  mergeChild = (pathElement: string | number, child: Error) => {
  //    if (child instanceof ZodError) {
  //      this.merge(child.bubbleUp(pathElement));
  //    } else {
  //      this.merge(ZodError.fromString(child.message).bubbleUp(pathElement));
  //    }
  //  };

  //  bubbleUp = (pathElement: string | number) => {
  //    return ZodError.create(
  //      this.errors.map(err => {
  //        return { path: [pathElement, ...err.path], message: err.message };
  //      }),
  //    );
  //  };

  //  addError = (path: string | number, message: string) => {
  //    this.errors = [...this.errors, { path: path === '' ? [] : [path], message }];
  //  };

  addError = (sub: ZodSuberror) => {
    this.errors = [...this.errors, sub];
  };

  addErrors = (subs: ZodSuberror[] = []) => {
    this.errors = [...this.errors, ...subs];
  };

  // addSub = (sub: ZodSuberror) => {
  //   this.errors = [...this.errors, { path: path === '' ? [] : [path], message }];
  // };

  merge = (error: ZodError) => {
    this.errors = [...this.errors, ...error.errors];
  };
}
