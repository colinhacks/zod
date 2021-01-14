import { defaultErrorMap, ZodErrorMap } from "./defaultErrorMap";
import { INVALID, util } from "./helpers/util";
import { NOSET, PseudoPromise } from "./PseudoPromise";
// import { inputSchema } from "../types/base/output-schema";
import { ZodType, RefinementCtx } from ".";
// type adsf = RefinementCtx
// import { ZodNever } from "../types/never";
// import { ZodPromise } from "../types/promise";
import { ZodDef } from "./ZodDef";
import { ZodError, ZodIssue, ZodIssueCode, MakeErrorData } from "./ZodError";
import { ZodParsedType } from "./ZodParsedType";
import { ZodTypes } from "./ZodTypes";

export const getParsedType = (data: any): ZodParsedType => {
  if (typeof data === "string") return "string";
  if (typeof data === "number") {
    if (Number.isNaN(data)) return "nan";
    return "number";
  }
  if (typeof data === "boolean") return "boolean";
  if (typeof data === "bigint") return "bigint";
  if (typeof data === "symbol") return "symbol";
  if (data instanceof Date) return "date";
  if (typeof data === "function") return "function";
  if (data === undefined) return "undefined";
  if (typeof data === "undefined") return "undefined";
  if (typeof data === "object") {
    if (Array.isArray(data)) return "array";
    if (data === null) return "null";
    if (
      data.then &&
      typeof data.then === "function" &&
      data.catch &&
      typeof data.catch === "function"
    ) {
      return "promise";
    }
    if (data instanceof Map) {
      return "map";
    }
    return "object";
  }
  return "unknown";
};

