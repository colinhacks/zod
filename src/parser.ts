/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodDef, ZodLazy, ZodUnion } from '.';
import * as util from './helpers/util';
import * as z from './types/base';
import { ZodError } from './ZodError';

export type ParseParams = {
  seen: { schema: any; objects: any[] }[];
};

export const ZodParser = (schemaDef: z.ZodTypeDef) => (obj: any, params: ParseParams = { seen: [] }) => {
  const def: ZodDef = schemaDef as any;
  const schemaSeen = params.seen.find((x) => x.schema === schemaDef);
  if (schemaSeen) {
    if (schemaSeen.objects.indexOf(obj) !== -1) {
      return obj;
    } else {
      schemaSeen.objects.push(obj);
    }
  } else {
    params.seen.push({ schema: schemaDef, objects: [obj] });
  }

  let parsedObject: any = undefined;
  let options: ZodUnion<any>;
  const errorCollection: ZodError = ZodError.create([]);

  switch (def.t) {
    case z.ZodTypes.string:
      if (typeof obj !== 'string') throw ZodError.fromString(`Non-string type: ${typeof obj}`);
      break;
    case z.ZodTypes.number:
      if (typeof obj !== 'number') throw ZodError.fromString(`Non-number type: ${typeof obj}`);
      if (Number.isNaN(obj)) {
        throw ZodError.fromString('Non-number type: NaN');
      }
      break;
    case z.ZodTypes.bigint:
      if (typeof obj !== 'bigint') {
        throw ZodError.fromString(`Non-bigint type: ${typeof obj}.`);
      }
      break;
    case z.ZodTypes.boolean:
      if (typeof obj !== 'boolean') throw ZodError.fromString(`Non-boolean type: ${typeof obj}`);
      break;
    case z.ZodTypes.undefined:
      if (obj !== undefined) throw ZodError.fromString(`Non-undefined type:Found: ${typeof obj}`);
      break;
    case z.ZodTypes.null:
      if (obj !== null) throw ZodError.fromString(`Non-null type: ${typeof obj}`);
      break;
    case z.ZodTypes.any:
      break;
    case z.ZodTypes.unknown:
      break;
    case z.ZodTypes.array:
      if (!Array.isArray(obj)) throw ZodError.fromString(`Non-array type: ${typeof obj}`);
      if (def.nonempty === true && obj.length === 0) {
        throw ZodError.fromString('Array cannot be empty');
      }
      parsedObject = obj.map((item, i) => {
        try {
          const parsedItem = def.type.parse(item, params);
          return parsedItem;
        } catch (err) {
          if (!(err instanceof ZodError)) {
            throw err;
          }
          errorCollection.mergeChild(`[${i}]`, err);
        }
      });
      if (errorCollection.errors.length !== 0) {
        throw errorCollection;
      }
      break;
    case z.ZodTypes.object:
      if (typeof obj !== 'object') throw ZodError.fromString(`Non-object type: ${typeof obj}`);
      if (Array.isArray(obj)) throw ZodError.fromString('Non-object type: array');

      parsedObject = {};
      if (def.params.strict) {
        const shapeKeys = new Set<string>();
        Object.keys(def.shape).forEach((k) => shapeKeys.add(k));

        const objKeys = Object.keys(obj);
        const extraKeys = objKeys.filter((k) => !shapeKeys.has(k));

        if (extraKeys.length !== 0) {
          throw ZodError.fromString(`Unexpected key(s) in object: ${extraKeys.map((k) => `'${k}'`).join(', ')}`);
        }
      }

      Object.keys(def.shape).map((k) => {
        try {
          parsedObject[k] = def.shape[k].parse(obj[k], params);
        } catch (err) {
          if (!(err instanceof ZodError)) {
            throw err;
          }
          errorCollection.mergeChild(`['${k}']`, err);
        }
      });

      if (errorCollection.errors.length !== 0) {
        throw errorCollection;
      }

      break;
    case z.ZodTypes.union:
      for (let i = 0; i < def.options.length; i++) {
        try {
          parsedObject = def.options[i].parse(obj, params);
          errorCollection.errors = [];
          break;
        } catch (err) {
          if (!(err instanceof ZodError)) {
            throw err;
          }
          errorCollection.mergeChild(`[${i}]`, err);
        }
      }

      if (errorCollection.errors.length !== 0) {
        throw errorCollection;
      }
      break;
    case z.ZodTypes.generic:
      options = def.options instanceof ZodLazy ? def.options._def.getter() : def.options;
      for (let i = 0; i < options._def.options.length; i++) {
        try {
          parsedObject = def.body(options._def.options[i]).parse(obj, params);
          break;
        } catch (err) {
          if (!(err instanceof ZodError)) {
            throw err;
          }
          errorCollection.mergeChild(`[${i}]`, err);
        }
      }
      if (errorCollection.errors.length !== 0) {
        throw errorCollection;
      }
      break;
    case z.ZodTypes.intersection:
      try {
        parsedObject = def.left.parse(obj, params);
      } catch (err) {
        if (!(err instanceof ZodError)) {
          throw err;
        }
        errorCollection.mergeChild('{left}', err);
      }

      try {
        parsedObject = def.right.parse(obj, params);
      } catch (err) {
        if (!(err instanceof ZodError)) {
          throw err;
        }
        errorCollection.mergeChild('{right}', err);
      }

      if (errorCollection.errors.length !== 0) {
        throw errorCollection;
      }
      break;
    case z.ZodTypes.tuple:
      if (!Array.isArray(obj)) {
        throw ZodError.fromString('Non-array type detected; invalid tuple.');
      }
      if (def.items.length !== obj.length) {
        throw ZodError.fromString(
          `Incorrect number of elements in tuple: expected ${def.items.length}, got ${obj.length}`,
        );
      }

      parsedObject = [];
      for (let index = 0; index < obj.length; index++) {
        const item = obj[index];
        const itemParser = def.items[index];
        try {
          parsedObject.push(itemParser.parse(item, params));
        } catch (err) {
          if (!(err instanceof ZodError)) {
            throw err;
          }
          errorCollection.mergeChild(`[${index}]`, err);
        }
      }

      if (errorCollection.errors.length !== 0) {
        throw errorCollection;
      }
      break;
    case z.ZodTypes.lazy:
      parsedObject = def.getter().parse(obj, params);
      break;
    case z.ZodTypes.literal:
      if (obj !== def.value) {
        throw ZodError.fromString(`${obj} !== ${def.value}`);
      }
      break;
    case z.ZodTypes.enum:
      if (def.values.indexOf(obj) === -1) {
        throw ZodError.fromString(`'${obj}' does not match any value in enum`);
      }
      break;
    case z.ZodTypes.function:
      if (typeof obj !== 'function') {
        throw ZodError.fromString(`Non-function type: '${typeof obj}'`);
      }
      parsedObject = (...args: any[]) => {
        def.args.parse(args as any);

        const result = obj(...(args as any));
        def.returns.parse(result);

        return result;
      };
      break;
    case z.ZodTypes.record:
      if (typeof obj !== 'object') throw ZodError.fromString(`Non-object type: ${typeof obj}`);
      if (Array.isArray(obj)) throw ZodError.fromString('Non-object type: array');

      parsedObject = {};
      Object.keys(obj).forEach((k) => {
        try {
          parsedObject[k] = def.valueType.parse(obj[k]);
        } catch (err) {
          if (!(err instanceof ZodError)) {
            throw err;
          }
          errorCollection.mergeChild(`['${k}']`, err);
        }
      });

      if (errorCollection.errors.length !== 0) {
        throw errorCollection;
      }
      break;
    case z.ZodTypes.date:
      if (obj instanceof Date) {
        if (isNaN(obj.getTime())) {
          throw ZodError.fromString('Invalid date.');
        }
      } else {
        throw ZodError.fromString(`Non-Date type: ${typeof obj}`);
      }
      break;

    case z.ZodTypes.promise:
      if (!obj.then || typeof obj.then !== 'function') {
        throw ZodError.fromString(`Non-Promise type: ${typeof obj}`);
      }
      if (!obj.catch || typeof obj.catch !== 'function') {
        throw ZodError.fromString(`Non-Promise type: ${typeof obj}`);
      }
      if (def.checks) {
        throw ZodError.fromString("Can't apply custom validators to Promise schemas.");
      }
      parsedObject = new Promise((res, rej) => {
        obj.then((objValue: any) => {
          try {
            res(def.type.parse(objValue));
          } catch (err) {
            if (!(err instanceof ZodError)) {
              throw err;
            }
            rej(err);
          }
        });
      });
      break;
    default:
      util.assertNever(def);
  }

  const customChecks = def.checks || [];
  for (const check of customChecks) {
    if (!check.check(obj)) {
      throw ZodError.fromString(check.message || 'Failed custom check.');
    }
  }

  if (typeof parsedObject !== 'undefined') {
    return parsedObject;
  }
  return obj as any;
};
