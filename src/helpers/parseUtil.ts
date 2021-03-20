import {
  defaultErrorMap,
  MakeErrorData,
  ZodError,
  ZodErrorMap,
} from '../ZodError';
import { util } from './util';

export const ZodParsedType = util.arrayToEnum([
  'string',
  'nan',
  'number',
  'integer',
  'float',
  'boolean',
  'date',
  'bigint',
  'symbol',
  'function',
  'undefined',
  'null',
  'array',
  'object',
  'unknown',
  'promise',
  'void',
  'never',
  'map',
  'set',
]);

export type ZodParsedType = keyof typeof ZodParsedType;

export const getParsedType = (data: any): ZodParsedType => {
  if (typeof data === 'string') return ZodParsedType.string;
  if (typeof data === 'number') {
    if (Number.isNaN(data)) return ZodParsedType.nan;
    return ZodParsedType.number;
  }
  if (typeof data === 'boolean') return ZodParsedType.boolean;
  if (typeof data === 'bigint') return ZodParsedType.bigint;
  if (typeof data === 'symbol') return ZodParsedType.symbol;
  if (data instanceof Date) return ZodParsedType.date;
  if (typeof data === 'function') return ZodParsedType.function;
  if (data === undefined) return ZodParsedType.undefined;
  if (typeof data === 'undefined') return ZodParsedType.undefined;
  if (typeof data === 'object') {
    if (Array.isArray(data)) return ZodParsedType.array;
    if (data === null) return ZodParsedType.null;
    if (
      data.then &&
      typeof data.then === 'function' &&
      data.catch &&
      typeof data.catch === 'function'
    ) {
      return ZodParsedType.promise;
    }
    if (data instanceof Map) {
      return ZodParsedType.map;
    }
    if (data instanceof Set) {
      return ZodParsedType.set;
    }
    return ZodParsedType.object;
  }
  return ZodParsedType.unknown;
};

export const issueHelpers = (error: ZodError, params: ParseParams) => {
  const makeIssue = (errorData: MakeErrorData) => {
    const errorArg = {
      ...errorData,
      path: [...params.path, ...(errorData.path || [])],
    };

    const defaultError =
      defaultErrorMap === params.errorMap
        ? { message: `Invalid value` }
        : defaultErrorMap(errorArg, {
            data: params.data,
            defaultError: `Invalid value`,
          });
    const issue = {
      ...errorData,
      path: [...params.path, ...(errorData.path || [])],
      message:
        errorData.message ||
        params.errorMap(errorArg, {
          data: params.data,
          defaultError: defaultError.message,
        }).message,
    };

    return issue;
  };
  const addIssue = (errorData: MakeErrorData) => {
    const issue = makeIssue(errorData);
    error.addIssue(issue);
  };

  return {
    makeIssue,
    addIssue,
  };
};

export type ParseParams = {
  data: any;
  path: (string | number)[];
  errorMap: ZodErrorMap;
  parentError: ZodError;
  async: boolean;
};

export type ParseParamsWithOptionals = util.flatten<
  Partial<ParseParams> & { data: any }
>;

export type ParseParamsNoData = Omit<ParseParams, 'data'>;

export type ParseContext = ParseParams &
  ReturnType<typeof issueHelpers> & {
    parsedType: ZodParsedType;
    currentError: ZodError;
  };

export type ZodParserReturnPayload<T> =
  | {
      success: false;
      error: ZodError;
    }
  | {
      success: true;
      data: T;
    };

export type ZodParserReturnType<T> =
  | ZodParserReturnPayload<T>
  | Promise<ZodParserReturnPayload<T>>;
