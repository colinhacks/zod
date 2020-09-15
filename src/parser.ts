import * as z from './types/base';
import { ZodDef } from '.';
import {
  ZodError,
  ZodErrorCode,
  ZodSuberror,
  ZodSuberrorOptionalMessage,
} from './ZodError';
import { util } from './helpers/util';
import { ZodErrorMap, defaultErrorMap } from './defaultErrorMap';
import { PseudoPromise } from './PseudoPromise';

export type ParseParams = {
  seen?: {
    schema: z.ZodType<any>;
    objects: { data: any; error?: any; promise: PseudoPromise<any> }[];
  }[];
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
  if (typeof data === 'undefined') return 'undefined';
  if (typeof data === 'object') {
    if (Array.isArray(data)) return 'array';
    if (!data) return 'null';
    if (
      data.then &&
      typeof data.then === 'function' &&
      data.catch &&
      typeof data.catch === 'function'
    ) {
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
type stripPath<T extends object> = T extends any
  ? util.OmitKeys<T, 'path'>
  : never;
export type MakeErrorData = stripPath<ZodSuberrorOptionalMessage> & {
  path?: (string | number)[];
};

const INVALID = Symbol('invalid_data');

export const ZodParser = (schema: z.ZodType<any>) => (
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
    const errorArg = {
      ...errorData,
      path: [...params.path, ...(errorData.path || [])],
    };
    const ctxArg = { data: data };

    const defaultError =
      defaultErrorMap === params.errorMap
        ? { message: `Invalid value.` }
        : defaultErrorMap(errorArg, {
            ...ctxArg,
            defaultError: `Invalid value.`,
          });
    return {
      ...errorData,
      path: [...params.path, ...(errorData.path || [])],
      message:
        errorData.message ||
        params.errorMap(errorArg, {
          ...ctxArg,
          defaultError: defaultError.message,
        }).message,
    };
  };

  const def: ZodDef = schema._def as any;

  const finder = (arr: any[], checker: (arg: any) => any) => {
    for (const item of arr) {
      if (checker(item)) return item;
    }
    return undefined;
  };

  const defaultPromise = new PseudoPromise();
  (defaultPromise as any)._default = true;
  const RESULT: { data: any; promise: PseudoPromise<any> } = {
    data,
    promise: defaultPromise,
  };
  params.seen = params.seen || [];
  params.seen.push({ schema, objects: [] });
  const schemaSeen = finder(params.seen, x => x.schema === schema); // params.seen.find(x => x.schema === schemaDef)!;
  const objectSeen = finder(schemaSeen.objects, arg => arg.data === data); //.find(x => x.data === data);

  if (objectSeen && def.t !== z.ZodTypes.transformer) {
    // return objectSeen.promise._cached.value; //.getValue();
    // return data;
  } else {
    schemaSeen.objects.push(RESULT);
  }

  //  else {
  //  params.seen.push({ schema: schemaDef, objects: [{ data, promise: PROM }] });
  // }
  // }

  const error = new ZodError([]);
  // const defaultRESULT.promise = Symbol('return_value');
  //  let returnValue: PseudoPromise<any>; // = defaultReturnValue;
  const parsedType = getParsedType(data);

  switch (def.t) {
    case z.ZodTypes.string:
      if (parsedType !== ZodParsedType.string) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.string,
            received: parsedType,
          }),
        );
        // setError(error);
        throw error;
      }
      RESULT.promise = PseudoPromise.resolve(data);

      break;
    case z.ZodTypes.number:
      if (parsedType !== ZodParsedType.number) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.number,
            received: parsedType,
          }),
        );
        // setError(error);
        throw error;
      }
      if (Number.isNaN(data)) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.number,
            received: ZodParsedType.nan,
          }),
        );
        // setError(error);
        throw error;
      }
      RESULT.promise = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.bigint:
      if (parsedType !== ZodParsedType.bigint) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.number,
            received: parsedType,
          }),
        );
        // setError(error);
        throw error;
      }
      RESULT.promise = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.boolean:
      if (parsedType !== ZodParsedType.boolean) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.boolean,
            received: parsedType,
          }),
        );
        // setError(error);
        throw error;
      }
      RESULT.promise = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.undefined:
      if (parsedType !== ZodParsedType.undefined) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.undefined,
            received: parsedType,
          }),
        );
        // setError(error);
        throw error;
      }
      RESULT.promise = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.null:
      if (parsedType !== ZodParsedType.null) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.null,
            received: parsedType,
          }),
        );
        // setError(error);
        throw error;
      }
      RESULT.promise = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.any:
      RESULT.promise = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.unknown:
      RESULT.promise = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.void:
      if (
        parsedType !== ZodParsedType.undefined &&
        parsedType !== ZodParsedType.null
      ) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.void,
            received: parsedType,
          }),
        );
        // setError(error);
        throw error;
      }
      RESULT.promise = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.array:
      if (parsedType !== ZodParsedType.array) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.array,
            received: parsedType,
          }),
        );
        // setError(error);
        throw error;
      }
      // const data: any[] = data;
      if (def.nonempty === true && data.length === 0) {
        error.addError(
          makeError({ code: ZodErrorCode.nonempty_array_is_empty }),
        );
        throw error;
      }
      // RESULT.promise = (data as any[]).map((item, i) => {
      //   try {
      //     return def.type.parse(item, { ...params, path: [...params.path, i] });
      //   } catch (err) {
      //     const zerr: ZodError = err;
      //     error.addErrors(zerr.errors);
      //   }
      // });
      RESULT.promise = PseudoPromise.all(
        (data as any[]).map((item, i) => {
          try {
            return PseudoPromise.resolve(
              def.type.parse(item, {
                ...params,
                path: [...params.path, i],
              }),
            );
          } catch (err) {
            if (err instanceof ZodError) {
              const zerr: ZodError = err;
              error.addErrors(zerr.errors);
              return PseudoPromise.resolve(INVALID);
            }
            throw err;
          }
        }),
      );
      // if (!error.isEmpty) {
      //   throw error;
      // }
      break;
    case z.ZodTypes.object:
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

      const objectPromises: { [k: string]: PseudoPromise<any> } = {};

      const shape = def.shape();
      const shapeKeys = Object.keys(shape);
      const dataKeys = Object.keys(data);
      const extraKeys = dataKeys.filter(k => shapeKeys.indexOf(k) === -1);

      if (extraKeys.length) {
        if (def.params.strict) {
          error.addError(
            makeError({
              code: ZodErrorCode.unrecognized_keys,
              keys: extraKeys,
            }),
          );
        } else {
          for (const key of extraKeys) {
            objectPromises[key] = PseudoPromise.resolve(data[key]);
          }
        }
      }

      for (const key of shapeKeys) {
        objectPromises[key] = new PseudoPromise().then(() => {
          try {
            return def.shape()[key].parse(data[key], {
              ...params,
              path: [...params.path, key],
            });
          } catch (err) {
            if (err instanceof ZodError) {
              const zerr: ZodError = err;
              error.addErrors(zerr.errors);
              return INVALID;
            } else {
              throw err;
            }
          }
        });
        // try {
        //   parsedobject[key] = PseudoPromise.resolve(
        //     def.shape()[key].parse(data[key], { ...params, path: [...params.path, key] }),
        //   );
        // } catch (err) {
        //   const zerr: ZodError = err;
        //   error.addErrors(zerr.errors);
        // }
      }

      RESULT.promise = PseudoPromise.object(objectPromises);

      break;
    case z.ZodTypes.union:
      // let parsedUnion: any;
      let isValid = false;
      const unionErrors: ZodError[] = [];
      // const INVALID = Symbol('invalid_data');
      RESULT.promise = PseudoPromise.all(
        def.options.map(opt => {
          try {
            const unionValueProm = PseudoPromise.resolve(
              opt.parse(data, params),
            );
            isValid = true;
            return unionValueProm;
            // return parsed;
          } catch (err) {
            if (err instanceof ZodError) {
              unionErrors.push(err);
              return PseudoPromise.resolve(INVALID);
            }
            throw err;
          }
          // }
        }),
      )
        .then((unionResults: any[]) => {
          return finder(unionResults, (val: any) => val !== INVALID);
        })
        .then((unionResult: any) => {
          // const unionResults: any[] = _unionResults;
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
            return INVALID;
          }

          return unionResult;
        });
      // .then(unionResults => (unionResults as any).find((res: any) => res !== INVALID));
      // for (const option of def.options) {
      //   try {
      //     parsedUnion = option.parse(data, params);
      //     isValid = true;
      //     break;
      //   } catch (err) {
      //     unionErrors.push(err);
      //   }
      // }

      // if (!isValid) {
      //   const filteredErrors = unionErrors.filter(err => {
      //     return err.errors[0].code !== 'invalid_type';
      //   });
      //   if (filteredErrors.length === 1) {
      //     error.addErrors(filteredErrors[0].errors);
      //   } else {
      //     error.addError(
      //       makeError({
      //         code: ZodErrorCode.invalid_union,
      //         unionErrors: unionErrors,
      //       }),
      //     );
      //   }
      // }
      // RESULT.promise = parsedUnion;
      break;
    case z.ZodTypes.intersection:
      // let parsedIntersection:any;
      // let parsedLeft: any;
      // let parsedRight: any;
      // RESULT.promise = PseudoPromise.resolve(data);
      RESULT.promise = PseudoPromise.all([
        new PseudoPromise().then(() => {
          try {
            return def.left.parse(data, params);
          } catch (err) {
            if (err instanceof ZodError) {
              error.addErrors(err.errors);
              return INVALID;
            }
            throw err;
          }
        }),
        new PseudoPromise().then(() => {
          try {
            return def.right.parse(data, params);
          } catch (err) {
            if (err instanceof ZodError) {
              error.addErrors(err.errors);
              return INVALID;
            }
            throw err;
          }
        }),
      ]).then(([parsedLeft, parsedRight]: any) => {
        if (parsedLeft === INVALID || parsedRight === INVALID) return INVALID;

        const parsedLeftType = getParsedType(parsedLeft);
        const parsedRightType = getParsedType(parsedRight);

        if (parsedLeft === parsedRight) {
          return parsedLeft;
        } else if (
          parsedLeftType === ZodParsedType.object &&
          parsedRightType === ZodParsedType.object
        ) {
          return { ...parsedLeft, ...parsedRight };
        } else {
          error.addError(
            makeError({
              code: ZodErrorCode.invalid_intersection_types,
            }),
          );
        }
      });

      break;

    case z.ZodTypes.tuple:
      if (parsedType !== ZodParsedType.array) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_type,
            expected: ZodParsedType.array,
            received: parsedType,
          }),
        );
        // setError(error);
        throw error;
      }
      if (data.length > def.items.length) {
        error.addError(
          makeError({
            code: ZodErrorCode.too_big,
            maximum: def.items.length,
            inclusive: true,
            type: 'array',
          }),
        );
      } else if (data.length < def.items.length) {
        error.addError(
          makeError({
            code: ZodErrorCode.too_small,
            minimum: def.items.length,
            inclusive: true,
            type: 'array',
          }),
        );
      }

      // const parsedTuple: any[] = [];
      const tupleData: any[] = data;
      // const parsedTuple: any = [];
      // const tuplePromises: PseudoPromise[] = [];

      RESULT.promise = PseudoPromise.all(
        tupleData.map((item, index) => {
          const itemParser = def.items[index];
          return new PseudoPromise().then(() => {
            try {
              return itemParser.parse(item, {
                ...params,
                path: [...params.path, index],
              });
            } catch (err) {
              if (err instanceof ZodError) {
                error.addErrors(err.errors);
                return INVALID;
              }
              throw err;
            }
          });
        }),
      );
      // for (const index in tupleData) {
      //   const item = tupleData[index];
      //   const itemParser = def.items[index];
      //   tuplePromises.push(
      //     new PseudoPromise().then(() => {
      //       try {
      //         return itemParser.parse(item, { ...params, path: [...params.path, index] });
      //       } catch (err) {
      //         error.addErrors(err.errors);
      //       }
      //     }),
      //   );
      //   // parsedTuple.push(itemParser.parse(item, { ...params, path: [...params.path, index] }));
      // }
      // RESULT.promise = parsedTuple;
      break;
    case z.ZodTypes.lazy:
      const lazySchema = def.getter();
      RESULT.promise = PseudoPromise.resolve(lazySchema.parse(data, params));
      break;
    case z.ZodTypes.literal:
      if (data !== def.value) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_literal_value,
            expected: def.value,
          }),
        );
      }
      RESULT.promise = PseudoPromise.resolve(data);
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
      RESULT.promise = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.nativeEnum:
      if (util.getValidEnumValues(def.values).indexOf(data) === -1) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_enum_value,
            options: Object.values(def.values),
          }),
        );
      }
      RESULT.promise = PseudoPromise.resolve(data);
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
          def.args.parse(args as any, params);
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
          return def.returns.parse(result, params);
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
      RESULT.promise = PseudoPromise.resolve(validatedFunc);
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
        // setError(error);
        throw error;
      }

      const parsedRecordPromises: { [k: string]: PseudoPromise<any> } = {};
      for (const key in data) {
        parsedRecordPromises[key] = new PseudoPromise().then(() => {
          try {
            return def.valueType.parse(data[key], {
              ...params,
              path: [...params.path, key],
            });
          } catch (err) {
            if (err instanceof ZodError) {
              error.addErrors(err.errors);
              return INVALID;
            }
            throw err;
          }
        });
      }
      RESULT.promise = PseudoPromise.object(parsedRecordPromises);
      // RESULT.promise = parsedRecord;
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
        // setError(error);
        throw error;
      }
      if (isNaN(data.getTime())) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_date,
          }),
        );
        // setError(error);
        throw error;
      }
      RESULT.promise = PseudoPromise.resolve(data);
      break;

    case z.ZodTypes.promise:
      if (parsedType !== ZodParsedType.promise && params.async !== true) {
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

      const promisified =
        parsedType === ZodParsedType.promise ? data : Promise.resolve(data);

      RESULT.promise = PseudoPromise.resolve(
        promisified.then((resolvedData: any) => {
          try {
            const parsed = def.type.parse(resolvedData, params);
            return parsed;
          } catch (err) {
            if (err instanceof ZodError) {
              error.addErrors(err.errors);
            }
            throw err;
          }
        }),
      );

      //   new Promise(async (res, rej) => {
      //     const dataValue = await data;
      //     try {
      //       const parsed = def.type.parse(dataValue, params);
      //       res(parsed);
      //     } catch (err) {
      //       rej(err);
      //     }
      //   }),
      // );
      break;
    case z.ZodTypes.transformer:
      RESULT.promise = new PseudoPromise()
        .then(() => {
          try {
            return def.input.parse(data, params);
          } catch (err) {
            if (err instanceof ZodError) {
              error.addErrors(err.errors);
            }
            throw err;
          }
        })

        .then(inputParseResult => {
          try {
            const transformed = def.transformer(inputParseResult);
            if (transformed instanceof Promise && params.async === false) {
              if (z.inputSchema(def.output)._def.t !== z.ZodTypes.promise) {
                throw new Error(
                  "You can't call .parse on a schema containing async transformations.",
                );
              }
            }
            return transformed;
          } catch (err) {
            if (err instanceof ZodError) {
              error.addErrors(err.errors);
              return INVALID;
            }
            throw err;
          }
        })
        .then(transformedResult => {
          try {
            return def.output.parse(transformedResult, params);
          } catch (err) {
            if (err instanceof ZodError) {
              error.addErrors(err.errors);
              return INVALID;
            }
            throw err;
          }
        });
      break;
    default:
      RESULT.promise = PseudoPromise.resolve('adsf' as never);
      util.assertNever(def);
  }

  if ((RESULT.promise as any)._default === true) {
    throw new Error('Result is not materialized.');
  }

  if (!error.isEmpty) {
    throw error;
  }

  const customChecks = def.checks || [];

  if (params.async === false) {
    const resolvedValue = RESULT.promise.getValueSync();

    // const SYNC_ERROR =
    // "You can't use .parse on a schema containing async refinements or transformations. Use .parseAsync instead.";
    // if (resolvedValue instanceof Promise) {

    //   if (def.t !== z.ZodTypes.promise) {
    //     throw new Error(SYNC_ERROR);
    //   }
    // }

    for (const check of customChecks) {
      const checkResult = check.check(resolvedValue);
      if (checkResult instanceof Promise)
        throw new Error(
          "You can't use .parse on a schema containing async refinements. Use .parseAsync instead.",
        );
      if (!checkResult) {
        const { check: checkMethod, ...noMethodCheck } = check;
        error.addError(makeError(noMethodCheck));
      }
    }
    if (!error.isEmpty) {
      throw error;
    }
    // if (resolvedValue === INVALID) {
    //   throw new ZodError([]).addError(
    //     makeError({
    //       code: ZodErrorCode.custom_error,
    //       message: 'Invalid',
    //     }),
    //   );
    // }
    return resolvedValue as any;
  } else {
    // if (params.async == true) {
    const checker = async () => {
      const resolvedValue = await RESULT.promise.getValueAsync();

      await Promise.all(
        customChecks.map(async check => {
          const checkResult = await check.check(resolvedValue);
          if (!checkResult) {
            const { check: checkMethod, ...noMethodCheck } = check;
            error.addError(makeError(noMethodCheck));
          } else {
          }
        }),
      );

      if (resolvedValue === INVALID && error.isEmpty) {
        error.addError(
          makeError({
            code: ZodErrorCode.custom_error,
            message: 'Invalid',
          }),
        );
      }

      if (!error.isEmpty) {
        throw error;
      }

      return resolvedValue;
    };

    return checker();
  }
};