const makeError = (
  params: Required<ParseParams>,
  data: any,
  errorData: MakeErrorData
): ZodIssue => {
  const errorArg = {
    ...errorData,
    path: [...params.path, ...(errorData.path || [])],
  };
  const ctxArg = { data };

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

export type ParseParams = {
  seen?: {
    schema: ZodType<any>;
    objects: { input: any; error?: ZodError; output: any }[];
  }[];
  path?: (string | number)[];
  errorMap?: ZodErrorMap;
  async?: boolean;
  runAsyncValidationsInSeries?: boolean;
};

export const ZodParser = (schema: ZodType<any>) => (
  data: any,
  baseParams: ParseParams = { seen: [], errorMap: defaultErrorMap, path: [] }
) => {
  const params: Required<ParseParams> = {
    seen: baseParams.seen || [],
    path: baseParams.path || [],
    errorMap: baseParams.errorMap || defaultErrorMap,
    async: baseParams.async ?? false,
    runAsyncValidationsInSeries:
      baseParams.runAsyncValidationsInSeries ?? false,
  };

  const def: ZodDef = schema._def as any;

  let PROMISE: PseudoPromise<any> = new PseudoPromise();
  (PROMISE as any)._default = true;

  const RESULT: { input: any; output: any; error?: ZodError } = {
    input: data,
    output: INVALID,
  };

  params.seen = params.seen || [];

  const ISSUES: ZodIssue[] = [];

  const HANDLE = (err: Error) => {
    if (err instanceof ZodError) {
      ISSUES.push(...err.issues);
      return INVALID;
    }
    throw new ZodError(ISSUES);
  };

  const parsedType = getParsedType(data);

  switch (def.t) {
    case ZodTypes.string:
      if (parsedType !== ZodParsedType.string) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.string,
            received: parsedType,
          })
        );

        throw new ZodError(ISSUES);
      }
      PROMISE = PseudoPromise.resolve(data);

      break;
    case ZodTypes.number:
      if (parsedType !== ZodParsedType.number) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: parsedType,
          })
        );

        throw new ZodError(ISSUES);
      }
      if (Number.isNaN(data)) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: ZodParsedType.nan,
          })
        );

        throw new ZodError(ISSUES);
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.bigint:
      if (parsedType !== ZodParsedType.bigint) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.bigint,
            received: parsedType,
          })
        );

        throw new ZodError(ISSUES);
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.boolean:
      if (parsedType !== ZodParsedType.boolean) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.boolean,
            received: parsedType,
          })
        );

        throw new ZodError(ISSUES);
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.undefined:
      if (parsedType !== ZodParsedType.undefined) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.undefined,
            received: parsedType,
          })
        );

        throw new ZodError(ISSUES);
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.null:
      if (parsedType !== ZodParsedType.null) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.null,
            received: parsedType,
          })
        );

        throw new ZodError(ISSUES);
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.any:
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.unknown:
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.never:
      ISSUES.push(
        makeError(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.never,
          received: parsedType,
        })
      );
      PROMISE = PseudoPromise.resolve(INVALID);
      break;
    case ZodTypes.void:
      if (
        parsedType !== ZodParsedType.undefined &&
        parsedType !== ZodParsedType.null
      ) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.void,
            received: parsedType,
          })
        );

        throw new ZodError(ISSUES);
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.array:
      RESULT.output = [];
      if (parsedType !== ZodParsedType.array) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: parsedType,
          })
        );

        throw new ZodError(ISSUES);
      }
      // const data: any[] = data;
      if (def.nonempty === true && data.length === 0) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.nonempty_array_is_empty,
          })
        );
        throw new ZodError(ISSUES);
      }

      PROMISE = PseudoPromise.all(
        (data as any[]).map((item, i) => {
          return new PseudoPromise()
            .then(() =>
              def.type.parse(item, {
                ...params,
                path: [...params.path, i],
              })
            )
            .catch((err) => {
              if (!(err instanceof ZodError)) {
                throw err;
              }
              ISSUES.push(...err.issues);
              return INVALID;
            });
        })
      );

      break;
    case ZodTypes.map:
      if (parsedType !== ZodParsedType.map) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.map,
            received: parsedType,
          })
        );
        throw new ZodError(ISSUES);
      }

      const dataMap: Map<unknown, unknown> = data;
      const returnedMap = new Map();

      PROMISE = PseudoPromise.all(
        [...dataMap.entries()].map(([key, value], index) => {
          return PseudoPromise.all([
            new PseudoPromise()
              .then(() => {
                return def.keyType.parse(key, {
                  ...params,
                  path: [...params.path, index, "key"],
                });
              })
              .catch(HANDLE),
            new PseudoPromise()
              .then(() => {
                const mapValue = def.valueType.parse(value, {
                  ...params,
                  path: [...params.path, index, "value"],
                });
                return [key, mapValue];
              })
              .catch(HANDLE),
          ])
            .then((item: any) => {
              if (item[0] !== INVALID && item[1] !== INVALID) {
                returnedMap.set(item[0], item[1]);
              }
            })
            .catch(HANDLE);
        })
      )
        .then(() => {
          if (ISSUES.length !== 0) {
            throw new ZodError(ISSUES);
          }
        })
        .then(() => {
          return returnedMap;
        })
        .then(() => {
          return returnedMap;
        });
      break;
    case ZodTypes.object:
      RESULT.output = {};
      if (parsedType !== ZodParsedType.object) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: parsedType,
          })
        );
        throw new ZodError(ISSUES);
      }

      const objectPromises: { [k: string]: PseudoPromise<any> } = {};

      const shape = def.shape();
      const shapeKeys = Object.keys(shape); // TODO: to set
      const dataKeys = Object.keys(data);

      const extraKeys = dataKeys.filter((k) => shapeKeys.indexOf(k) === -1);

      for (const key of shapeKeys) {
        const keyValidator = shapeKeys.includes(key)
          ? shape[key]
          : !(def.catchall._def.t === ZodTypes.never)
          ? def.catchall
          : undefined;

        if (!keyValidator) {
          continue;
        }

        // first check is required to avoid non-enumerable keys
        if (typeof data[key] === "undefined" && !dataKeys.includes(key)) {
          objectPromises[key] = new PseudoPromise()
            .then(() => {
              return keyValidator.parse(undefined, {
                ...params,
                path: [...params.path, key],
              });
            })
            .then((output) => {
              if (output === undefined) {
                // schema is optional
                // data is undefined
                // don't explicity add undefined to outut
                // continue;
                return NOSET;
              } else {
                return output;
              }
            })
            .catch((err) => {
              if (err instanceof ZodError) {
                const zerr: ZodError = err;
                ISSUES.push(...zerr.issues);
                objectPromises[key] = PseudoPromise.resolve(INVALID);
              } else {
                throw err;
              }
            });

          continue;
        }

        objectPromises[key] = new PseudoPromise()
          .then(() => {
            return keyValidator.parse(data[key], {
              ...params,
              path: [...params.path, key],
            });
          })
          .catch((err) => {
            if (err instanceof ZodError) {
              const zerr: ZodError = err;
              ISSUES.push(...zerr.issues);
              return INVALID;
            } else {
              throw err;
            }
          });
      }

      if (def.catchall._def.t === ZodTypes.never) {
        if (def.unknownKeys === "passthrough") {
          for (const key of extraKeys) {
            objectPromises[key] = PseudoPromise.resolve(data[key]);
          }
        } else if (def.unknownKeys === "strict") {
          if (extraKeys.length > 0) {
            ISSUES.push(
              makeError(params, data, {
                code: ZodIssueCode.unrecognized_keys,
                keys: extraKeys,
              })
            );
          }
        } else if (def.unknownKeys === "strip") {
          // do nothing
        } else {
          util.assertNever(def.unknownKeys);
        }
      } else {
        // run catchall validation
        for (const key of extraKeys) {
          objectPromises[key] = new PseudoPromise()
            .then(() => {
              const parsedValue = def.catchall.parse(data[key], {
                ...params,
                path: [...params.path, key],
              });
              return parsedValue;
            })
            .catch((err) => {
              if (err instanceof ZodError) {
                ISSUES.push(...err.issues);
              } else {
                throw err;
              }
            });
        }
      }

      PROMISE = PseudoPromise.object(objectPromises)
        .then((resolvedObject) => {
          Object.assign(RESULT.output, resolvedObject);
          return RESULT.output;
        })
        .then((finalObject) => {
          if (ISSUES.length > 0) {
            return INVALID;
          }
          return finalObject;
        })
        .catch((err) => {
          if (err instanceof ZodError) {
            ISSUES.push(...err.issues);
            return INVALID;
          }
          throw err;
        });

      break;
    case ZodTypes.union:
      let isValid = false;
      const unionErrors: ZodError[] = [];

      PROMISE = PseudoPromise.all(
        def.options.map((opt, _j) => {
          // return new PseudoPromise().then
          return new PseudoPromise()
            .then(() => {
              return opt.parse(data, params);
            })
            .then((optionData) => {
              isValid = true;
              return optionData;
            })
            .catch((err) => {
              if (err instanceof ZodError) {
                unionErrors.push(err);
                return INVALID;
              }
              throw err;
            });
        })
      )
        .then((unionResults) => {
          if (!isValid) {
            const nonTypeErrors = unionErrors.filter((err) => {
              return err.issues[0].code !== "invalid_type";
            });
            if (nonTypeErrors.length === 1) {
              ISSUES.push(...nonTypeErrors[0].issues);
            } else {
              ISSUES.push(
                makeError(params, data, {
                  code: ZodIssueCode.invalid_union,
                  unionErrors,
                })
              );
            }
            throw new ZodError(ISSUES);
            // return;
          }
          return unionResults;
        })
        .then((unionResults: any[]) => {
          return util.find(unionResults, (val: any) => val !== INVALID);
        });

      break;
    case ZodTypes.intersection:
      PROMISE = PseudoPromise.all([
        new PseudoPromise()
          .then(() => {
            return def.left.parse(data, params);
          })
          .catch(HANDLE),
        new PseudoPromise()
          .then(() => {
            return def.right.parse(data, params);
          })
          .catch(HANDLE),
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
          ISSUES.push(
            makeError(params, data, {
              code: ZodIssueCode.invalid_intersection_types,
            })
          );
        }
      });

      break;

    case ZodTypes.optional:
      if (parsedType === ZodParsedType.undefined) {
        PROMISE = PseudoPromise.resolve(undefined);
        break;
      }

      PROMISE = new PseudoPromise()
        .then(() => {
          return def.innerType.parse(data, params);
        })
        .catch(HANDLE);
      break;
    case ZodTypes.nullable:
      if (parsedType === ZodParsedType.null) {
        PROMISE = PseudoPromise.resolve(null);
        break;
      }

      PROMISE = new PseudoPromise()
        .then(() => {
          return def.innerType.parse(data, params);
        })
        .catch(HANDLE);
      break;
    case ZodTypes.tuple:
      if (parsedType !== ZodParsedType.array) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: parsedType,
          })
        );

        throw new ZodError(ISSUES);
      }
      if (data.length > def.items.length) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.too_big,
            maximum: def.items.length,
            inclusive: true,
            type: "array",
          })
        );
      } else if (data.length < def.items.length) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.too_small,
            minimum: def.items.length,
            inclusive: true,
            type: "array",
          })
        );
      }

      const tupleData: any[] = data;

      PROMISE = PseudoPromise.all(
        tupleData.map((item, index) => {
          const itemParser = def.items[index];
          return new PseudoPromise()
            .then(() => {
              const tupleDatum = itemParser.parse(item, {
                ...params,
                path: [...params.path, index],
              });
              return tupleDatum;
            })
            .catch((err) => {
              if (err instanceof ZodError) {
                ISSUES.push(...err.issues);
                return;
              }
              throw err;
            })
            .then((arg) => {
              return arg;
            });
        })
      )
        .then((tupleData) => {
          if (ISSUES.length !== 0) throw new ZodError(ISSUES);
          return tupleData;
        })

        .catch((err) => {
          throw err;
        });

      break;
    case ZodTypes.lazy:
      const lazySchema = def.getter();
      PROMISE = PseudoPromise.resolve(lazySchema.parse(data, params));
      break;
    case ZodTypes.literal:
      if (data !== def.value) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_literal_value,
            expected: def.value,
          })
        );
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.enum:
      if (def.values.indexOf(data) === -1) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_enum_value,
            options: def.values,
          })
        );
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.nativeEnum:
      if (util.getValidEnumValues(def.values).indexOf(data) === -1) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_enum_value,
            options: util.objectValues(def.values),
          })
        );
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.function:
      if (parsedType !== ZodParsedType.function) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.function,
            received: parsedType,
          })
        );

        throw new ZodError(ISSUES);
      }

      const isAsyncFunction = def.returns._def.t === ZodTypes.promise;

      const validatedFunction = (...args: any[]) => {
        const internalProm = new PseudoPromise()
          .then(() => {
            return def.args.parse(args as any, {
              ...params,
              async: isAsyncFunction,
            });
          })
          .catch((err) => {
            if (!(err instanceof ZodError)) throw err;
            const argsError = new ZodError([]);
            argsError.addIssue(
              makeError(params, data, {
                code: ZodIssueCode.invalid_arguments,
                argumentsError: err,
              })
            );
            throw argsError;
          })
          .then((args) => {
            return data(...(args as any));
          })
          .then((result) => {
            return def.returns.parse(result, {
              ...params,
              async: isAsyncFunction,
            });
          })
          .catch((err) => {
            if (err instanceof ZodError) {
              const returnsError = new ZodError([]);
              returnsError.addIssue(
                makeError(params, data, {
                  code: ZodIssueCode.invalid_return_type,
                  returnTypeError: err,
                })
              );
              throw returnsError;
            }
            throw err;
          });

        if (isAsyncFunction) {
          return internalProm.getValueAsync();
        } else {
          return internalProm.getValueSync();
        }
      };
      PROMISE = PseudoPromise.resolve(validatedFunction);

      break;
    case ZodTypes.record:
      if (parsedType !== ZodParsedType.object) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: parsedType,
          })
        );

        throw new ZodError(ISSUES);
      }

      const parsedRecordPromises: { [k: string]: PseudoPromise<any> } = {};
      for (const key in data) {
        parsedRecordPromises[key] = new PseudoPromise()
          .then(() => {
            return def.valueType.parse(data[key], {
              ...params,
              path: [...params.path, key],
            });
          })
          .catch(HANDLE);
      }
      PROMISE = PseudoPromise.object(parsedRecordPromises);

      break;
    case ZodTypes.date:
      if (!(data instanceof Date)) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.date,
            received: parsedType,
          })
        );

        throw new ZodError(ISSUES);
      }
      if (isNaN(data.getTime())) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_date,
          })
        );

        throw new ZodError(ISSUES);
      }
      PROMISE = PseudoPromise.resolve(data);
      break;

    case ZodTypes.promise:
      if (parsedType !== ZodParsedType.promise && params.async !== true) {
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.promise,
            received: parsedType,
          })
        );

        throw new ZodError(ISSUES);
      }

      const promisified =
        parsedType === ZodParsedType.promise ? data : Promise.resolve(data);

      PROMISE = PseudoPromise.resolve(
        promisified.then((resolvedData: any) => {
          return def.type.parse(resolvedData, params);
        })
      );

      break;
    case ZodTypes.transformer:
      PROMISE = new PseudoPromise()
        .then(() => {
          return def.input.parse(data, params);
        })

        .then((inputParseResult) => {
          const transformed = def.transformer(inputParseResult);
          if (transformed instanceof Promise && params.async === false) {
            if (def.output._def.t !== ZodTypes.promise) {
              throw new Error(
                "You can't call .parse on a schema containing async transformations."
              );
            }
          }

          return transformed;
        })

        .then((transformedResult) => {
          return def.output.parse(transformedResult, params);
        });

      break;
    default:
      PROMISE = PseudoPromise.resolve("adsf" as never);
      util.assertNever(def);
  }

  if ((PROMISE as any)._default === true) {
    throw new Error("Result is not materialized.");
  }

  if (ISSUES.length !== 0) {
    throw new ZodError(ISSUES);
  }
  const customChecks = def.checks || [];

  const checkCtx: RefinementCtx = {
    addIssue: (arg: MakeErrorData) => {
      ISSUES.push(makeError(params, data, arg));
    },
    path: params.path,
  };

  if (params.async === false) {
    const resolvedValue = PROMISE.getValueSync();

    if (resolvedValue === INVALID && ISSUES.length === 0) {
      ISSUES.push(
        makeError(params, data, {
          code: ZodIssueCode.custom,
          message: "Invalid",
        })
      );
    }

    if (ISSUES.length !== 0) {
      throw new ZodError(ISSUES);
    }

    for (const check of customChecks) {
      const checkResult = check.check(resolvedValue, checkCtx);

      if (checkResult instanceof Promise)
        throw new Error(
          "You can't use .parse on a schema containing async refinements. Use .parseAsync instead."
        );
    }
    if (ISSUES.length !== 0) {
      throw new ZodError(ISSUES);
    }

    return resolvedValue as any;
  } else {
    // if (params.async == true) {
    const checker = async () => {
      const resolvedValue = await PROMISE.getValueAsync();

      if (resolvedValue === INVALID && ISSUES.length === 0) {
        // let someError: boolean = false;
        ISSUES.push(
          makeError(params, data, {
            code: ZodIssueCode.custom,
            message: "Invalid",
          })
        );
      }

      if (ISSUES.length !== 0) {
        throw new ZodError(ISSUES);
      }

      if (params.runAsyncValidationsInSeries) {
        let someError = false;
        await customChecks.reduce((previousPromise, check) => {
          return previousPromise.then(async () => {
            if (!someError) {
              const len = ISSUES.length;
              await check.check(resolvedValue, checkCtx);
              if (len < ISSUES.length) someError = true;
            }
          });
        }, Promise.resolve());
      } else {
        await Promise.all(
          customChecks.map(async (check) => {
            await check.check(resolvedValue, checkCtx);
          })
        );
      }

      if (ISSUES.length !== 0) {
        throw new ZodError(ISSUES);
      }

      return resolvedValue;
    };

    return checker();
  }
};
