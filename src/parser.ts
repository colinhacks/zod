import * as z from './types/base';
import { ZodDef, ZodNever } from './index';
import {
  ZodError,
  ZodIssueCode,
  ZodIssue,
  ZodIssueOptionalMessage,
} from './ZodError';
import { util } from './helpers/util';
import { ZodErrorMap, defaultErrorMap } from './defaultErrorMap';
import { PseudoPromise } from './PseudoPromise';

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
  'never',
]);

export type ZodParsedType = keyof typeof ZodParsedType;

// conditional required to distribute union
type stripPath<T extends object> = T extends any
  ? util.OmitKeys<T, 'path'>
  : never;
export type MakeErrorData = stripPath<ZodIssueOptionalMessage> & {
  path?: (string | number)[];
};

const INVALID = Symbol('invalid_data');
const NODATA = Symbol('no_data');

export type ParseParams = {
  seen?: {
    schema: z.ZodType<any>;
    objects: { input: any; error?: ZodError; output: any }[];
  }[];
  path?: (string | number)[];
  errorMap?: ZodErrorMap;
  async?: boolean;
};

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

  const makeError = (errorData: MakeErrorData): ZodIssue => {
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

  let PROMISE: PseudoPromise<any> = new PseudoPromise();
  (PROMISE as any)._default = true;

  const RESULT: { input: any; output: any; error?: ZodError } = {
    input: data,
    output: NODATA,
  };

  params.seen = params.seen || [];

  // partially working cycle detection system

  // params.seen.push({ schema, objects: [] });
  // const schemaSeen = util.find(params.seen, x => x.schema === schema)!; // params.seen.find(x => x.schema === schemaDef)!;
  // const objectSeen = util.find(schemaSeen.objects, arg => arg.input === data); //.find(x => x.data === data);
  // if (objectSeen) {
  // console.log('object seen');
  // if (objectSeen.error) {
  // don't throw previous error
  // the path with be wrong for arrays
  // let the validation re-run and generate a new error
  // } else if (objectSeen.output !== NODATA) {
  // return the previous value
  //     return objectSeen.output;
  //   }
  // } else {
  //   schemaSeen.objects.push(RESULT);
  // }

  //  else {
  //  params.seen.push({ schema: schemaDef, objects: [{ data, promise: PROM }] });
  // }
  // }

  const ERROR = new ZodError([]);
  const THROW = () => {
    RESULT.error = ERROR;
    throw ERROR;
  };
  // const defaultPROMISE = Symbol('return_value');
  //  let returnValue: PseudoPromise<any>; // = defaultReturnValue;
  const parsedType = getParsedType(data);

  switch (def.t) {
    case z.ZodTypes.string:
      if (parsedType !== ZodParsedType.string) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.string,
            received: parsedType,
          }),
        );
        // setError(error);
        THROW();
      }
      PROMISE = PseudoPromise.resolve(data);

      break;
    case z.ZodTypes.number:
      if (parsedType !== ZodParsedType.number) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: parsedType,
          }),
        );
        // setError(error);
        THROW();
      }
      if (Number.isNaN(data)) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: ZodParsedType.nan,
          }),
        );
        // setError(error);
        THROW();
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.bigint:
      if (parsedType !== ZodParsedType.bigint) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: parsedType,
          }),
        );
        // setError(error);
        THROW();
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.boolean:
      if (parsedType !== ZodParsedType.boolean) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.boolean,
            received: parsedType,
          }),
        );
        // setError(error);
        THROW();
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.undefined:
      if (parsedType !== ZodParsedType.undefined) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.undefined,
            received: parsedType,
          }),
        );
        // setError(error);
        THROW();
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.null:
      if (parsedType !== ZodParsedType.null) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.null,
            received: parsedType,
          }),
        );
        // setError(error);
        THROW();
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.any:
      PROMISE = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.unknown:
      PROMISE = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.never:
      ERROR.addIssue(
        makeError({
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.never,
          received: parsedType,
        }),
      );
      PROMISE = PseudoPromise.resolve(INVALID);
      break;
    case z.ZodTypes.void:
      if (
        parsedType !== ZodParsedType.undefined &&
        parsedType !== ZodParsedType.null
      ) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.void,
            received: parsedType,
          }),
        );
        // setError(error);
        THROW();
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.array:
      RESULT.output = [];
      if (parsedType !== ZodParsedType.array) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: parsedType,
          }),
        );
        // setError(error);
        THROW();
      }
      // const data: any[] = data;
      if (def.nonempty === true && data.length === 0) {
        ERROR.addIssue(
          makeError({ code: ZodIssueCode.nonempty_array_is_empty }),
        );
        THROW();
      }
      // PROMISE = (data as any[]).map((item, i) => {
      //   try {
      //     return def.type.parse(item, { ...params, path: [...params.path, i] });
      //   } catch (err) {
      //     const zerr: ZodError = err;
      //     ERROR.addIssues(zerr.issues);
      //   }
      // });
      PROMISE = PseudoPromise.all(
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
              ERROR.addIssues(zerr.issues);
              return PseudoPromise.resolve(INVALID);
            }
            throw err;
          }
        }),
      );
      // if (!ERROR.isEmpty) {
      //   THROW();
      // }
      break;
    case z.ZodTypes.object:
      RESULT.output = {};
      if (parsedType !== ZodParsedType.object) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: parsedType,
          }),
        );
        THROW();
      }

      const objectPromises: { [k: string]: PseudoPromise<any> } = {};

      const shape = def.shape();
      const shapeKeys = Object.keys(shape);
      const dataKeys = Object.keys(data);
      const extraKeys = dataKeys.filter(k => shapeKeys.indexOf(k) === -1);

      for (const key of shapeKeys) {
        const keyValidator = shapeKeys.includes(key)
          ? shape[key]
          : !(def.catchall instanceof ZodNever)
          ? def.catchall
          : undefined;

        if (!keyValidator) continue;

        // check if schema and value are both optional

        // const keyDataType = getParsedType(data[key]);
        if (!Object.keys(data).includes(key)) {
          try {
            const output = keyValidator.parse(undefined, {
              ...params,
              path: [...params.path, key],
            });
            if (output === undefined) {
              // schema is optional
              // data is undefined
              // don't explicity add undefined to outut
              continue;
            }
          } catch (err) {}
        }

        objectPromises[key] = new PseudoPromise().then(() => {
          try {
            const parsedValue = keyValidator.parse(data[key], {
              ...params,
              path: [...params.path, key],
            });
            return parsedValue;
          } catch (err) {
            if (err instanceof ZodError) {
              const zerr: ZodError = err;
              ERROR.addIssues(zerr.issues);
              return INVALID;
            } else {
              throw err;
            }
          }
        });
      }

      if (def.catchall instanceof ZodNever) {
        if (def.unknownKeys === 'passthrough') {
          for (const key of extraKeys) {
            objectPromises[key] = PseudoPromise.resolve(data[key]);
          }
        } else if (def.unknownKeys === 'strict') {
          if (extraKeys.length > 0) {
            ERROR.addIssue(
              makeError({
                code: ZodIssueCode.unrecognized_keys,
                keys: extraKeys,
              }),
            );
          }
        } else if (def.unknownKeys === 'strip') {
          // do nothing
        } else {
          util.assertNever(def.unknownKeys);
        }
      }

      PROMISE = PseudoPromise.object(objectPromises)
        .then(resolvedObject => {
          Object.assign(RESULT.output, resolvedObject);
          return RESULT.output;
        })
        .catch(err => {
          if (err instanceof ZodError) {
            ERROR.addIssues(err.issues);
          }

          return INVALID;
        });

      break;
    case z.ZodTypes.union:
      // let parsedUnion: any;
      let isValid = false;
      const unionErrors: ZodError[] = [];
      // const INVALID = Symbol('invalid_data');
      PROMISE = PseudoPromise.all(
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
          return util.find(unionResults, (val: any) => val !== INVALID);
        })
        .then((unionResult: any) => {
          // const unionResults: any[] = _unionResults;
          if (!isValid) {
            const filteredErrors = unionErrors.filter(err => {
              return err.issues[0].code !== 'invalid_type';
            });
            if (filteredErrors.length === 1) {
              ERROR.addIssues(filteredErrors[0].issues);
            } else {
              ERROR.addIssue(
                makeError({
                  code: ZodIssueCode.invalid_union,
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
      //     return err.issues[0].code !== 'invalid_type';
      //   });
      //   if (filteredErrors.length === 1) {
      //     ERROR.addIssues(filteredErrors[0].issues);
      //   } else {
      //     ERROR.addIssue(
      //       makeError({
      //         code: ZodIssueCode.invalid_union,
      //         unionErrors: unionErrors,
      //       }),
      //     );
      //   }
      // }
      // PROMISE = parsedUnion;
      break;
    case z.ZodTypes.intersection:
      // let parsedIntersection:any;
      // let parsedLeft: any;
      // let parsedRight: any;
      // PROMISE = PseudoPromise.resolve(data);
      PROMISE = PseudoPromise.all([
        new PseudoPromise().then(() => {
          try {
            return def.left.parse(data, params);
          } catch (err) {
            if (err instanceof ZodError) {
              ERROR.addIssues(err.issues);
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
              ERROR.addIssues(err.issues);
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
          ERROR.addIssue(
            makeError({
              code: ZodIssueCode.invalid_intersection_types,
            }),
          );
        }
      });

      break;

    case z.ZodTypes.optional:
      if (parsedType === ZodParsedType.undefined) {
        PROMISE = PseudoPromise.resolve(undefined);
        break;
      }

      PROMISE = new PseudoPromise().then(() => {
        try {
          return def.innerType.parse(data, params);
        } catch (err) {
          if (err instanceof ZodError) {
            ERROR.addIssues(err.issues);
            return INVALID;
          }
          throw err;
        }
      });
      break;
    case z.ZodTypes.nullable:
      if (parsedType === ZodParsedType.null) {
        PROMISE = PseudoPromise.resolve(null);
        break;
      }

      PROMISE = new PseudoPromise().then(() => {
        try {
          return def.innerType.parse(data, params);
        } catch (err) {
          if (err instanceof ZodError) {
            ERROR.addIssues(err.issues);
            return INVALID;
          }
          throw err;
        }
      });
      break;
    case z.ZodTypes.tuple:
      if (parsedType !== ZodParsedType.array) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: parsedType,
          }),
        );
        // setError(error);
        THROW();
      }
      if (data.length > def.items.length) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.too_big,
            maximum: def.items.length,
            inclusive: true,
            type: 'array',
          }),
        );
      } else if (data.length < def.items.length) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.too_small,
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

      PROMISE = PseudoPromise.all(
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
                ERROR.addIssues(err.issues);
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
      //         ERROR.addIssues(err.issues);
      //       }
      //     }),
      //   );
      //   // parsedTuple.push(itemParser.parse(item, { ...params, path: [...params.path, index] }));
      // }
      // PROMISE = parsedTuple;
      break;
    case z.ZodTypes.lazy:
      const lazySchema = def.getter();
      PROMISE = PseudoPromise.resolve(lazySchema.parse(data, params));
      break;
    case z.ZodTypes.literal:
      if (data !== def.value) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_literal_value,
            expected: def.value,
          }),
        );
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.enum:
      if (def.values.indexOf(data) === -1) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_enum_value,
            options: def.values,
          }),
        );
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.nativeEnum:
      if (util.getValidEnumValues(def.values).indexOf(data) === -1) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_enum_value,
            options: util.objectValues(def.values),
          }),
        );
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.function:
      if (parsedType !== ZodParsedType.function) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.function,
            received: parsedType,
          }),
        );
        // setError(error);
        THROW();
      }
      const validatedFunc = (...args: any[]) => {
        try {
          def.args.parse(args as any, params);
        } catch (err) {
          if (err instanceof ZodError) {
            const argsError = new ZodError([]);
            argsError.addIssue(
              makeError({
                code: ZodIssueCode.invalid_arguments,
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
            returnsError.addIssue(
              makeError({
                code: ZodIssueCode.invalid_return_type,
                returnTypeError: err,
              }),
            );
            throw returnsError;
          }
          throw err;
        }
      };
      PROMISE = PseudoPromise.resolve(validatedFunc);
      // return validatedFunc;
      break;
    case z.ZodTypes.record:
      if (parsedType !== ZodParsedType.object) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: parsedType,
          }),
        );
        // setError(error);
        THROW();
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
              ERROR.addIssues(err.issues);
              return INVALID;
            }
            throw err;
          }
        });
      }
      PROMISE = PseudoPromise.object(parsedRecordPromises);
      // PROMISE = parsedRecord;
      break;
    case z.ZodTypes.date:
      if (!(data instanceof Date)) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.date,
            received: parsedType,
          }),
        );
        // setError(error);
        THROW();
      }
      if (isNaN(data.getTime())) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_date,
          }),
        );
        // setError(error);
        THROW();
      }
      PROMISE = PseudoPromise.resolve(data);
      break;

    case z.ZodTypes.promise:
      if (parsedType !== ZodParsedType.promise && params.async !== true) {
        ERROR.addIssue(
          makeError({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.promise,
            received: parsedType,
          }),
        );
        // setError(error);
        THROW();
      }

      const promisified =
        parsedType === ZodParsedType.promise ? data : Promise.resolve(data);

      PROMISE = PseudoPromise.resolve(
        promisified.then((resolvedData: any) => {
          try {
            const parsed = def.type.parse(resolvedData, params);
            return parsed;
          } catch (err) {
            if (err instanceof ZodError) {
              ERROR.addIssues(err.issues);
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
      PROMISE = new PseudoPromise()
        .then(() => {
          try {
            return def.input.parse(data, params);
          } catch (err) {
            if (err instanceof ZodError) {
              ERROR.addIssues(err.issues);
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
              ERROR.addIssues(err.issues);
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
              ERROR.addIssues(err.issues);
              return INVALID;
            }
            throw err;
          }
        });
      break;
    default:
      PROMISE = PseudoPromise.resolve('adsf' as never);
      util.assertNever(def);
  }

  if ((PROMISE as any)._default === true) {
    throw new Error('Result is not materialized.');
  }

  if (!ERROR.isEmpty) {
    THROW();
  }

  const customChecks = def.checks || [];

  const checkCtx = {
    addIssue: (arg: MakeErrorData) => {
      ERROR.addIssue(makeError(arg));
    },
  };
  if (params.async === false) {
    const resolvedValue = PROMISE.getValueSync();

    // const SYNC_ERROR =
    // "You can't use .parse on a schema containing async refinements or transformations. Use .parseAsync instead.";
    // if (resolvedValue instanceof Promise) {

    //   if (def.t !== z.ZodTypes.promise) {
    //     throw new Error(SYNC_ERROR);
    //   }
    // }

    for (const check of customChecks) {
      const checkResult = check.check(resolvedValue, checkCtx);
      if (checkResult instanceof Promise)
        throw new Error(
          "You can't use .parse on a schema containing async refinements. Use .parseAsync instead.",
        );

      // if (!checkResult) {
      //   const { check: checkMethod, ...noMethodCheck } = check;
      //   ERROR.addIssue(makeError(noMethodCheck));
      // }
    }
    if (!ERROR.isEmpty) {
      THROW();
    }
    // if (resolvedValue === INVALID) {
    //   throw new ZodError([]).addIssue(
    //     makeError({
    //       code: ZodIssueCode.custom,
    //       message: 'Invalid',
    //     }),
    //   );
    // }
    return resolvedValue as any;
  } else {
    // if (params.async == true) {
    const checker = async () => {
      let resolvedValue = await PROMISE.getValueAsync();

      if (resolvedValue !== INVALID) {
        // let someError: boolean = false;
        await customChecks.reduce((previousPromise, check) => {
          return previousPromise.then(async () => {
            // if (!someError) {
            // const len = ERROR.issues.length;
            await check.check(resolvedValue, checkCtx);
            // if (len < ERROR.issues.length)
            // someError = true;
            // }
          });
        }, Promise.resolve());
      }
      // if (resolvedValue !== INVALID) {
      //   await Promise.all(
      //     customChecks.map(async check => {
      //       await check.check(resolvedValue, checkCtx);
      //         if (ERROR.issues.length > len) someError = true;
      //       }
      //       // if (!checkResult) {
      //       //   const { check: checkMethod, ...noMethodCheck } = check;
      //       //   ERROR.addIssue(makeError(noMethodCheck));
      //       // } else {
      //       // }
      //     }),
      //   );
      // }
      else {
        if (ERROR.isEmpty) {
          ERROR.addIssue(
            makeError({
              code: ZodIssueCode.custom,
              message: 'Invalid',
            }),
          );
        }
      }

      if (!ERROR.isEmpty) {
        THROW();
      }

      return resolvedValue;
    };

    return checker();
  }
};
