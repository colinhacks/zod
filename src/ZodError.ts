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
]);

export type ZodErrorCode = keyof typeof ZodErrorCode;

export type ZodSuberrorBase = {
  path: (string | number)[];
  // code: ZodErrorCode;
  message?: string;
};

export interface ZodInvalidTypeError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_type;
  expected: ZodParsedType;
  received: ZodParsedType;
}

export interface ZodNonEmptyArrayIsEmptyError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.nonempty_array_is_empty;
}

export interface ZodUnrecognizedKeysError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.unrecognized_keys;
  keys: string[];
}

export interface ZodInvalidUnionError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_union;
  unionErrors: ZodError[];
}

export interface ZodInvalidLiteralValueError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_literal_value;
  expected: string | number | boolean;
}

export interface ZodInvalidEnumValueError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_enum_value;
  options: (string | number)[];
}

export interface ZodInvalidArgumentsError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_arguments;
  argumentsError: ZodError;
}

export interface ZodInvalidReturnTypeError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_return_type;
  returnTypeError: ZodError;
}

export interface ZodInvalidDateError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_date;
}

export type StringValidation = 'email' | 'url' | 'uuid' | 'regex';

export interface ZodInvalidStringError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.invalid_string;
  validation: StringValidation;
}

export interface ZodTooSmallError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.too_small;
  minimum: number;
  inclusive: boolean;
  type: 'array' | 'string' | 'number';
}

export interface ZodTooBigError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.too_big;
  maximum: number;
  inclusive: boolean;
  type: 'array' | 'string' | 'number';
}

export interface ZodCustomError extends ZodSuberrorBase {
  code: typeof ZodErrorCode.custom_error;
  params?: { [k: string]: any };
}

export type ZodSuberrorOptionalMessage =
  | ZodInvalidTypeError
  | ZodNonEmptyArrayIsEmptyError
  | ZodUnrecognizedKeysError
  | ZodInvalidUnionError
  | ZodInvalidLiteralValueError
  | ZodInvalidEnumValueError
  | ZodInvalidArgumentsError
  | ZodInvalidReturnTypeError
  | ZodInvalidDateError
  | ZodInvalidStringError
  | ZodTooSmallError
  | ZodTooBigError
  | ZodCustomError;

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
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      (this as any).__proto__ = actualProto;
    }
    this.errors = errors;
  }

  static create = (errors: ZodSuberror[]) => {
    const error = new ZodError(errors);
    return error;
  };

  get message() {
    // return JSON.stringify(this.errors, null, 2);
    const errorMessage: string[] = [
      `${this.errors.length} validation issue(s)`,
      '',
    ];
    for (const err of this.errors) {
      errorMessage.push(
        `  Issue #${this.errors.indexOf(err)}: ${err.code} at ${err.path.join(
          '.',
        )}`,
      );
      errorMessage.push(`  ` + err.message);
      errorMessage.push('');
    }
    return errorMessage.join('\n');
    // return quotelessJson(this);
    // .map(({ path, message }) => {
    //   return path.length ? `${path.join('./index')}: ${message}` : `${message}`;
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

  flatten = (): {
    formErrors: string[];
    fieldErrors: { [k: string]: string[] };
  } => {
    const fieldErrors: any = {};
    const formErrors: string[] = [];
    for (const sub of this.errors) {
      if (sub.path.length > 0) {
        fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
        fieldErrors[sub.path[0]].push(sub.message);
      } else {
        formErrors.push(sub.message);
      }
    }
    return { formErrors, fieldErrors };
  };

  get formErrors() {
    return this.flatten();
  }
}
