import * as z from './index';
import { util } from './helpers/util';

export const isScalar = (
  schema: z.ZodType<any, any>,
  params: { root: boolean } = { root: true },
): boolean => {
  const def = schema._def as z.ZodDef;

  let returnValue = false;
  switch (def.t) {
    case z.ZodTypes.string:
      returnValue = true;
      break;
    case z.ZodTypes.number:
      returnValue = true;
      break;
    case z.ZodTypes.bigint:
      returnValue = true;
      break;
    case z.ZodTypes.boolean:
      returnValue = true;
      break;
    case z.ZodTypes.undefined:
      returnValue = true;
      break;
    case z.ZodTypes.null:
      returnValue = true;
      break;
    case z.ZodTypes.any:
      returnValue = false;
      break;
    case z.ZodTypes.unknown:
      returnValue = false;
      break;
    case z.ZodTypes.void:
      returnValue = false;
      break;
    case z.ZodTypes.array:
      if (params.root === false) return false;
      returnValue = isScalar(def.type, { root: false });
      break;
    case z.ZodTypes.object:
      returnValue = false;
      break;
    case z.ZodTypes.union:
      returnValue = def.options.every(x => isScalar(x));
      break;
    case z.ZodTypes.intersection:
      returnValue = isScalar(def.left) && isScalar(def.right);
      break;
    case z.ZodTypes.tuple:
      returnValue = false;
      break;
    case z.ZodTypes.lazy:
      returnValue = isScalar(def.getter());
      break;
    case z.ZodTypes.literal:
      returnValue = true;
      break;
    case z.ZodTypes.enum:
      returnValue = true;
      break;
    case z.ZodTypes.nativeEnum:
      returnValue = true;
      break;
    case z.ZodTypes.function:
      returnValue = false;
      break;
    case z.ZodTypes.record:
      returnValue = false;
      break;
    case z.ZodTypes.date:
      returnValue = true;
      break;
    case z.ZodTypes.promise:
      returnValue = false;
      break;
    case z.ZodTypes.transformer:
      returnValue = isScalar(def.output);
      break;
    default:
      util.assertNever(def);
    // returnValue = false; break;
  }
  return returnValue;
};
