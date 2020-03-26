import * as z from './types/base';
import { ZodDef } from '.';
import { ZodError } from './ZodError';

function assertNever(x: never): never {
  throw ZodError.fromString('Unexpected object: ' + x);
}

export const ZodParser = <T>(schemaDef: z.ZodTypeDef) => (obj: any): T => {
  const def: ZodDef = schemaDef as any;

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
      return obj as any;
    case z.ZodTypes.null:
      if (obj !== null) throw ZodError.fromString(`Non-null type: ${typeof obj}`);
      return obj as any;
    case z.ZodTypes.array:
      if (!Array.isArray(obj)) throw ZodError.fromString(`Non-array type: ${typeof obj}`);
      const arrayError = ZodError.create([]);
      if (def.nonempty === true && obj.length === 0) {
        throw ZodError.fromString('Array cannot be empty');
      }
      const parsedArray = obj.map((item, i) => {
        try {
          const parsedItem = def.type.parse(item);
          return parsedItem;
        } catch (err) {
          if (err instanceof ZodError) {
            arrayError.mergeChild(i, err);
            // arrayErrors.push(`[${i}]: ${err.message}`);
            return null;
          } else {
            arrayError.mergeChild(i, ZodError.fromString(err.message));
            // arrayErrors.push(`[${i}]: ${err.message}`);
            return null;
          }
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
          throw ZodError.fromString(`Unexpected keys in object: ${extraKeys.join(', ')}`);
        }
      }

      const objectError = ZodError.create([]);
      for (const key in shape) {
        try {
          def.shape[key].parse(obj[key]);
        } catch (err) {
          if (err instanceof ZodError) {
            objectError.mergeChild(key, err);
          } else {
            objectError.mergeChild(key, ZodError.fromString(err.message));
          }
        }
      }

      if (!objectError.empty) {
        throw objectError; //ZodError.fromString(objectErrors.join('\n'));
      }
      return obj;
    case z.ZodTypes.union:
      for (const option of def.options) {
        try {
          option.parse(obj);
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
        def.left.parse(obj);
      } catch (err) {
        errors.push(`Left side of intersection: ${err.message}`);
      }

      try {
        def.right.parse(obj);
      } catch (err) {
        errors.push(`Right side of intersection: ${err.message}`);
      }

      if (!errors.length) {
        return obj;
      }
      throw ZodError.fromString(errors.join('\n'));

    case z.ZodTypes.tuple:
      if (!Array.isArray(obj)) {
        throw ZodError.fromString('Non-array type detected; invalid tuple.');
      }
      if (def.items.length !== obj.length) {
        throw ZodError.fromString(
          `Incorrect number of elements in tuple: expected ${def.items.length}, got ${obj.length}`,
        );
      }
      const parsedTuple: any[] = [];
      for (const index in obj) {
        const item = obj[index];
        const itemParser = def.items[index];
        try {
          parsedTuple.push(itemParser.parse(item));
        } catch (err) {
          if (err instanceof ZodError) {
            throw err.bubbleUp(index);
          } else {
            throw ZodError.fromString(err.message);
          }
        }
      }
      return parsedTuple as any;
    case z.ZodTypes.lazy:
      const lazySchema = def.getter();
      lazySchema.parse(obj);
      return obj;
    case z.ZodTypes.literal:
      const literalValue = def.value;
      if (typeof literalValue === 'string') if (obj === def.value) return obj;
      throw ZodError.fromString(`${obj} !== Literal<${def.value}>`);
    case z.ZodTypes.enum:
      for (const literalDef of def.values) {
        try {
          literalDef.parse(obj);
          return obj;
        } catch (err) {}
      }
      throw ZodError.fromString(`"${obj}" does not match any value in enum`);
    case z.ZodTypes.function:
      return obj;
    default:
      assertNever(def);
  }
};
