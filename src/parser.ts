import * as z from './types/base';
import { ZodDef } from '.';
import { ZodError } from './ZodError';

function assertNever(x: never): never {
  throw ZodError.fromString('Unexpected object: ' + x);
}
export type ParseParams = {
  seen: { schema: any; objects: any[] }[];
};

// const seen: any[] = [];
// export const ZodParser = (schemaDef: z.ZodTypeDef) => (obj: any) => ZodParserFactory(schemaDef)(obj, { seen: [] });
export const ZodParser = (schemaDef: z.ZodTypeDef) => (obj: any, params: ParseParams = { seen: [] }) => {
  const def: ZodDef = schemaDef as any;
  // const { seen } = params;

  // console.log(`visit ${schemaDef.t}: ${typeof obj} - ${obj.name || ''}`);
  // if (!['number', 'string', 'boolean', 'undefined'].includes(typeof obj)) {
  const schemaSeen = params.seen.find(x => x.schema === schemaDef);
  if (schemaSeen) {
    if (schemaSeen.objects.indexOf(obj) !== -1) {
      console.log(`seen ${typeof obj} before: ${obj.name}`);
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
      return obj as any;
    case z.ZodTypes.number:
      if (typeof obj !== 'number') throw ZodError.fromString(`Non-number type: ${typeof obj}`);
      if (Number.isNaN(obj)) {
        throw ZodError.fromString(`Non-number type: NaN`);
      }
      return obj as any;
    case z.ZodTypes.boolean:
      if (typeof obj !== 'boolean') throw ZodError.fromString(`Non-boolean type: ${typeof obj}`);
      return obj as any;
    case z.ZodTypes.undefined:
      if (obj !== undefined) throw ZodError.fromString(`Non-undefined type:Found: ${typeof obj}`);
      return undefined;
    case z.ZodTypes.null:
      if (obj !== null) throw ZodError.fromString(`Non-null type: ${typeof obj}`);
      return null;
    case z.ZodTypes.array:
      if (!Array.isArray(obj)) throw ZodError.fromString(`Non-array type: ${typeof obj}`);
      const arrayError = ZodError.create([]);
      if (def.nonempty === true && obj.length === 0) {
        throw ZodError.fromString('Array cannot be empty');
      }
      const parsedArray = obj.map((item, i) => {
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
      return parsedArray as any;
    case z.ZodTypes.object:
      if (typeof obj !== 'object') throw ZodError.fromString(`Non-object type: ${typeof obj}`);
      if (Array.isArray(obj)) throw ZodError.fromString(`Non-object type: array`);

      const shape = def.shape;
      if (def.strict) {
        const shapeKeys = Object.keys(def.shape);
        const objKeys = Object.keys(obj);
        const extraKeys = objKeys.filter(k => shapeKeys.indexOf(k) === -1);
        if (extraKeys.length) {
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
      return parsedObject;
    case z.ZodTypes.union:
      for (const option of def.options) {
        try {
          option.parse(obj, params);
          return obj;
        } catch (err) {}
      }
      throw ZodError.fromString(
        `Type mismatch in union.\nReceived: ${JSON.stringify(obj, null, 2)}\n\nExpected: ${def.options
          .map(x => x._def.t)
          .join(' OR ')}`,
      );
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

      if (!errors.length) {
        return obj;
      }
      throw ZodError.fromString(errors.join('\n'));

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
      return parsedTuple as any;
    case z.ZodTypes.lazy:
      const lazySchema = def.getter();
      lazySchema.parse(obj, params);
      return obj;
    case z.ZodTypes.literal:
      // const literalValue = def.value;
      // if (typeof literalValue === 'object' && obj !== null) throw ZodError.fromString(`Can't process non-primitive literals.`);
      // if (['string','']typeof obj === 'object') throw ZodError.fromString(`Invalid type: ${object}.`);
      if (obj === def.value) return obj;
      throw ZodError.fromString(`${obj} !== ${def.value}`);
    case z.ZodTypes.enum:
      if (def.values.indexOf(obj) === -1) {
        throw ZodError.fromString(`"${obj}" does not match any value in enum`);
      }
      return obj;
    // case z.ZodTypes.function:
    //   return obj;
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
      return parsedRecord;
    default:
      // function
      // return obj;
      assertNever(def);
    // break;
  }

  // assertNever();
  // return obj;
};
