import * as z from './types/base';
import { ZodDef } from '.';
import { ZodError, ZodErrorCode, ZodSuberror, ZodSuberrorOptionalMessage } from './ZodError';
import { util } from './helpers/util';
import { ZodErrorMap, defaultErrorMap } from './defaultErrorMap';
import { PseudoPromise } from './PseudoPromise';

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
  console.log('PARSE');

  const params: Required<ParseParams> = {
    seen: baseParams.seen || [],
    path: baseParams.path || [],
    errorMap: baseParams.errorMap || defaultErrorMap,
    async: baseParams.async || false,
  };

  console.log(JSON.stringify(params, null, 2));

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
      return PseudoPromise.resolve(data);
    } else {
      schemaSeen.objects.push(data);
    }
  } else {
    params.seen.push({ schema: schemaDef, objects: [data] });
  }
  // }

  const error = new ZodError([]);
  // const defaultReturnValue = Symbol('return_value');
  let returnValue: PseudoPromise<any>; // = defaultReturnValue;
  const parsedType = getParsedType(data);

  switch (def.t) {
    case z.ZodTypes.string:
      console.log(`ZodTypes.string`);
      if (parsedType !== ZodParsedType.string) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.string, received: parsedType }),
        );
        throw error;
      }
      returnValue = PseudoPromise.resolve(data);

      break;
    case z.ZodTypes.number:
      console.log(`ZodTypes.number`);
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
      returnValue = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.bigint:
      console.log(`ZodTypes.bigint`);
      if (parsedType !== ZodParsedType.bigint) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.number, received: parsedType }),
        );
        throw error;
      }
      returnValue = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.boolean:
      console.log(`ZodTypes.boolean`);
      if (parsedType !== ZodParsedType.boolean) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.boolean, received: parsedType }),
        );
        throw error;
      }
      returnValue = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.undefined:
      console.log(`ZodTypes.undefined`);
      if (parsedType !== ZodParsedType.undefined) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.undefined, received: parsedType }),
        );
        throw error;
      }
      returnValue = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.null:
      console.log(`ZodTypes.null`);
      if (parsedType !== ZodParsedType.null) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.null, received: parsedType }),
        );
        throw error;
      }
      returnValue = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.any:
      console.log(`ZodTypes.any`);
      returnValue = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.unknown:
      console.log(`ZodTypes.unknown`);
      returnValue = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.void:
      console.log(`ZodTypes.void`);
      if (parsedType !== ZodParsedType.undefined && parsedType !== ZodParsedType.null) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.void, received: parsedType }),
        );
        throw error;
      }
      returnValue = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.array:
      console.log(`ZodTypes.array`);
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
      // returnValue = (data as any[]).map((item, i) => {
      //   try {
      //     return def.type.parse(item, { ...params, path: [...params.path, i] });
      //   } catch (err) {
      //     const zerr: ZodError = err;
      //     error.addErrors(zerr.errors);
      //   }
      // });
      returnValue = PseudoPromise.resolve(
        (data as any[]).map((item, i) => {
          try {
            return def.type.parse(item, { ...params, path: [...params.path, i] });
          } catch (err) {
            const zerr: ZodError = err;
            error.addErrors(zerr.errors);
          }
        }),
      );
      // if (!error.isEmpty) {
      //   throw error;
      // }
      break;
    case z.ZodTypes.object:
      console.log(`ZodTypes.object`);
      if (parsedType !== ZodParsedType.object) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.object, received: parsedType }),
        );
        throw error;
      }

      const objectPromises: { [k: string]: PseudoPromise<any> } = {};

      const shape = def.shape();
      const shapeKeys = Object.keys(shape);
      const dataKeys = Object.keys(data);
      const extraKeys = dataKeys.filter(k => shapeKeys.indexOf(k) === -1);

      if (extraKeys.length) {
        if (def.params.strict) {
          error.addError(makeError({ code: ZodErrorCode.unrecognized_keys, keys: extraKeys }));
        } else {
          for (const key of extraKeys) {
            objectPromises[key] = PseudoPromise.resolve(data[key]);
          }
        }
      }

      for (const key in shape) {
        objectPromises[key] = new PseudoPromise().then(() => {
          try {
            return def.shape()[key].parse(data[key], { ...params, path: [...params.path, key] });
          } catch (err) {
            const zerr: ZodError = err;
            error.addErrors(zerr.errors);
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
      returnValue = PseudoPromise.object(objectPromises);

      break;
    case z.ZodTypes.union:
      console.log(`ZodTypes.union`);
      // let parsedUnion: any;
      let isValid = false;
      const unionErrors: ZodError[] = [];
      const invalidDataSymbol = Symbol('invalid_data');
      returnValue = new PseudoPromise()
        .then(() => {
          try {
            isValid = true;
            return PseudoPromise.resolve(def.options.map(opt => opt.parse(data, params)) as any[]);
          } catch (err) {
            unionErrors.push(err);
            return invalidDataSymbol as never;
          }
        })
        .then((_unionResults: any) => {
          const unionResults: any[] = _unionResults;
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
          return unionResults;
        })
        .then(unionResults => (unionResults as any).find((res: any) => res !== invalidDataSymbol));
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
      // returnValue = parsedUnion;
      break;
    case z.ZodTypes.intersection:
      console.log(`ZodTypes.intersection`);
      // let parsedIntersection:any;
      // let parsedLeft: any;
      // let parsedRight: any;
      // returnValue = PseudoPromise.resolve(data);
      returnValue = PseudoPromise.all([
        new PseudoPromise().then(() => {
          try {
            return def.left.parse(data, params);
          } catch (err) {
            error.addErrors(err.errors);
            return Symbol('invalid_data');
          }
        }),
        new PseudoPromise().then(() => {
          try {
            return def.right.parse(data, params);
          } catch (err) {
            error.addErrors(err.errors);
            return Symbol('invalid_data');
          }
        }),
      ]).then(([parsedLeft, parsedRight]: any) => {
        const parsedLeftType = getParsedType(parsedLeft);
        const parsedRightType = getParsedType(parsedRight);

        if (parsedLeft === parsedRight) {
          return parsedLeft;
        } else if (parsedLeftType === ZodParsedType.object && parsedRightType === ZodParsedType.object) {
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
      console.log(`ZodTypes.tuple`);
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
      // const parsedTuple: any = [];
      // const tuplePromises: PseudoPromise[] = [];

      returnValue = PseudoPromise.all(
        tupleData.map((item, index) => {
          const itemParser = def.items[index];
          return new PseudoPromise().then(() => {
            try {
              return itemParser.parse(item, { ...params, path: [...params.path, index] });
            } catch (err) {
              error.addErrors(err.errors);
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
      // returnValue = parsedTuple;
      break;
    case z.ZodTypes.lazy:
      console.log(`ZodTypes.lazy`);
      const lazySchema = def.getter();
      returnValue = lazySchema.parse(data, params);
      break;
    case z.ZodTypes.literal:
      console.log(`ZodTypes.literal`);
      if (data !== def.value) {
        error.addError(makeError({ code: ZodErrorCode.invalid_literal_value, expected: def.value }));
      }
      returnValue = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.enum:
      console.log(`ZodTypes.enum`);
      if (def.values.indexOf(data) === -1) {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_enum_value,
            options: def.values,
          }),
        );
      }
      returnValue = PseudoPromise.resolve(data);
      break;
    case z.ZodTypes.function:
      console.log(`ZodTypes.function`);
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
      returnValue = PseudoPromise.resolve(validatedFunc);
      // return validatedFunc;
      break;
    case z.ZodTypes.record:
      console.log(`ZodTypes.record`);
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
      const parsedRecordPromises: any = {};
      for (const key in data) {
        parsedRecordPromises[key] = new PseudoPromise().then(() => {
          try {
            return def.valueType.parse(data[key], { ...params, path: [...params.path, key] });
          } catch (err) {
            error.addErrors(err.errors);
          }
        });
      }
      returnValue = PseudoPromise.object(parsedRecordPromises);
      // returnValue = parsedRecord;
      break;
    case z.ZodTypes.date:
      console.log(`ZodTypes.date`);
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
      returnValue = PseudoPromise.resolve(data);
      break;

    case z.ZodTypes.promise:
      console.log(`ZodTypes.promise`);
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
      returnValue = PseudoPromise.resolve(
        new Promise(async (res, rej) => {
          const dataValue = await data;
          try {
            const parsed = def.type.parse(dataValue, params);
            res(parsed);
          } catch (err) {
            rej(err);
          }
        }),
      );
      break;
    case z.ZodTypes.transformer:
      console.log(`ZodTypes.transformer`);
      returnValue = new PseudoPromise().then(() => {
        try {
          const inputParseResult = def.input.parse(data, params);
          const transformedResult = def.transformer(inputParseResult);
          return def.output.parse(transformedResult, params);
        } catch (err) {
          if (err instanceof ZodError) {
            error.addErrors(err.errors);
          }
          throw err;
        }
      });
      break;
    default:
      returnValue = PseudoPromise.resolve('adsf' as never);
      util.assertNever(def);
  }

  const customChecks = def.checks || [];
  if (params.async === true) {
    // const checker = async () => {
    //   await Promise.all(
    //     customChecks.map(async check => {
    //       const checkResult = await check.check(await returnValue.toPromise());
    //       console.log(`check!`);
    //       console.log(checkResult);
    //       if (!checkResult) {
    //         const { check: checkMethod, ...noMethodCheck } = check;
    //         console.log('adding error');
    //         error.addError(makeError(noMethodCheck));
    //       } else {
    //         // console.log(checkResult);
    //       }
    //     }),
    //   );

    //   if (!error.isEmpty) {
    //     console.log('error not empty');
    //     console.log(error);
    //     throw error;
    //   }
    //   // console.log('resolvedValue');
    //   console.log(await returnValue.toPromise());
    //   return await returnValue.toPromise();
    // };
    // checker;
    // return Promise.resolve({ test: 1234 });
    console.log(`isPP? ${returnValue instanceof PseudoPromise}`);
    return returnValue.toValue();
    // const resolvedValue = returnValue.toPromise();
    // const asyncChecks = customChecks.map(async check => {
    //   const checkResult = await check.check(await returnValue.toPromise());
    //   if (!checkResult) {
    //     const { check: checkMethod, ...noMethodCheck } = check;
    //     error.addError(makeError(noMethodCheck));
    //   }
    // });
    // return Promise.all(asyncChecks).then(() => {
    //   if (!error.isEmpty) {
    //     console.log('error not empty');
    //     console.log(error);
    //     throw error;
    //   }
    //   // console.log('resolvedValue');
    //   return returnValue.toPromise();
    // });
    // return new Promise((res, rej) => {
    //   return Promise.all(asyncChecks).then(() => {
    //     if (!error.isEmpty) {
    //       return rej(error);
    //     }

    //     return res(returnValue);
    //   });
    // });
  } else {
    // console.log(def.t);
    // console.log(returnValue);

    const resolvedValue = returnValue.toValue();

    if (resolvedValue instanceof Promise && def.t === z.ZodTypes.promise) {
      throw new Error("You can't use .parse on a schema containing async refinements. Use .parseAsync instead.");
    }

    for (const check of customChecks) {
      console.log(`VALUE`);
      console.log(resolvedValue);
      const checkResult = check.check(resolvedValue);
      if (checkResult instanceof Promise)
        throw new Error("You can't use .parse on a schema containing async refinements. Use .parseAsync instead.");
      if (!checkResult) {
        const { check: checkMethod, ...noMethodCheck } = check;
        error.addError(makeError(noMethodCheck));
      }
    }
    if (!error.isEmpty) {
      throw error;
    }
    console.log(resolvedValue);
    return resolvedValue as any;
  }
};
