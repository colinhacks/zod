import * as z from './types/base';
import { ZodArray } from './types/array';
import { ZodDef } from '.';
import { ZodObject } from './types/object';

export const applyMask = (schema: z.ZodTypeAny, mask: any, mode: 'omit' | 'pick'): any => {
  const _def = schema._def;
  const def: ZodDef = _def as any;

  if (mask === true) {
    return schema;
  } else if (typeof mask === 'object' && !Array.isArray(mask)) {
    if (def.t === z.ZodTypes.array) {
      if (def.type._def.t === z.ZodTypes.object) {
        return new ZodArray({
          t: z.ZodTypes.array,
          nonempty: def.nonempty,
          type: applyMask(def.type, mask, mode),
        });
      } else {
        throw new Error(`You can only ${mode} arrays of objects.`);
      }
    } else if (def.t === z.ZodTypes.object) {
      const modShape: any = {};
      const shape = def.shape;
      if (mode === 'pick') {
        if (mask === true) return shape;
        for (const key in mask) {
          if (!Object.keys(shape).includes(key)) throw new Error(`Unknown key in pick: ${key}`);
          modShape[key] = applyMask(shape[key], mask[key], mode);
        }
      }

      if (mode === 'omit') {
        for (const maskKey in mask) {
          if (!Object.keys(shape).includes(maskKey)) throw new Error(`Unknown key in omit: ${maskKey}`);
        }
        for (const key in shape) {
          if (mask[key] === true) {
            continue;
          } else if (typeof mask[key] === 'object') {
            modShape[key] = applyMask(shape[key], mask[key], mode);
          } else {
            modShape[key] = shape[key];
          }
        }
      }
      return new ZodObject({
        t: z.ZodTypes.object,
        params: def.params,
        shape: modShape,
      });
    }
  }
  throw new Error(`Invalid mask!\n\n${JSON.stringify(mask, null, 2)}`);
};
