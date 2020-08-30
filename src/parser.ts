import * as z from './types/base';
import { ZodDef } from './index';
import { ZodError, ZodErrorCode, ZodSuberror, ZodSuberrorOptionalMessage } from './ZodError';
import { util } from './helpers/util';
import { ZodErrorMap, defaultErrorMap } from './defaultErrorMap';

export type ParseParams = {
  seen?: { schema: any; objects: { data: any; error?: any; times: number }[] }[];
  path?: (string | number)[];
  errorMap?: ZodErrorMap;
};

export const getParsedType = (data: any): ZodParsedType => {
  if (typeof data === 'string') return 'string';
  if (typeof data === 'number') {
    if (Number.isNaN(data)) return 'nan';
    return 'number';
  }
  if (typeof data === 'boolean') return 'boolean';
  if (typeof data === 'bigint') return 'bigint';
  if (typeof data === 'symbol') return 'symbol';
  if (data instanceof Date) return 'date';
  if (typeof data === 'function') return 'function';
  if (data === undefined) return 'undefined';
  if (typeof data === 'undefined') return 'undefined';
  if (typeof data === 'object') {
    if (Array.isArray(data)) return 'array';
    if (!data) return 'null';
    if (data.then && typeof data.then === 'function' && data.catch && typeof data.catch === 'function') {
      return 'promise';
    }
    return 'object';
  }
  return 'unknown';
};

export const ZodParsedType = util.arrayToEnum([
  'string',
  'nan',
  'number',
  'integer',
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
]);

export type ZodParsedType = keyof typeof ZodParsedType;

// conditional required to distribute union
type stripPath<T extends object> = T extends any ? util.OmitKeys<T, 'path'> : never;
export type MakeErrorData = stripPath<ZodSuberrorOptionalMessage> & { path?: (string | number)[] };

