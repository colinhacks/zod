import * as z from "./index";
import { util } from "./helpers/util";

export const visitor = (schema: z.ZodType<any, any>) => {
  const def = schema._def as z.ZodDef;
  switch (def.t) {
    case z.ZodTypes.string:
      break;
    case z.ZodTypes.number:
      break;
    case z.ZodTypes.bigint:
      break;
    case z.ZodTypes.boolean:
      break;
    case z.ZodTypes.undefined:
      break;
    case z.ZodTypes.null:
      break;
    case z.ZodTypes.any:
      break;
    case z.ZodTypes.unknown:
      break;
    case z.ZodTypes.never:
      break;
    case z.ZodTypes.void:
      break;
    case z.ZodTypes.array:
      break;
    case z.ZodTypes.object:
      break;
    case z.ZodTypes.union:
      break;
    case z.ZodTypes.intersection:
      break;
    case z.ZodTypes.tuple:
      break;
    case z.ZodTypes.lazy:
      break;
    case z.ZodTypes.literal:
      break;
    case z.ZodTypes.enum:
      break;
    case z.ZodTypes.nativeEnum:
      break;
    case z.ZodTypes.function:
      break;
    case z.ZodTypes.record:
      break;
    case z.ZodTypes.date:
      break;
    case z.ZodTypes.promise:
      break;
    case z.ZodTypes.transformer:
      break;
    case z.ZodTypes.optional:
      break;
    case z.ZodTypes.nullable:
      break;
    case z.ZodTypes.map:
      break;
    default:
      util.assertNever(def);
  }
};
