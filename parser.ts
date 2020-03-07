import * as z from './types/base';
import { ZodDef } from '.';

export const ZodParser = <T>(schemaDef: z.ZodTypeDef) => (obj: any): T => {
  const def: ZodDef = schemaDef as any;

  switch (def.t) {
    case z.ZodTypes.string:
      if (typeof obj !== 'string')
        throw new Error(`Non-string type: ${typeof obj}`);
      return obj as any;
    case z.ZodTypes.number:
      if (typeof obj !== 'number')
        throw new Error(`Non-number type: ${typeof obj}`);
      if (Number.isNaN(obj)) {
        throw new Error(`Non-number type: NaN`);
      }
      return obj as any;
    case z.ZodTypes.boolean:
      if (typeof obj !== 'boolean')
        throw new Error(`Non-boolean type: ${typeof obj}`);
      return obj as any;
    case z.ZodTypes.undefined:
      if (obj !== undefined)
        throw new Error(`Non-undefined type:Found: ${typeof obj}`);
      return obj as any;
    case z.ZodTypes.null:
      if (obj !== null) throw new Error(`Non-null type: ${typeof obj}`);
      return obj as any;
    case z.ZodTypes.array:
      if (!Array.isArray(obj)) throw new Error(`Non-array type: ${typeof obj}`);
      const arrayErrors: string[] = [];
      const parsedArray = obj.map((item, i) => {
        try {
          const parsedItem = def.type.parse(item);
          return parsedItem;
        } catch (err) {
          arrayErrors.push(`[${i}]: ${err.message}`);
          return null;
        }
      });
      if (arrayErrors.length > 0) {
        // throw new Error(arrayErrors.join('\n\n'));
        throw new Error(arrayErrors.join('\n'));
      }
      return parsedArray as any;
    case z.ZodTypes.object:
      if (typeof obj !== 'object')
        throw new Error(`Non-object type: ${typeof obj}`);
      if (Array.isArray(obj)) throw new Error(`Non-object type: array`);
      const shape = def.shape;
      const objectErrors: string[] = [];
      for (const key in shape) {
        try {
          def.shape[key].parse(obj[key]);
        } catch (err) {
          objectErrors.push(`${key}: ${err.message}`);
        }
      }

      if (Object.keys(objectErrors).length > 0) {
        throw new Error(objectErrors.join('\n'));
      }
      return obj;
    case z.ZodTypes.union:
      for (const option of def.options) {
        try {
          option.parse(obj);
          return obj;
        } catch (err) {}
      }
      throw new Error(
        `Type mismatch in union.\nReceived: ${JSON.stringify(
          obj,
          null,
          2
        )}\n\nExpected: ${def.options.map(x => x._def.t).join(' OR ')}`
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
      throw new Error(errors.join('\n'));

    case z.ZodTypes.tuple:
      if (!Array.isArray(obj)) {
        throw new Error('Non-array type detected; invalid tuple.');
      }
      if (def.items.length !== obj.length) {
        throw new Error(
          `Not enough elements in tuple: expected ${def.items.length}, got ${obj.length}`
        );
      }
      const parsedTuple: any[] = [];
      for (const index in obj) {
        const item = obj[index];
        parsedTuple.push(def.items[index].parse(item));
      }
      return parsedTuple as any;
    case z.ZodTypes.lazy:
      const lazySchema = def.getter();
      lazySchema.parse(obj);
      return obj;
    default:
      throw new Error(`Invalid schema type: ${def.t}`);
  }
};
