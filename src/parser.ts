import * as z from './types/base';
import { ZodDef } from '.';
import { ZodError } from './ZodError';
import { util } from './helpers/util';

export type ParseParams = {
  seen: { schema: any; objects: any[] }[];
};

export const ZodParser = (schemaDef: z.ZodTypeDef) => (obj: any, params: ParseParams = { seen: [] }) => {
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

  switch (def.t) {
    case z.ZodTypes.string:
      if (typeof obj !== 'string') throw ZodError.fromString(`Non-string type: ${typeof obj}`);
      // return obj as any;
      break;
    case z.ZodTypes.number:
      if (typeof obj !== 'number') throw ZodError.fromString(`Non-number type: ${typeof obj}`);
      if (Number.isNaN(obj)) {
        throw ZodError.fromString(`Non-number type: NaN`);
      }
      // return obj as any;
      break;
    case z.ZodTypes.bigint:
      if (typeof obj !== 'bigint') {
        throw ZodError.fromString(`Non-bigint type: ${typeof obj}.`);
      }
      // return obj;
      break;
    case z.ZodTypes.boolean:
      if (typeof obj !== 'boolean') throw ZodError.fromString(`Non-boolean type: ${typeof obj}`);
      // return obj as any;
      break;
    case z.ZodTypes.undefined:
      if (obj !== undefined) throw ZodError.fromString(`Non-undefined type:Found: ${typeof obj}`);
      // return undefined;
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
      const arrayError = ZodError.create([]);
      if (def.nonempty === true && obj.length === 0) {
        throw ZodError.fromString('Array cannot be empty');
      }
      obj.map((item, i) => {
        try {
          const parsedItem = def.type.parse(item, params);
          return parsedItem;
        } catch (err) {
          arrayError.mergeChild(i, err);
        }
      });
      if (!arrayError.empty) {
        // throw ZodError.fromString(arrayErrors.join('\n\n'));
        throw arrayError;
      }
      break;
    // return parsedArray as any;
    case z.ZodTypes.object:
      if (typeof obj !== 'object') throw ZodError.fromString(`Non-object type: ${typeof obj}`);
      if (Array.isArray(obj)) throw ZodError.fromString(`Non-object type: array`);

      const shape = def.shape;
      if (def.params.strict) {
        const shapeKeys = Object.keys(def.shape);
        const objKeys = Object.keys(obj);
        const extraKeys = objKeys.filter(k => shapeKeys.indexOf(k) === -1);

        if (extraKeys.length) {
          // console.log(def);
          throw ZodError.fromString(`Unexpected key(s) in object: ${extraKeys.map(k => `'${k}'`).join(', ')}`);
        }
      }

      const parsedObject: any = {};
      const objectError = ZodError.create([]);
      for (const key in shape) {
        try {
          const parsedEntry = def.shape[key].parse(obj[key], params);
          parsedObject[key] = parsedEntry;
        } catch (err) {
          objectError.mergeChild(key, err);
        }
      }

      if (!objectError.empty) {
        throw objectError; //ZodError.fromString(objectErrors.join('\n'));
      }
      // return parsedObject;
      break;
    case z.ZodTypes.union:
      let isValid = false;
      for (const option of def.options) {
        try {
          option.parse(obj, params);
          isValid = true;
        } catch (err) {
          // isValid = false;
        }
      }

      if (isValid === false) {
        throw ZodError.fromString(
          `Error parsing union.\nReceived: ${JSON.stringify(obj, null, 2)}\nExpected: ${def.options
            .map(x => x._def.t)
            .join(' OR ')}`,
        );
      }
      break;
    case z.ZodTypes.intersection:
      const errors: string[] = [];
      try {
        def.left.parse(obj, params);
      } catch (err) {
        errors.push(`Left side of intersection: ${err.message}`);
      }

      try {
        def.right.parse(obj, params);
      } catch (err) {
        errors.push(`Right side of intersection: ${err.message}`);
      }

      if (errors.length) {
        throw ZodError.fromString(errors.join('\n'));
      }
      break;

    case z.ZodTypes.tuple:
      if (!Array.isArray(obj)) {
        // tupleError.addError('','Non-array type detected; invalid tuple.')
        throw ZodError.fromString('Non-array type detected; invalid tuple.');
      }
      if (def.items.length !== obj.length) {
        // tupleError.addError('',`Incorrect number of elements in tuple: expected ${def.items.length}, got ${obj.length}`)
        throw ZodError.fromString(
          `Incorrect number of elements in tuple: expected ${def.items.length}, got ${obj.length}`,
        );
      }

      const tupleError = ZodError.create([]);
      const parsedTuple: any[] = [];
      for (const index in obj) {
        const item = obj[index];
        const itemParser = def.items[index];
        try {
          parsedTuple.push(itemParser.parse(item, params));
        } catch (err) {
          tupleError.mergeChild(index, err);
        }
      }
      if (!tupleError.empty) {
        throw tupleError;
      }
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
      if (obj !== def.value) throw ZodError.fromString(`${obj} !== ${def.value}`);
      break;

    case z.ZodTypes.enum:
      if (def.values.indexOf(obj) === -1) {
        throw ZodError.fromString(`"${obj}" does not match any value in enum`);
      }
      // return obj;
      break;
    case z.ZodTypes.function:
      if (typeof obj !== 'function') {
        throw ZodError.fromString(`Non-function type: "${typeof obj}"`);
      }
      const validatedFunc = (...args: any[]) => {
        try {
          def.args.parse(args as any);
          const result = obj(...(args as any));
          def.returns.parse(result);
          return result;
        } catch (err) {
          throw err;
        }
      };
      return validatedFunc;
    // return obj;
    case z.ZodTypes.record:
      if (typeof obj !== 'object') throw ZodError.fromString(`Non-object type: ${typeof obj}`);
      if (Array.isArray(obj)) throw ZodError.fromString(`Non-object type: array`);

      const parsedRecord: any = {};
      const recordError = new ZodError();
      for (const key in obj) {
        try {
          parsedRecord[key] = def.valueType.parse(obj[key]);
        } catch (err) {
          recordError.mergeChild(key, err);
        }
      }
      if (!recordError.empty) throw recordError;
      // return parsedRecord;
      break;
    case z.ZodTypes.date:
      if (obj instanceof Date) {
        if (isNaN(obj.getTime())) {
          // return obj;
          // } else {
          throw ZodError.fromString(`Invalid date.`);
        }
      } else {
        throw ZodError.fromString(`Non-Date type: ${typeof obj}`);
      }
      break;

    case z.ZodTypes.promise:
      if (!obj.then || typeof obj.then !== 'function') {
        console.log(JSON.stringify(obj, null, 2));
        throw ZodError.fromString(`Non-Promise type: ${typeof obj}`);
      }
      if (!obj.catch || typeof obj.catch !== 'function') {
        console.log(JSON.stringify(obj, null, 2));
        throw ZodError.fromString(`Non-Promise type: ${typeof obj}`);
      }
      // if (util.getObjectType(obj) !== 'Promise') {
      //   throw ZodError.fromString(`Non-Promise type.`);
      // }
      if (def.checks) {
        throw ZodError.fromString("Can't apply custom validators to Promise schemas.");
      }
      return new Promise(async (res, rej) => {
        const objValue = await obj;
        try {
          const parsed = def.type.parse(objValue);
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
    if (check.check(obj) !== true) {
      throw ZodError.fromString(check.message || `Failed custom check.`);
    }
  }

  return obj as any;

  // assertNever();
  // return obj;
};
