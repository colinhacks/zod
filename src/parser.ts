import * as z from './types/base';
import { ZodDef } from '.';
import { ZodError, ZodErrorCode, ZodSuberror, ZodSuberrorOptionalMessage } from './ZodError';
import { util } from './helpers/util';
import { ZodErrorMap, defaultErrorMap } from './defaultErrorMap';

export type ParseParams = {
  seen?: { schema: any; objects: any[] }[];
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
  if (data === null) return 'null';
  if (typeof data === 'undefined') return 'undefined';
  if (typeof data === 'object') {
    if (Array.isArray(data)) return 'array';
    if (
      data.then &&
      typeof data.then === 'function' &&
      data.catch &&
      typeof data.catch === 'function'
      // && util.getObjectType(data) !== 'Promise'
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

// export const ParsedType = arrayToEnum(ParsedTypeArray);
export type ZodParsedType = keyof typeof ZodParsedType;

type StripErrorKeys<T extends object> = T extends any ? util.OmitKeys<T, 'path'> : never;
export type MakeErrorData = StripErrorKeys<ZodSuberrorOptionalMessage> & { path?: (string | number)[] };

export const ZodParser = (schemaDef: z.ZodTypeDef) => (
  obj: any,
  baseParams: ParseParams = { seen: [], errorMap: defaultErrorMap, path: [] },
) => {
  const params: Required<ParseParams> = {
    seen: baseParams.seen || [],
    path: baseParams.path || [],
    errorMap: baseParams.errorMap || defaultErrorMap,
    // (...args: [any, any]) => {
    //   const customMap = baseParams.errorMap || function() {};
    //   return customMap(...args) || defaultErrorMap(...args);
    // if(baseParams.errorMap){
    //   const customErrorMsg = baseParams.errorMap(...args);
    //   if(customErrorMsg) return
    //   if(baseParams.errorMap(..args))
    // }
    // return defaultErrorMap(...args);
    // return baseParams.errorMap || defaultErrorMap,
    // },
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
  // const { seen } = params;
  // const y:ZodObject<any> = "asdf" as any;

  // console.log(`visit ${schemaDef.t}: ${typeof obj} - ${obj.name || ''}`);
  // if (!['number', 'string', 'boolean', 'undefined'].includes(typeof obj)) {

  const schemaSeen = params.seen.find(x => x.schema === schemaDef);
  if (schemaSeen) {
    if (schemaSeen.objects.indexOf(obj) !== -1) {
      // console.log(`seen ${typeof obj} before: ${obj.name}`);
      return obj;
    } else {
      schemaSeen.objects.push(obj);
    }
  } else {
    params.seen.push({ schema: schemaDef, objects: [obj] });
  }
  // }

  const error = new ZodError([]);

  const parsedType = getParsedType(obj);

  // runs all invalid_type checks
  // if (Object.keys(ParsedType).includes(def.t)) {
  //   if (parsedType !== def.t) {
  //     console.log(`def.t: ${def.t}`);
  //     console.log(`found: ${parsedType}`);
  //     error.addError(
  //       makeError({ code: ZodErrorCode.invalid_type, expected: def.t as ParsedType, received: parsedType }),
  //     );
  //     throw error;
  //   }
  // }

  switch (def.t) {
    case z.ZodTypes.string:
      // error.addError()
      if (parsedType !== ZodParsedType.string) {
        //throw ZodError.fromString(`Non-string type: ${typeof obj}`);
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.string, received: parsedType }),
        );
        throw error;
      }
      // return obj as any;
      break;
    case z.ZodTypes.number:
      if (parsedType !== ZodParsedType.number) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.number, received: parsedType }),
        );
        throw error;
      }
      if (Number.isNaN(obj)) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.number, received: ZodParsedType.nan }),
        );
        throw error;
      }
      // return obj as any;
      break;
    case z.ZodTypes.bigint:
      if (parsedType !== ZodParsedType.bigint) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.number, received: parsedType }),
        );
        throw error;
        // throw ZodError.fromString(`Non-bigint type: ${typeof obj}.`);
      }
      // return obj;
      break;
    case z.ZodTypes.boolean:
      if (parsedType !== ZodParsedType.boolean) {
        // throw ZodError.fromString(`Non-boolean type: ${typeof obj}`);
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.boolean, received: parsedType }),
        );
        throw error;
      }
      // return obj as any;
      break;
    case z.ZodTypes.undefined:
      if (parsedType !== ZodParsedType.undefined) {
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.undefined, received: parsedType }),
        );
        throw error;
        // throw ZodError.fromString(`Non-undefined type:Found: ${typeof obj}`);
      }
      // return undefined;
      break;
    case z.ZodTypes.null:
      if (parsedType !== ZodParsedType.null) {
        // throw ZodError.fromString(`Non-null type: ${typeof obj}`);
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
        // throw ZodError.fromString(`Non-array type: ${typeof obj}`);
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.array, received: parsedType }),
        );
        throw error;
      }
      const data: any[] = obj;
      // const arrayError = ZodError.create([]);
      if (def.nonempty === true && obj.length === 0) {
        error.addError(makeError({ code: ZodErrorCode.nonempty_array_is_empty }));
        throw error;
        // throw ZodError.fromString('Array cannot be empty');
      }
      data.map((item, i) => {
        try {
          const parsedItem = def.type.parse(item, { ...params, path: [...params.path, i] });
          return parsedItem;
        } catch (err) {
          const zerr: ZodError = err;
          error.addErrors(zerr.errors);
          // arrayError.mergeChild(i, err);
        }
      });
      if (!error.isEmpty) {
        // throw ZodError.fromString(arrayErrors.join('\n\n'));
        throw error;
      }
      break;
    // return parsedArray as any;
    case z.ZodTypes.object:
      if (parsedType !== ZodParsedType.object) {
        // throw ZodError.fromString(`Non-object type: ${typeof obj}`);
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.object, received: parsedType }),
        );
        throw error;
      }

      const shape = def.shape();
      if (def.params.strict) {
        const shapeKeys = Object.keys(shape);
        const objKeys = Object.keys(obj);
        const extraKeys = objKeys.filter(k => shapeKeys.indexOf(k) === -1);

        if (extraKeys.length) {
          // console.log(def);
          error.addError(makeError({ code: ZodErrorCode.unrecognized_keys, keys: extraKeys }));
          // throw error;
          // throw ZodError.fromString(`Unexpected key(s) in object: ${extraKeys.map(k => `'${k}'`).join(', ')}`);
        }
      }

      // const parsedObject: any = {};
      // const objectError = ZodError.create([]);
      for (const key in shape) {
        try {
          // const parsedEntry =
          def.shape()[key].parse(obj[key], { ...params, path: [...params.path, key] });
          // parsedObject[key] = parsedEntry;
        } catch (err) {
          const zerr: ZodError = err;
          error.addErrors(zerr.errors);
          // objectError.mergeChild(key, err);
        }
      }

      // if (!objectError.isEmpty) {
      //   throw objectError; //ZodError.fromString(objectErrors.join('\n'));
      // }
      // return parsedObject;
      break;
    case z.ZodTypes.union:
      let isValid = false;
      // const unionErrors: string[] = [];
      // unionError.addError('union', 'Error parsing union type.');
      const unionErrors: ZodError[] = [];
      for (const option of def.options) {
        try {
          option.parse(obj, params);
          isValid = true;
        } catch (err) {
          unionErrors.push(err);
          // unionErrors.push(`\tunion option #${def.options.indexOf(option)}: ${err.message}`);

          // isValid = false;
        }
      }

      // if all but one of the union types threw a type error
      // merge in the one non-type-error ZodError the usual way
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
      // if (!isValid) {
      // throw ZodError.fromString('\n' + unionErrors.join('\n'));
      // throw ZodError.fromString(
      //   `Error parsing union.\nReceived: ${JSON.stringify(obj, null, 2)}\nExpected: ${def.options
      //     .map(x => x._def.t)
      //     .join(' OR ')}`,
      // );
      // }
      break;
    case z.ZodTypes.intersection:
      // const errors: string[] = [];
      try {
        def.left.parse(obj, params);
      } catch (err) {
        error.addErrors(err.errors);
        // errors.push(`Left side of intersection: ${err.message}`);
      }

      try {
        def.right.parse(obj, params);
      } catch (err) {
        error.addErrors(err.errors);
        // errors.push(`Right side of intersection: ${err.message}`);
      }

      // if (errors.length) {
      //   throw ZodError.fromString(errors.join('\n'));
      // }
      break;

    case z.ZodTypes.tuple:
      if (parsedType !== ZodParsedType.array) {
        // tupleError.addError('','Non-array type detected; invalid tuple.')
        error.addError(
          makeError({ code: ZodErrorCode.invalid_type, expected: ZodParsedType.array, received: parsedType }),
        );
        throw error;
        // throw ZodError.fromString('Non-array type detected; invalid tuple.');
      }
      if (obj.length > def.items.length) {
        error.addError(
          makeError({ code: ZodErrorCode.too_big, maximum: def.items.length, inclusive: true, type: 'array' }),
        );
        // tupleError.addError('',`Incorrect number of elements in tuple: expected ${def.items.length}, got ${obj.length}`)
        // throw ZodError.fromString(
        //   `Incorrect number of elements in tuple: expected ${def.items.length}, got ${obj.length}`,
        // );
      } else if (obj.length < def.items.length) {
        error.addError(
          makeError({ code: ZodErrorCode.too_small, minimum: def.items.length, inclusive: true, type: 'array' }),
        );
        // tupleError.addError('',`Incorrect number of elements in tuple: expected ${def.items.length}, got ${obj.length}`)
        // throw ZodError.fromString(
        //   `Incorrect number of elements in tuple: expected ${def.items.length}, got ${obj.length}`,
        // );
      }

      // const data:any[] = obj;
      // const tupleError = ZodError.create([]);
      const parsedTuple: any[] = [];
      const tupleData: any[] = obj;
      for (const index in tupleData) {
        const item = tupleData[index];
        const itemParser = def.items[index];
        try {
          parsedTuple.push(itemParser.parse(item, { ...params, path: [...params.path, index] }));
        } catch (err) {
          // console.log(`mering child: ${index}`);
          error.addErrors(err.errors);
          // tupleError.mergeChild(index, err);
        }
      }
      // if (!tupleError.isEmpty) {
      //   throw tupleError;
      // }
      // return parsedTuple as any;
      break;
    case z.ZodTypes.lazy:
      const lazySchema = def.getter();
      lazySchema.parse(obj, params);
      // return lazySchema.parse(obj, params);
      break;
    // return obj;
    case z.ZodTypes.literal:
      // const literalValue = def.value;
      // if (typeof literalValue === 'object' && obj !== null) throw ZodError.fromString(`Can't process non-primitive literals.`);
      // if (['string','']typeof obj === 'object') throw ZodError.fromString(`Invalid type: ${object}.`);
      if (obj !== def.value) {
        error.addError(makeError({ code: ZodErrorCode.invalid_literal_value, expected: def.value }));
        // throw ZodError.fromString(`${obj} !== ${def.value}`);
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
        // throw ZodError.fromString(`"${obj}" does not match any value in enum`);
      }
      // return obj;
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
        // throw ZodError.fromString(`Non-function type: "${typeof obj}"`);
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
          def.returns.parse(result);
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

        def.returns.parse(result);
        return result;
      };
      return validatedFunc;
    // return obj;
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
      // if (typeof obj !== 'object') throw ZodError.fromString(`Non-object type: ${typeof obj}`);
      // if (Array.isArray(obj)) throw ZodError.fromString(`Non-object type: array`);

      // const parsedRecord: any = {};
      // const recordError = new ZodError([]);
      for (const key in obj) {
        try {
          // parsedRecord[key] =
          def.valueType.parse(obj[key], { ...params, path: [...params.path, key] });
        } catch (err) {
          error.addErrors(err.errors);
          // recordError.mergeChild(key, err);
        }
      }
      // if (!recordError.isEmpty) throw recordError;
      // return parsedRecord;
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
        throw error;
      }
      if (isNaN(obj.getTime())) {
        // if (isNaN(obj.getTime())) {
        // return obj;
        // } else {
        error.addError(
          makeError({
            code: ZodErrorCode.invalid_date,
          }),
        );
        throw error;
        // throw ZodError.fromString(`Invalid date.`);
        // }
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
        throw error;
      }
      // if (!obj.then || typeof obj.then !== 'function') {
      //   console.log(JSON.stringify(obj, null, 2));
      //   throw ZodError.fromString(`Non-Promise type: ${typeof obj}`);
      // }
      // if (!obj.catch || typeof obj.catch !== 'function') {
      //   console.log(JSON.stringify(obj, null, 2));
      //   throw ZodError.fromString(`Non-Promise type: ${typeof obj}`);
      // }
      // if (util.getObjectType(obj) !== 'Promise') {
      //   throw ZodError.fromString(`Non-Promise type.`);
      // }
      // if (def.checks) {
      //   throw ZodError.fromString("Can't apply custom validators to Promise schemas.");
      // }
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
      // function
      // return obj;
      util.assertNever(def);

    // break;
  }

  const customChecks = def.checks || [];
  for (const check of customChecks) {
    if (!check.check(obj)) {
      const noMethodCheck = { ...check };
      delete noMethodCheck.check;
      error.addError(makeError(noMethodCheck));
    }
  }

  if (!error.isEmpty) {
    throw error;
  }

  return obj as any;
};
