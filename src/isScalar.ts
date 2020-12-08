import { ZodDef } from ".";
import { util } from "./helpers/util";
import { ZodType, ZodTypes } from "./types/base";

export const isScalar = (
  schema: ZodType<any, any>,
  params: { root: boolean } = { root: true }
): boolean => {
  const def = schema._def as ZodDef;

  let returnValue = false;
  switch (def.t) {
    case ZodTypes.string:
      returnValue = true;
      break;
    case ZodTypes.number:
      returnValue = true;
      break;
    case ZodTypes.bigint:
      returnValue = true;
      break;
    case ZodTypes.boolean:
      returnValue = true;
      break;
    case ZodTypes.undefined:
      returnValue = true;
      break;
    case ZodTypes.null:
      returnValue = true;
      break;
    case ZodTypes.any:
      returnValue = false;
      break;
    case ZodTypes.unknown:
      returnValue = false;
      break;
    case ZodTypes.never:
      returnValue = false;
      break;
    case ZodTypes.void:
      returnValue = false;
      break;
    case ZodTypes.array:
      if (params.root === false) return false;
      returnValue = isScalar(def.type, { root: false });
      break;
    case ZodTypes.object:
      returnValue = false;
      break;
    case ZodTypes.union:
      returnValue = def.options.every((x) => isScalar(x));
      break;
    case ZodTypes.intersection:
      returnValue = isScalar(def.left) && isScalar(def.right);
      break;
    case ZodTypes.tuple:
      returnValue = def.items.every((x) => isScalar(x, { root: false }));
      break;
    case ZodTypes.lazy:
      returnValue = isScalar(def.getter());
      break;
    case ZodTypes.literal:
      returnValue = true;
      break;
    case ZodTypes.enum:
      returnValue = true;
      break;
    case ZodTypes.nativeEnum:
      returnValue = true;
      break;
    case ZodTypes.function:
      returnValue = false;
      break;
    case ZodTypes.record:
      returnValue = false;
      break;
    case ZodTypes.map:
      returnValue = false;
      break;
    case ZodTypes.date:
      returnValue = true;
      break;
    case ZodTypes.promise:
      returnValue = false;
      break;
    case ZodTypes.transformer:
      returnValue = isScalar(def.output);
      break;

    case ZodTypes.optional:
      returnValue = isScalar(def.innerType);
      break;
    case ZodTypes.nullable:
      returnValue = isScalar(def.innerType);
      break;
    default:
      util.assertNever(def);
    // returnValue = false; break;
  }
  return returnValue;
};
