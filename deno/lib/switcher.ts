import { util } from "./helpers/util.ts";
import { ZodDef, ZodType, ZodTypes } from "./index.ts";
// import { ZodDef } from "./ZodDef";
// import { ZodTypes } from "./ZodTypes";

export const visitor = (schema: ZodType<any, any>) => {
  const def = schema._def as ZodDef;
  switch (def.t) {
    case ZodTypes.string:
      break;
    case ZodTypes.number:
      break;
    case ZodTypes.bigint:
      break;
    case ZodTypes.boolean:
      break;
    case ZodTypes.undefined:
      break;
    case ZodTypes.null:
      break;
    case ZodTypes.any:
      break;
    case ZodTypes.unknown:
      break;
    case ZodTypes.never:
      break;
    case ZodTypes.void:
      break;
    case ZodTypes.array:
      break;
    case ZodTypes.object:
      break;
    case ZodTypes.union:
      break;
    case ZodTypes.intersection:
      break;
    case ZodTypes.tuple:
      break;
    case ZodTypes.lazy:
      break;
    case ZodTypes.literal:
      break;
    case ZodTypes.enum:
      break;
    case ZodTypes.nativeEnum:
      break;
    case ZodTypes.function:
      break;
    case ZodTypes.record:
      break;
    case ZodTypes.date:
      break;
    case ZodTypes.promise:
      break;
    case ZodTypes.transformer:
      break;
    case ZodTypes.optional:
      break;
    case ZodTypes.nullable:
      break;
    case ZodTypes.map:
      break;
    case ZodTypes.set:
      break;
    default:
      util.assertNever(def);
  }
};
