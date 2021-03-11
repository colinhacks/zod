import { defaultErrorMap, ZodErrorMap } from "./defaultErrorMap.ts";
import { getParsedType, ZodParsedType } from "./helpers/parseUtil.ts";
import { INVALID, util } from "./helpers/util.ts";
import { RefinementCtx, ZodType } from "./index.ts";
import { NOSET, PseudoPromise } from "./PseudoPromise.ts";
import { ZodDef } from "./ZodDef.ts";
import { MakeErrorData, ZodError, ZodIssueCode } from "./ZodError.ts";
import { ZodTypes } from "./ZodTypes.ts";

const addIssue = (
  params: Required<ParseParams>,
  data: any,
  errorData: MakeErrorData
) => {
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
  const issue = {
    ...errorData,
    path: [...params.path, ...(errorData.path || [])],
    message:
      errorData.message ||
      params.errorMap(errorArg, {
        ...ctxArg,
        defaultError: defaultError.message,
      }).message,
  };
  params.error.addIssue(issue);
  // return issue;
};

export type ParseParams = {
  seen?: {
    schema: ZodType<any>;
    objects: { input: any; error?: ZodError; output: any }[];
  }[];
  path?: (string | number)[];
  errorMap?: ZodErrorMap;
  error?: ZodError;
  async?: boolean;
  runAsyncValidationsInSeries?: boolean;
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

export const ZodParser = (schema: ZodType<any>) => (
  data: any,
  baseParams: ParseParams = { seen: [], errorMap: defaultErrorMap, path: [] }
): ZodParserReturnType<any> => {
  const params: Required<ParseParams> = {
    seen: baseParams.seen || [],
    path: baseParams.path || [],
    error: baseParams.error || new ZodError([]),
    errorMap: baseParams.errorMap || defaultErrorMap,
    async: baseParams.async ?? false,
    runAsyncValidationsInSeries:
      baseParams.runAsyncValidationsInSeries ?? false,
  };

  const def: ZodDef = schema._def as any;

  let PROMISE: PseudoPromise<any> = PseudoPromise.resolve(INVALID);
  (PROMISE as any)._default = true;

  // const RESULT: { input: any; output: any; error?: ZodError } = {
  //   input: data,
  //   output: INVALID,
  // };

  params.seen = params.seen || [];

  const ERROR = params.error;

  // const THROW = () => {
  // RESULT.error = ERROR;
  // throw ERROR;
  // };

  // const HANDLE = (err: Error) => {
  // if (err instanceof ZodError) {
  //   ERROR.addIssues(err.issues);
  // return INVALID;
  // }

  // throw ERROR;
  // };

  const parsedType = getParsedType(data);

  switch (def.t) {
    case ZodTypes.string:
      if (parsedType !== ZodParsedType.string) {
        // ERROR.addIssue(
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.string,
          received: parsedType,
        });
        // );

        // THROW();
        break;
      }
      PROMISE = PseudoPromise.resolve(data);

      break;
    case ZodTypes.number:
      if (parsedType !== ZodParsedType.number) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.number,
          received: parsedType,
        });

        break; // THROW();
      }
      if (Number.isNaN(data)) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.number,
          received: ZodParsedType.nan,
        });

        break; // THROW();
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.bigint:
      if (parsedType !== ZodParsedType.bigint) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: parsedType,
        });

        break; //  THROW();
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.boolean:
      if (parsedType !== ZodParsedType.boolean) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.boolean,
          received: parsedType,
        });

        break; // THROW();
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.undefined:
      if (parsedType !== ZodParsedType.undefined) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.undefined,
          received: parsedType,
        });

        break; // THROW();
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.null:
      if (parsedType !== ZodParsedType.null) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.null,
          received: parsedType,
        });

        break; // THROW();
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
      addIssue(params, data, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.never,
        received: parsedType,
      });

      PROMISE = PseudoPromise.resolve(INVALID);
      break;
    case ZodTypes.void:
      if (
        parsedType !== ZodParsedType.undefined &&
        parsedType !== ZodParsedType.null
      ) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.void,
          received: parsedType,
        });

        break; //  THROW();
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.array:
      // RESULT.output = [];

      if (parsedType !== ZodParsedType.array) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: parsedType,
        });

        break; //  THROW();
      }
      // const data: any[] = data;
      if (def.nonempty === true && data.length === 0) {
        addIssue(params, data, {
          code: ZodIssueCode.nonempty_array_is_empty,
        });

        break; //  THROW();
      }

      PROMISE = PseudoPromise.all(
        (data as any[]).map((item, i) => {
          return new PseudoPromise().then(() =>
            def.type._parseWithInvalidFallback(item, {
              ...params,
              path: [...params.path, i],
            })
          );
          // .catch((err) => {
          //   if (!(err instanceof ZodError)) {
          //     throw err;
          //   }
          // ERROR.addIssues(err.issues);
          //   return INVALID;
          // });
        })
      );

      break;
    case ZodTypes.map:
      if (parsedType !== ZodParsedType.map) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.map,
          received: parsedType,
        });

        break;
      }

      const dataMap: Map<unknown, unknown> = data;
      const returnedMap = new Map();

      PROMISE = PseudoPromise.all(
        [...dataMap.entries()].map(([key, value], index) => {
          return PseudoPromise.all([
            new PseudoPromise().then(() => {
              return def.keyType._parseWithInvalidFallback(key, {
                ...params,
                path: [...params.path, index, "key"],
              });
            }),
            // .catch(HANDLE),
            new PseudoPromise().then(() => {
              const mapValue = def.valueType._parseWithInvalidFallback(value, {
                ...params,
                path: [...params.path, index, "value"],
              });

              return mapValue;
            }),
            // .catch(HANDLE),
          ]).then((item: any) => {
            returnedMap.set(item[0], item[1]);
          });
          // .catch(HANDLE);
        })
      )
        // .then(() => {
        //   if (!ERROR.isEmpty) {
        //     throw ERROR;
        //   }
        // })
        .then(() => {
          return returnedMap;
        });

      break;
    case ZodTypes.set:
      if (parsedType !== ZodParsedType.set) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.set,
          received: parsedType,
        });

        // THROW();
        break;
      }

      const dataSet: Set<unknown> = data;
      const returnedSet = new Set();

      PROMISE = PseudoPromise.all(
        [...dataSet.values()].map((item, i) => {
          return (
            new PseudoPromise()
              .then(() =>
                def.valueType._parseWithInvalidFallback(item, {
                  ...params,
                  path: [...params.path, i],
                })
              )
              // .catch((err) => {
              //   if (!(err instanceof ZodError)) {
              //     throw err;
              //   }
              //   ERROR.addIssues(err.issues);
              //   return INVALID;
              // })
              .then((item) => {
                returnedSet.add(item);
              })
          );
        })
      ).then(() => {
        return returnedSet;
      });
      break;
    case ZodTypes.object:
      // RESULT.output = {};
      //
      if (parsedType !== ZodParsedType.object) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: parsedType,
        });

        break;
        // THROW();
      }

      const objectPromises: { [k: string]: PseudoPromise<any> } = {};

      const shape = def.shape();
      const shapeKeys = Object.keys(shape);
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

        // if value for key is not set
        // and schema is optional
        // don't add the
        // first check is required to avoid non-enumerable keys
        if (typeof data[key] === "undefined" && !dataKeys.includes(key)) {
          objectPromises[key] = new PseudoPromise()
            .then(() => {
              return keyValidator._parseWithInvalidFallback(undefined, {
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
            });
          // .catch((err) => {
          //   if (err instanceof ZodError) {
          //     const zerr: ZodError = err;
          //     ERROR.addIssues(zerr.issues);
          //     objectPromises[key] = PseudoPromise.resolve(INVALID);
          //   } else {
          //     throw err;
          //   }
          // });

          continue;
        }

        objectPromises[key] = new PseudoPromise().then(() => {
          return keyValidator._parseWithInvalidFallback(data[key], {
            ...params,
            path: [...params.path, key],
          });
        });
        // .catch((err) => {
        //   if (err instanceof ZodError) {
        //     const zerr: ZodError = err;
        //     ERROR.addIssues(zerr.issues);
        //     return INVALID;
        //   } else {
        //     throw err;
        //   }
        // });
      }

      if (def.catchall._def.t === ZodTypes.never) {
        if (def.unknownKeys === "passthrough") {
          for (const key of extraKeys) {
            objectPromises[key] = PseudoPromise.resolve(data[key]);
          }
        } else if (def.unknownKeys === "strict") {
          if (extraKeys.length > 0) {
            addIssue(params, data, {
              code: ZodIssueCode.unrecognized_keys,
              keys: extraKeys,
            });
          }
        } else if (def.unknownKeys === "strip") {
          // do nothing
        } else {
          util.assertNever(def.unknownKeys);
        }
      } else {
        // run catchall validation
        for (const key of extraKeys) {
          objectPromises[key] = new PseudoPromise().then(() => {
            const parsedValue = def.catchall._parseWithInvalidFallback(
              data[key],
              {
                ...params,
                path: [...params.path, key],
              }
            );
            return parsedValue;
          });
          // .catch((err) => {
          //   if (err instanceof ZodError) {
          //     ERROR.addIssues(err.issues);
          //   } else {
          //     throw err;
          //   }
          // });
        }
      }

      PROMISE = PseudoPromise.object(objectPromises);
      // .then((resolvedObject) => {
      //   Object.assign(RESULT.output, resolvedObject);
      //   return RESULT.output;
      // })
      // .then((finalObject) => {
      //   if (ERROR.issues.length > 0) {
      //     return INVALID;
      //   }
      //   return finalObject;
      // })
      // .catch((err) => {
      //   if (err instanceof ZodError) {
      //     ERROR.addIssues(err.issues);
      //     return INVALID;
      //   }
      //   throw err;
      // });

      break;
    case ZodTypes.union:
      // let isValid = false;
      const unionErrors: ZodError[] = [...Array(def.options.length)].map(
        () => new ZodError([])
      );

      PROMISE = PseudoPromise.all(
        def.options.map((opt, _j) => {
          // return new PseudoPromise().then
          return new PseudoPromise().then(() => {
            return opt._parseWithInvalidFallback(data, {
              ...params,
              error: unionErrors[_j],
            });
          });
          // .then((optionData) => {
          //   if (unionErrors[_j].isEmpty) isValid = true;
          //   return optionData;
          // })
          // .catch((err) => {
          //   if (err instanceof ZodError) {
          //     unionErrors.push(err);
          //     return INVALID;
          //   }
          //   throw err;
          // });
        })
      )
        .then((unionResults) => {
          const isValid = !!unionErrors.find((err) => err.isEmpty);
          const guessing = false;
          // if (!isValid) {
          // }

          if (!isValid) {
            if (!guessing) {
              addIssue(params, data, {
                code: ZodIssueCode.invalid_union,
                unionErrors,
              });
            } else {
              const nonTypeErrors = unionErrors.filter((err) => {
                return err.issues[0].code !== "invalid_type";
              });
              if (nonTypeErrors.length === 1) {
                ERROR.addIssues(nonTypeErrors[0].issues);
              } else {
                addIssue(params, data, {
                  code: ZodIssueCode.invalid_union,
                  unionErrors,
                });
              }
            }
          }

          return unionResults;
        })
        .then((unionResults: any[]) => {
          const validIndex = unionErrors.indexOf(
            unionErrors.find((err) => err.isEmpty)!
          );
          return unionResults[validIndex];
          // return  util.find(unionResults, (val: any) => val !== INVALID);
        });

      break;
    case ZodTypes.intersection:
      PROMISE = PseudoPromise.all([
        new PseudoPromise().then(() => {
          return def.left._parseWithInvalidFallback(data, params);
        }),
        // .catch(HANDLE)
        new PseudoPromise().then(() => {
          return def.right._parseWithInvalidFallback(data, params);
        }),
        // .catch(HANDLE),
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
          addIssue(params, data, {
            code: ZodIssueCode.invalid_intersection_types,
          });
        }
      });

      break;

    case ZodTypes.optional:
      if (parsedType === ZodParsedType.undefined) {
        PROMISE = PseudoPromise.resolve(undefined);
        break;
      }

      PROMISE = new PseudoPromise().then(() => {
        return def.innerType._parseWithInvalidFallback(data, params);
      });
      // .catch(HANDLE);
      break;
    case ZodTypes.nullable:
      if (parsedType === ZodParsedType.null) {
        PROMISE = PseudoPromise.resolve(null);
        break;
      }

      PROMISE = new PseudoPromise().then(() => {
        return def.innerType._parseWithInvalidFallback(data, params);
      });
      // .catch(HANDLE);
      break;
    case ZodTypes.tuple:
      if (parsedType !== ZodParsedType.array) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: parsedType,
        });

        break;
      }

      if (data.length > def.items.length) {
        addIssue(params, data, {
          code: ZodIssueCode.too_big,
          maximum: def.items.length,
          inclusive: true,
          type: "array",
        });
      } else if (data.length < def.items.length) {
        addIssue(params, data, {
          code: ZodIssueCode.too_small,
          minimum: def.items.length,
          inclusive: true,
          type: "array",
        });
      }

      const tupleData: any[] = data;

      PROMISE = PseudoPromise.all(
        tupleData.map((item, index) => {
          const itemParser = def.items[index];
          return new PseudoPromise()
            .then(() => {
              return itemParser._parseWithInvalidFallback(item, {
                ...params,
                path: [...params.path, index],
              });
              // return tupleDatum;
            })
            .then((tupleItem) => {
              return tupleItem;
            });
        })
      ).then((tupleData) => {
        // if (!ERROR.isEmpty) THROW();

        return tupleData;
      });
      // .catch((err) => {
      //   throw err;
      // });

      break;
    case ZodTypes.lazy:
      const lazySchema = def.getter();
      PROMISE = PseudoPromise.resolve(
        lazySchema._parseWithInvalidFallback(data, params)
      );
      break;
    case ZodTypes.literal:
      if (data !== def.value) {
        addIssue(params, data, {
          // code: ZodIssueCode.invalid_literal_value,
          code: ZodIssueCode.invalid_type,
          expected: def.value,
          received: data,
        });
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.enum:
      if (def.values.indexOf(data) === -1) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_enum_value,
          options: def.values,
        });
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.nativeEnum:
      const nativeEnumValues = util.getValidEnumValues(def.values);
      if (nativeEnumValues.indexOf(data) === -1) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_enum_value,
          options: util.objectValues(nativeEnumValues),
        });
      }
      PROMISE = PseudoPromise.resolve(data);
      break;
    case ZodTypes.function:
      if (parsedType !== ZodParsedType.function) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.function,
          received: parsedType,
        });

        // THROW();
        break;
      }

      const isAsyncFunction = def.returns._def.t === ZodTypes.promise;

      const validatedFunction = (...args: any[]) => {
        const argsError = new ZodError([]);
        const returnsError = new ZodError([]);
        const internalProm = new PseudoPromise()
          .then(() => {
            return def.args._parseWithInvalidFallback(args as any, {
              ...params,
              error: argsError,
              async: isAsyncFunction,
            });
          })
          // .catch((err) => {
          //   if (!(err instanceof ZodError)) throw err;
          //   const argsError = new ZodError([]);
          //   argsError.addIssue(
          //     addIssue(params, data, {
          //       code: ZodIssueCode.invalid_arguments,
          //       argumentsError: err,
          //     })
          //   );
          //   throw argsError;
          // })
          .then((args) => {
            if (!argsError.isEmpty) {
              const newError = new ZodError([]);

              addIssue(params, data, {
                code: ZodIssueCode.invalid_arguments,
                argumentsError: argsError,
              });

              throw newError;
            }

            return args;
          })
          .then((args) => {
            return data(...(args as any));
          })
          .then((result) => {
            return def.returns._parseWithInvalidFallback(result, {
              ...params,
              error: returnsError,
              async: isAsyncFunction,
            });
          })
          // .catch((err) => {
          //   if (err instanceof ZodError) {
          //     const returnsError = new ZodError([]);
          //     returnsError.addIssue(
          //       addIssue(params, data, {
          //         code: ZodIssueCode.invalid_return_type,
          //         returnTypeError: err,
          //       })
          //     );
          //     throw returnsError;
          //   }
          //   throw err;
          // });
          .then((result) => {
            if (!returnsError.isEmpty) {
              const newError = new ZodError([]);

              addIssue({ ...params, error: newError }, data, {
                code: ZodIssueCode.invalid_return_type,
                returnTypeError: returnsError,
              });

              throw newError;
            }
            return result;
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
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: parsedType,
        });

        break; // THROW();
      }

      const parsedRecordPromises: { [k: string]: PseudoPromise<any> } = {};
      for (const key in data) {
        parsedRecordPromises[key] = new PseudoPromise().then(() => {
          return def.valueType._parseWithInvalidFallback(data[key], {
            ...params,
            path: [...params.path, key],
          });
        });
        // .catch(HANDLE);
      }
      PROMISE = PseudoPromise.object(parsedRecordPromises);

      break;
    case ZodTypes.date:
      if (!(data instanceof Date)) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.date,
          received: parsedType,
        });

        break; // THROW();
      }
      if (isNaN(data.getTime())) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_date,
        });

        break; // THROW();
      }
      PROMISE = PseudoPromise.resolve(data);
      break;

    case ZodTypes.promise:
      if (parsedType !== ZodParsedType.promise && params.async === false) {
        addIssue(params, data, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.promise,
          received: parsedType,
        });

        break; // THROW();
      }

      const promisified =
        parsedType === ZodParsedType.promise ? data : Promise.resolve(data);

      const promiseError = new ZodError([]);
      PROMISE = PseudoPromise.resolve(
        promisified
          .then((data: any) => {
            return def.type._parseWithInvalidFallback(data, {
              ...params,
              error: promiseError,
            });
          })
          .then((data: any) => {
            if (!promiseError.isEmpty) {
              throw promiseError;
            }
            return data;
          })
      );
      // .then((resolvedData: any) => {
      //   //
      //
      //
      //   if (!promiseError.isEmpty) {
      //     ERROR.addIssues(promiseError.issues);
      //   }
      //   return resolvedData;
      // });
      // .then((value: any) => {
      //   if (!promiseError.isEmpty) {
      //     // throw promiseError;
      //     ERROR.addIssues(promiseError.issues);
      //   }
      //
      //   return value;
      // });

      break;

    case ZodTypes.transformer:
      PROMISE = new PseudoPromise().then(() => {
        return def.schema._parseWithInvalidFallback(data, params);
      });
      break;
    default:
      PROMISE = PseudoPromise.resolve("adsf" as never);
      util.assertNever(def);
  }

  // if (!ERROR.isEmpty) {
  //   // THROW();
  //
  //   return { success: false, error: ERROR };
  // }

  // if ((PROMISE as any)._default === true) {
  //
  //   throw new Error("Result is not materialized.");
  // }

  const effects = def.effects || [];

  const checkCtx: RefinementCtx = {
    addIssue: (arg: MakeErrorData) => {
      addIssue(params, data, arg);
    },
    path: params.path,
  };

  // const isSync = !params.async;

  const isSync = params.async === false || def.t === ZodTypes.promise;

  if (isSync) {
    const resolvedValue = PROMISE.getValueSync();

    if (resolvedValue === INVALID && ERROR.isEmpty) {
      throw new Error(
        "Value is INVALID. This should never happen and means there is an error within Zod. Please file an issue at https://github.com/colinhacks/zod."
      );
    }

    if (!ERROR.isEmpty) {
      // THROW();
      return { success: false, error: ERROR };
      // throw ERROR;
    }

    let finalValue = resolvedValue;

    for (const effect of effects) {
      //
      //
      if (effect.type === "check") {
        const checkResult = effect.check(finalValue, checkCtx);
        //
        if (checkResult instanceof Promise)
          throw new Error(
            "You can't use .parse() on a schema containing async refinements. Use .parseAsync instead."
          );
      } else if (effect.type === "mod") {
        if (def.t !== ZodTypes.transformer)
          throw new Error("Only Modders can contain mods");
        finalValue = effect.mod(finalValue);
        if (finalValue instanceof Promise) {
          throw new Error(
            `You can't use .parse() on a schema containing async transformations. Use .parseAsync instead.`
          );
        }
      } else {
        throw new Error(`Invalid effect type.`);
      }
    }

    if (!ERROR.isEmpty) {
      // THROW();
      // throw ERROR;
      return { success: false, error: ERROR };
    }

    return { success: true, data: finalValue };
  } else {
    // if (params.async == true) {
    const checker = async () => {
      const resolvedValue = await PROMISE.getValueAsync();

      if (resolvedValue === INVALID && ERROR.isEmpty) {
        // let someError: boolean = false;

        addIssue(params, data, {
          code: ZodIssueCode.custom,
          message: "Invalid",
        });
      }

      if (!ERROR.isEmpty) {
        // THROW();
        return { success: false, error: ERROR };
      }

      let finalValue = resolvedValue;

      for (const effect of effects) {
        if (effect.type === "check") {
          await effect.check(finalValue, checkCtx);
        } else if (effect.type === "mod") {
          if (def.t !== ZodTypes.transformer)
            throw new Error("Only Modders can contain mods");
          finalValue = await effect.mod(finalValue);
        }
      }

      // if (params.runAsyncValidationsInSeries) {
      //   let someError = false;
      //   await customChecks.reduce((previousPromise, check) => {
      //     return previousPromise.then(async () => {
      //       if (!someError) {
      //         const len = ERROR.issues.length;
      //         await check.check(resolvedValue, checkCtx);
      //         if (len < ERROR.issues.length) someError = true;
      //       }
      //     });
      //   }, Promise.resolve());
      // } else {
      //   await Promise.all(
      //     customChecks.map(async (check) => {
      //       await check.check(resolvedValue, checkCtx);
      //     })
      //   );
      // }

      if (!ERROR.isEmpty) {
        // THROW();
        return { success: false, error: ERROR };
      }

      return { success: true, data: finalValue };
    };

    return checker() as any;
  }
};