export const ZodParser = (schemaDef: z.ZodTypeDef) => (
  obj: any,
  baseParams: ParseParams = { seen: [], errorMap: defaultErrorMap, path: [] },
) => {
  const params: Required<ParseParams> = {
    seen: baseParams.seen || [],
    path: baseParams.path || [],
    errorMap: baseParams.errorMap || defaultErrorMap,
  };

  const makeError = (errorData: MakeErrorData): ZodSuberror => {
    const errorArg = { ...errorData, path: params.path };
    const ctxArg = { data: obj };

    const defaultError =
      defaultErrorMap === params.errorMap
        ? { message: `Invalid value.` }
        : defaultErrorMap(errorArg, { ...ctxArg, defaultError: `Invalid value.` });
    return {
      ...errorData,
      path: [...params.path, ...(errorData.path || [])],
      message:
        errorData.message || params.errorMap(errorArg, { ...ctxArg, defaultError: defaultError.message }).message,
    };
  };

  const def: ZodDef = schemaDef as any;

  const parsedType = getParsedType(obj);

  const schemaSeen = params.seen.find(x => x.schema === schemaDef);
  const isPrimitive = typeof obj !== 'object' || obj === null;

  if (schemaSeen) {
    const found = schemaSeen.objects.find(x => x.data === obj);

    if (found) {
      if (found.error) {
        throw found.error;
      }

      found.times = found.times + 1;

      if (found.times > 2 && !isPrimitive) {
        return Symbol('recursion depth exceeded.');
      } else if (found.times > 2) {
      }
    } else {
      //
      schemaSeen.objects.push(obj);
    }
  } else {
    params.seen.push({ schema: schemaDef, objects: [{ data: obj, error: undefined, times: 1 }] });
  }

  // const setError = (error: Error) => {
  //   const schemaSeen = params.seen.find(x => x.schema === schemaDef);
  //   if (schemaSeen) {
  //     const found = schemaSeen.objects.find(x => x.data === obj);
  //     if (found) {
  //       //
  //       found.error = error;
  //     }
  //   }
  // };

  const error = new ZodError([]);
  let returnValue: any = obj;

  switch (def.t) {
    case z.ZodTypes.string:
      if (parsedType !== ZodParsedType.string) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.string, received: parsedType }),
        );
        // setError(error);
        throw error;
      }
      break;
    case z.ZodTypes.number:
      if (parsedType !== ZodParsedType.number) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.number, received: parsedType }),
        );
        // setError(error);
        throw error;
      }
      if (Number.isNaN(obj)) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.number, received: ZodParsedType.nan }),
        );
        // setError(error);
        throw error;
      }
      break;
    case z.ZodTypes.bigint:
      if (parsedType !== ZodParsedType.bigint) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.number, received: parsedType }),
        );
        // setError(error);
        throw error;
      }
      break;
    case z.ZodTypes.boolean:
      if (parsedType !== ZodParsedType.boolean) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.boolean, received: parsedType }),
        );
        // setError(error);
        throw error;
      }
      break;
    case z.ZodTypes.undefined:
      if (parsedType !== ZodParsedType.undefined) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.undefined, received: parsedType }),
        );
        // setError(error);
        throw error;
      }
      break;
    case z.ZodTypes.null:
      if (parsedType !== ZodParsedType.null) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.null, received: parsedType }),
        );
        // setError(error);
        throw error;
      }
      break;
    case z.ZodTypes.any:
      break;
    case z.ZodTypes.unknown:
      break;
    case z.ZodTypes.void:
      if (parsedType !== ZodParsedType.undefined && parsedType !== ZodParsedType.null) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.void, received: parsedType }),
        );
        // setError(error);
        throw error;
      }
      break;
    case z.ZodTypes.array:
      if (parsedType !== ZodParsedType.array) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.array, received: parsedType }),
        );
        // setError(error);
        throw error;
      }
      const data: any[] = obj;
      if (def.nonempty === true && obj.length === 0) {
        error.addError(makeError({ code: ZodErrorCode.nonempty_array_is_empty }));
        // setError(error);
        throw error;
      }
      data.map((item, i) => {
        try {
          const parsedItem = def.type.parse(item, { ...params, path: [...params.path, i] });
          return parsedItem;
        } catch (err) {
          const zerr: ZodError = err;
          error.addErrors(zerr.errors);
        }
      });
      if (!error.isEmpty) {
        // setError(error);
        throw error;
      }
      break;
    case z.ZodTypes.object:
      if (parsedType !== ZodParsedType.object) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.object, received: parsedType }),
        );
        // setError(error);
        throw error;
      }

      const shape = def.shape();
      if (def.params.strict) {
        const shapeKeys = Object.keys(shape);
        const objKeys = Object.keys(obj);
        const extraKeys = objKeys.filter(k => shapeKeys.indexOf(k) === -1);

        if (extraKeys.length) {
          error.addError(makeError({ code: ZodErrorCode.unrecognized_keys, keys: extraKeys }));
        }
      }

      for (const key in shape) {
        try {
          def.shape()[key].parse(obj[key], { ...params, path: [...params.path, key] });
        } catch (err) {
          const zerr: ZodError = err;
          error.addErrors(zerr.errors);
        }
      }

      break;
    case z.ZodTypes.union:
      let isValid = false;
      const unionErrors: ZodError[] = [];
      for (const option of def.options) {
        try {
          option.parse(obj, params);
          isValid = true;
        } catch (err) {
          unionErrors.push(err);
        }
      }

      if (!isValid) {
        const filteredErrors = unionErrors.filter(err => {
          return err.errors[0].code !== 'invalid_type';
        });
        if (filteredErrors.length === 1) {
          error.addErrors(filteredErrors[0].errors);
        } else {
          error.addError(
            makeError({
              code: ZodErrorCode.invalid_union,
              unionErrors: unionErrors,
            }),
          );
        }
      }
      break;
    case z.ZodTypes.intersection:
      try {
        def.left.parse(obj, params);
      } catch (err) {
        error.addErrors(err.errors);
      }

      try {
        def.right.parse(obj, params);
      } catch (err) {
        error.addErrors(err.errors);
      }

      break;

    case z.ZodTypes.tuple:
      if (parsedType !== ZodParsedType.array) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.array, received: parsedType }),
        );
        // setError(error);
        throw error;
      }
      if (obj.length > def.items.length) {
        error.addError(
          makeError({ code: ZodErrorCode.too_big, maximum: def.items.length, inclusive: true, type: 'array' }),
        );
      } else if (obj.length < def.items.length) {
        error.addError(
          makeError({ code: ZodErrorCode.too_small, minimum: def.items.length, inclusive: true, type: 'array' }),
        );
      }

      const parsedTuple: any[] = [];
      const tupleData: any[] = obj;
      for (const index in tupleData) {
        const item = tupleData[index];
        const itemParser = def.items[index];
        try {
          parsedTuple.push(itemParser.parse(item, { ...params, path: [...params.path, index] }));
        } catch (err) {
          error.addErrors(err.errors);
        }
      }
      break;
    case z.ZodTypes.lazy:
      const lazySchema = def.getter();
      lazySchema.parse(obj, params);
      break;
    case z.ZodTypes.literal:
      if (obj !== def.value) {
        error.addError(makeError({ code: ZodErrorCode.invalid_literal_value, expected: def.value }));
      }
      break;

    case z.ZodTypes.enum:
      if (def.values.indexOf(obj) === -1) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_enum_value,
            options: def.values,
          }),
        );
      }
      break;
    case z.ZodTypes.nativeEnum:
      if (util.getValidEnumValues(def.values).indexOf(obj) === -1) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_enum_value,
            options: Object.values(def.values),
          }),
        );
      }
      break;
    case z.ZodTypes.function:
      if (parsedType !== ZodParsedType.function) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.function,
            received: parsedType,
          }),
        );
        // setError(error);
        throw error;
      }
      const validatedFunc = (...args: any[]) => {
        try {
          def.args.parse(args as any);
        } catch (err) {
          if (err instanceof ZodError) {
            const argsError = new ZodError([]);
            argsError.addError(
              makeError({
                code: ZodErrorCode.invalid_arguments,
                argumentsError: err,
              }),
            );
            throw argsError;
          }
          throw err;
        }

        const result = obj(...(args as any));

        try {
          return def.returns.parse(result);
        } catch (err) {
          if (err instanceof ZodError) {
            const returnsError = new ZodError([]);
            returnsError.addError(
              makeError({
                code: ZodErrorCode.invalid_return_type,
                returnTypeError: err,
              }),
            );
            throw returnsError;
          }
          throw err;
        }
      };
      return validatedFunc;
    case z.ZodTypes.record:
      if (parsedType !== ZodParsedType.object) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.object,
            received: parsedType,
          }),
        );
        // setError(error);
        throw error;
      }

      for (const key in obj) {
        try {
          def.valueType.parse(obj[key], { ...params, path: [...params.path, key] });
        } catch (err) {
          error.addErrors(err.errors);
        }
      }
      break;
    case z.ZodTypes.date:
      if (!(obj instanceof Date)) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.date,
            received: parsedType,
          }),
        );
        // setError(error);
        throw error;
      }
      if (isNaN(obj.getTime())) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_date,
          }),
        );
        // setError(error);
        throw error;
      }
      break;

    case z.ZodTypes.promise:
      if (parsedType !== ZodParsedType.promise) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.promise,
            received: parsedType,
          }),
        );
        // setError(error);
        throw error;
      }
      return new Promise(async (res, rej) => {
        const objValue = await obj;
        try {
          const parsed = def.type.parse(objValue, params);
          res(parsed);
        } catch (err) {
          rej(err);
        }
      });

    default:
      util.assertNever(def);
  }

  const customChecks = def.checks || [];
  for (const check of customChecks) {
    if (!check.check(returnValue)) {
      const { check: checkMethod, ...noMethodCheck } = check;
      error.addError(makeError(noMethodCheck));
    }
  }

  if (!error.isEmpty) {
    // setError(error);
    throw error;
  }

  return returnValue as any;
};
