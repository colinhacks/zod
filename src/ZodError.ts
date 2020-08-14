import { ZodParsedType } from './parser';
import { util } from './helpers/util';

export const ZodErrorCode = util.arrayToEnum([
  'invalid_type',
  'nonempty_array_is_empty',
  'custom_error',
  'invalid_union',
  'invalid_literal_value',
  'invalid_enum_value',
  'unrecognized_keys',
  'invalid_arguments',
  'invalid_return_type',
  'invalid_date',
  'invalid_string',
  'too_small',
  'too_big',
  'invalid_intersection_types',
]);

const flatten = (err: ZodError): { formErrors: string[]; fieldErrors: { [k: string]: string[] } } => {
  const fieldErrors: any = {};
  const formErrors: string[] = [];
  for (const sub of err.errors) {
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
      fieldErrors[sub.path[0]].push(sub.message);
    } else {
      formErrors.push(sub.message);
    }
  }
  return {
    formErrors,
    fieldErrors,
  };
};

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

interface InvalidStringError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_string;
  validation: 'email' | 'url' | 'uuid';
}

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

interface InvalidIntersectionTypesError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_intersection_types;
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
  | InvalidLiteralValueError
  | InvalidEnumValueError
  | InvalidArgumentsError
  | InvalidReturnTypeError
  | InvalidDateError
  | InvalidStringError
  | TooSmallError
  | TooBigError
  | InvalidIntersectionTypesError
  | CustomError;

export type ZodSuberror = ZodSuberrorOptionalMessage & { message: string };

export const quotelessJson = (obj: any) => {
  const json = JSON.stringify(obj, null, 2); // {"name":"John Smith"}
  return json.replace(/"([^"]+)":/g, '$1:');
};

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
    return error;
  };

  get message() {
    const errorMessage: string[] = [`${this.errors.length} validation issue(s)`, ''];
    for (const err of this.errors) {
      errorMessage.push(`  Issue #${this.errors.indexOf(err)}: ${err.code} at ${err.path.join('.')}`);
      errorMessage.push(`  ` + err.message);
      errorMessage.push('');
    }
    return errorMessage.join('\n');
    // return quotelessJson(this);
    // .map(({ path, message }) => {
    //   return path.length ? `${path.join('.')}: ${message}` : `${message}`;
    // })
    // .join('\n');
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

  get formErrors() {
    return flatten(this);
  }

  flatten = () => flatten(this);
}
