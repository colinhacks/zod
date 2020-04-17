import * as z from './types/base';
import { ZodDef } from '.';
import { util } from './helpers/util';

export const sampleVisitor = (schema: z.ZodAny) => {
  const _def = schema._def;
  const def: ZodDef = _def as any;

  switch (def.t) {
    case z.ZodTypes.string:
      break;
    case z.ZodTypes.number:
      break;
    case z.ZodTypes.boolean:
      break;
    case z.ZodTypes.date:
      break;
    case z.ZodTypes.undefined:
      break;
    case z.ZodTypes.null:
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
    case z.ZodTypes.record:
      break;
    case z.ZodTypes.lazy:
      break;
    case z.ZodTypes.literal:
      break;
    case z.ZodTypes.enum:
      break;
    default:
      util.assertNever(def);
      break;
  }
};
