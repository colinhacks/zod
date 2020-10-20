import { ZodParsedType } from './parser';
import { util } from './helpers/util';

export const ZodIssueCode = util.arrayToEnum([
  'invalid_type',
  'nonempty_array_is_empty',
  'custom',
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

export type ZodIssueCode = keyof typeof ZodIssueCode;

export type ZodIssueBase = {
  path: (string | number)[];
  // code: ZodIssueCode;
  message?: string;
};

export interface ZodInvalidTypeIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_type;
  expected: ZodParsedType;
  received: ZodParsedType;
}

export interface ZodNonEmptyArrayIsEmptyIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.nonempty_array_is_empty;
}

export interface ZodUnrecognizedKeysIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.unrecognized_keys;
  keys: string[];
}

export interface ZodInvalidUnionIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_union;
  unionErrors: ZodError[];
}

export interface ZodInvalidLiteralValueIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_literal_value;
  expected: string | number | boolean;
}

export interface ZodInvalidEnumValueIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_enum_value;
  options: (string | number)[];
}

export interface ZodInvalidArgumentsIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_arguments;
  argumentsError: ZodError;
}

export interface ZodInvalidReturnTypeIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_return_type;
  returnTypeError: ZodError;
}

export interface ZodInvalidDateIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_date;
}

export type StringValidation = 'email' | 'url' | 'uuid' | 'regex';

export interface ZodInvalidStringIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_string;
  validation: StringValidation;
}

export interface ZodTooSmallIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.too_small;
  minimum: number;
  inclusive: boolean;
  type: 'array' | 'string' | 'number';
}

export interface ZodTooBigIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.too_big;
  maximum: number;
  inclusive: boolean;
  type: 'array' | 'string' | 'number';
}

export interface ZodInvalidIntersectionTypesIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_intersection_types;
}

export interface ZodCustomIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.custom;
  params?: { [k: string]: any };
}

export type ZodIssueOptionalMessage =
  | ZodInvalidTypeIssue
  | ZodNonEmptyArrayIsEmptyIssue
  | ZodUnrecognizedKeysIssue
  | ZodInvalidUnionIssue
  | ZodInvalidLiteralValueIssue
  | ZodInvalidEnumValueIssue
  | ZodInvalidArgumentsIssue
  | ZodInvalidReturnTypeIssue
  | ZodInvalidDateIssue
  | ZodInvalidStringIssue
  | ZodTooSmallIssue
  | ZodTooBigIssue
  | ZodInvalidIntersectionTypesIssue
  | ZodCustomIssue;

export type ZodIssue = ZodIssueOptionalMessage & { message: string };

export const quotelessJson = (obj: any) => {
  const json = JSON.stringify(obj, null, 2); // {"name":"John Smith"}
  return json.replace(/"([^"]+)":/g, '$1:');
};

export class ZodError extends Error {
  issues: ZodIssue[] = [];

  get errors() {
    return this.issues;
  }

  constructor(issues: ZodIssue[]) {
    super();
    // restore prototype chain
    const actualProto = new.target.prototype;
    Object.setPrototypeOf(this, actualProto);
    this.issues = issues;
  }

  static create = (issues: ZodIssue[]) => {
    const error = new ZodError(issues);
    return error;
  };

  get message() {
    return JSON.stringify(this.issues, null, 2);
    // const errorMessage: string[] = [
    //   `${this.issues.length} validation issue(s)`,
    //   '',
    // ];
    // for (const err of this.issues) {
    //   errorMessage.push(
    //     `  Issue #${this.issues.indexOf(err)}: ${err.code} at ${err.path.join(
    //       '.',
    //     )}`,
    //   );
    //   errorMessage.push(`  ` + err.message);
    //   errorMessage.push('');
    // }
    // return errorMessage.join('\n');
    // return quotelessJson(this);
    // .map(({ path, message }) => {
    //   return path.length ? `${path.join('./index')}: ${message}` : `${message}`;
    // })
    // .join('\n');
  }

  get isEmpty(): boolean {
    return this.issues.length === 0;
  }

  addIssue = (sub: ZodIssue) => {
    this.issues = [...this.issues, sub];
  };

  addIssues = (subs: ZodIssue[] = []) => {
    this.issues = [...this.issues, ...subs];
  };

  flatten = (): {
    formErrors: string[];
    fieldErrors: { [k: string]: string[] };
  } => {
    const fieldErrors: any = {};
    const formErrors: string[] = [];
    for (const sub of this.issues) {
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
