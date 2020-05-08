import * as z from './types/base';
import { ZodDef, ZodPromise } from '.';
import { util } from './helpers/util';
import { ZodArray } from './types/array';
import { ZodObject } from './types/object';
import { ZodUnion } from './types/union';
import { ZodIntersection } from './types/intersection';
import { ZodTuple } from './types/tuple';
import { ZodRecord } from './types/record';
import { ZodLazy } from './types/lazy';
import { ZodError } from './ZodError';

export const Visitor = (visit: (_schema: z.ZodTypeAny) => z.ZodTypeAny) => (schema: z.ZodTypeAny) => {
  const _def = schema._def;
  const def: ZodDef = _def as any;

  switch (def.t) {
    case z.ZodTypes.string:
      return visit(schema);
    case z.ZodTypes.number:
      return visit(schema);
    case z.ZodTypes.bigint:
      return visit(schema);
    case z.ZodTypes.boolean:
      return visit(schema);
    case z.ZodTypes.date:
      return visit(schema);
    case z.ZodTypes.undefined:
      return visit(schema);
    case z.ZodTypes.null:
      return visit(schema);
    case z.ZodTypes.any:
      return visit(schema);
    case z.ZodTypes.unknown:
      return visit(schema);
    case z.ZodTypes.function:
      return visit(schema);
    case z.ZodTypes.array:
      return visit(
        new ZodArray({
          ...def,
          type: visit(def.type),
        }),
      );
    case z.ZodTypes.object:
      const visitedShape: any = {};
      for (const key in def.shape) {
        visitedShape[key] = visit(def.shape[key]);
      }
      return visit(
        new ZodObject({
          ...def,
          shape: visitedShape,
        }),
      );
    case z.ZodTypes.union:
      return visit(
        new ZodUnion({
          ...def,
          options: def.options.map(option => visit(option)) as any,
        }),
      );
    case z.ZodTypes.intersection:
      return visit(
        new ZodIntersection({
          ...def,
          left: visit(def.left),
          right: visit(def.left),
        }),
      );
    case z.ZodTypes.tuple:
      return visit(
        new ZodTuple({
          ...def,
          items: def.items.map(item => visit(item)) as any,
        }),
      );
    case z.ZodTypes.record:
      return visit(
        new ZodRecord({
          ...def,
          valueType: visit(def.valueType),
        }),
      );
    case z.ZodTypes.lazy:
      return visit(
        new ZodLazy({
          ...def,
          getter: () => visit(def.getter()),
        }),
      );
    case z.ZodTypes.literal:
      return visit(schema);
    case z.ZodTypes.enum:
      return visit(schema);
    case z.ZodTypes.promise:
      return visit(
        new ZodPromise({
          ...def,
          type: visit(def.type),
        }),
      );

    default:
      util.assertNever(def);
      break;
  }
  throw ZodError.fromString(`Unknown schema type.`);
};
