import * as z from './types/base';
import { ZodDef } from '.';
import { ZodError, ZodErrorCode, ZodSuberror, ZodSuberrorOptionalMessage } from './ZodError';
import { util } from './helpers/util';
import { ZodErrorMap, defaultErrorMap } from './defaultErrorMap';

export type ParseParams = {
  seen?: { schema: any; objects: any[] }[];
  path?: (string | number)[];
  errorMap?: ZodErrorMap;
  async?: boolean;
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
  if (data === null) return 'null';
  if (typeof data === 'undefined') return 'undefined';
  if (typeof data === 'object') {
    if (Array.isArray(data)) return 'array';
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
  data: any,
  baseParams: ParseParams = { seen: [], errorMap: defaultErrorMap, path: [] },
) => {
  const params: Required<ParseParams> = {
    seen: baseParams.seen || [],
    path: baseParams.path || [],
    errorMap: baseParams.errorMap || defaultErrorMap,
    async: baseParams.async || false,
  };

  const makeError = (errorData: MakeErrorData): ZodSuberror => {
    const errorArg = { ...errorData, path: params.path };
    const ctxArg = { data: data };

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

  const schemaSeen = params.seen.find(x => x.schema === schemaDef);
  if (schemaSeen) {
    if (schemaSeen.objects.indexOf(data) !== -1) {
      return data;
    } else {
      schemaSeen.objects.push(data);
    }
  } else {
    params.seen.push({ schema: schemaDef, objects: [data] });
  }
  // }

  const error = new ZodError([]);
  let returnValue: any = data;
  const parsedType = getParsedType(data);

  switch (def.t) {
    case z.ZodTypes.string:
      if (parsedType !== ZodParsedType.string) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.string, received: parsedType }),
        );
        throw error;
      }
      break;
    case z.ZodTypes.number:
      if (parsedType !== ZodParsedType.number) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.number, received: parsedType }),
        );
        throw error;
      }
      if (Number.isNaN(data)) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.number, received: ZodParsedType.nan }),
        );
        throw error;
      }
      break;
    case z.ZodTypes.bigint:
      if (parsedType !== ZodParsedType.bigint) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.number, received: parsedType }),
        );
        throw error;
      }
      break;
    case z.ZodTypes.boolean:
      if (parsedType !== ZodParsedType.boolean) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.boolean, received: parsedType }),
        );
        throw error;
      }
      break;
    case z.ZodTypes.undefined:
      if (parsedType !== ZodParsedType.undefined) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.undefined, received: parsedType }),
        );
        throw error;
      }
      break;
    case z.ZodTypes.null:
      if (parsedType !== ZodParsedType.null) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.null, received: parsedType }),
        );
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
        throw error;
      }
      break;
    case z.ZodTypes.array:
      if (parsedType !== ZodParsedType.array) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.array, received: parsedType }),
        );
        throw error;
      }
      // const data: any[] = data;
      if (def.nonempty === true && data.length === 0) {
        error.addError(makeError({ code: ZodErrorCode.nonempty_array_is_empty }));
        throw error;
      }
      returnValue = (data as any[]).map((item, i) => {
        try {
          return def.type.parse(item, { ...params, path: [...params.path, i] });
        } catch (err) {
          const zerr: ZodError = err;
          error.addErrors(zerr.errors);
        }
      });
      // if (!error.isEmpty) {
      //   throw error;
      // }
      break;
    case z.ZodTypes.object:
      if (parsedType !== ZodParsedType.object) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.object, received: parsedType }),
        );
        throw error;
      }

      const parsedobject: any = {};

      const shape = def.shape();
      const shapeKeys = Object.keys(shape);
      const dataKeys = Object.keys(data);
      const extraKeys = dataKeys.filter(k => shapeKeys.indexOf(k) === -1);

      if (extraKeys.length) {
        if (def.params.strict) {
          error.addError(makeError({ code: ZodErrorCode.unrecognized_keys, keys: extraKeys }));
        } else {
          for (const key of extraKeys) {
            parsedobject[key] = data[key];
          }
        }
      }

      for (const key in shape) {
        try {
          parsedobject[key] = def.shape()[key].parse(data[key], { ...params, path: [...params.path, key] });
        } catch (err) {
          const zerr: ZodError = err;
          error.addErrors(zerr.errors);
        }
      }
      returnValue = parsedobject;

      break;
    case z.ZodTypes.union:
      let parsedUnion: any;
      let isValid = false;
      const unionErrors: ZodError[] = [];
      for (const option of def.options) {
        try {
          parsedUnion = option.parse(data, params);
          isValid = true;
          break;
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
      returnValue = parsedUnion;
      break;
    case z.ZodTypes.intersection:
      // let parsedIntersection:any;
      let parsedLeft: any;
      let parsedRight: any;
      try {
        parsedLeft = def.left.parse(data, params);
      } catch (err) {
        error.addErrors(err.errors);
      }

      try {
        parsedRight = def.right.parse(data, params);
      } catch (err) {
        error.addErrors(err.errors);
      }

      const parsedLeftType = getParsedType(parsedLeft);
      const parsedRightType = getParsedType(parsedRight);

      if (parsedLeft === parsedRight) {
        returnValue = parsedLeft;
      } else if (parsedLeftType === ZodParsedType.object && parsedRightType === ZodParsedType.object) {
        returnValue = { ...parsedLeft, ...parsedRight };
      } else {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_intersection_types,
          }),
        );
      }
      break;

    case z.ZodTypes.tuple:
      if (parsedType !== ZodParsedType.array) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.array, received: parsedType }),
        );
        throw error;
      }
      if (data.length > def.items.length) {
        error.addError(
          makeError({ code: ZodErrorCode.too_big, maximum: def.items.length, inclusive: true, type: 'array' }),
        );
      } else if (data.length < def.items.length) {
        error.addError(
          makeError({ code: ZodErrorCode.too_small, minimum: def.items.length, inclusive: true, type: 'array' }),
        );
      }

      // const parsedTuple: any[] = [];
      const tupleData: any[] = data;
      const parsedTuple: any = [];
      for (const index in tupleData) {
        const item = tupleData[index];
        const itemParser = def.items[index];
        try {
          parsedTuple.push(itemParser.parse(item, { ...params, path: [...params.path, index] }));
        } catch (err) {
          error.addErrors(err.errors);
        }
      }
      returnValue = parsedTuple;
      break;
    case z.ZodTypes.lazy:
      const lazySchema = def.getter();
      returnValue = lazySchema.parse(data, params);
      break;
    case z.ZodTypes.literal:
      if (data !== def.value) {
        error.addError(makeError({ code: ZodErrorCode.invalid_literal_value, expected: def.value }));
      }
      returnValue = data;
      break;
    case z.ZodTypes.enum:
      if (def.values.indexOf(data) === -1) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_enum_value,
            options: def.values,
          }),
        );
      }
      returnValue = data;
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

        const result = data(...(args as any));

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
      returnValue = validatedFunc;
      // return validatedFunc;
      break;
    case z.ZodTypes.record:
      if (parsedType !== ZodParsedType.object) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.object,
            received: parsedType,
          }),
        );
        throw error;
      }
      const parsedRecord: any = {};
      for (const key in data) {
        try {
          parsedRecord[key] = def.valueType.parse(data[key], { ...params, path: [...params.path, key] });
        } catch (err) {
          error.addErrors(err.errors);
        }
      }
      returnValue = parsedRecord;
      break;
    case z.ZodTypes.date:
      if (!(data instanceof Date)) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.date,
            received: parsedType,
          }),
        );
        throw error;
      }
      if (isNaN(data.getTime())) {
        console.log('NAN');
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_date,
          }),
        );
        throw error;
      }
      returnValue = data;
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
        throw error;
      }
      returnValue = new Promise(async (res, rej) => {
        const dataValue = await data;
        try {
          const parsed = def.type.parse(dataValue, params);
          res(parsed);
        } catch (err) {
          rej(err);
        }
      });
      break;
    case z.ZodTypes.transformer:
      // console.log(`input: "${data}"`);

      const inputParseResult = def.input.parse(data);
      // console.log(`inputParseResult: "${inputParseResult}"`);
      const transformedResult = def.transformer(inputParseResult);
      // console.log(`transformedResult: "${transformedResult}"`);
      returnValue = def.output.parse(transformedResult);
      break;
    default:
      util.assertNever(def);
  }

  const customChecks = def.checks || [];
  console.log(`async: ${params.async}`);
  if (params.async === true) {
    const asyncChecks = customChecks.map(check => {
      return new Promise(async res => {
        const checkResult = await check.check(returnValue);
        if (!checkResult) {
          const { check: checkMethod, ...noMethodCheck } = check;
          error.addError(makeError(noMethodCheck));
        }
        res();
      });
    });
    return new Promise((res, rej) => {
      return Promise.all(asyncChecks).then(() => {
        if (!error.isEmpty) {
          return rej(error);
        }

        return res(returnValue);
      });
    });
  } else {
    for (const check of customChecks) {
      const checkResult = check.check(returnValue);
      if (getParsedType(checkResult) === ZodParsedType.promise) {
        throw new Error("You can't use .parse on a schema containing async refinements. Use .parseAsync instead.");
      }
      if (!checkResult) {
        const { check: checkMethod, ...noMethodCheck } = check;
        error.addError(makeError(noMethodCheck));
      }
    }
    if (!error.isEmpty) {
      throw error;
    }

    return returnValue as any;
  }
};
