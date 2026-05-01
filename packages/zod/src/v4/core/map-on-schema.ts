// Traversal pattern adapted from Jaen's v3 `mapOnSchema` (Apache-2.0):
// https://gist.github.com/jaens/7e15ae1984bb338c86eb5e452dee3010

import { clone } from "./util.js";
import type * as schemas from "./schemas.js";

const RESOLVING: unique symbol = Symbol("mapOnSchema/resolving");
type Resolving = typeof RESOLVING;

type AnyZod = schemas.$ZodType;

/**
 * Bottom-up rewrite of a schema tree. `fn` runs on every node after its
 * children have been mapped; the returned schema replaces the node.
 * Shared sub-schemas are visited once. Direct (non-`lazy`) cycles throw.
 *
 * Dispatches on `_zod.def.type`, not `instanceof`, so user-defined
 * schema types pass through. Override custom types from inside `fn`.
 */
export function mapOnSchema<T extends AnyZod>(schema: T, fn: (s: AnyZod) => AnyZod): T {
  const cache = new Map<AnyZod, AnyZod | Resolving>();

  function visit(s: AnyZod): AnyZod {
    const cached = cache.get(s);
    if (cached === RESOLVING) {
      throw new Error("mapOnSchema: encountered a non-lazy schema cycle");
    }
    if (cached !== undefined) return cached;
    cache.set(s, RESOLVING);
    const mapped = fn(mapInner(s));
    cache.set(s, mapped);
    return mapped;
  }

  function patch(s: AnyZod, p: object): AnyZod {
    return clone(s, { ...s._zod.def, ...p });
  }

  function mapInner(s: AnyZod): AnyZod {
    const def = s._zod.def as any;
    switch (def.type as schemas.$ZodTypeDef["type"]) {
      case "object": {
        const oldShape = def.shape as Record<string, AnyZod>;
        const newShape: Record<string, AnyZod> = {};
        for (const k in oldShape) newShape[k] = visit(oldShape[k]!);
        return patch(s, { shape: newShape });
      }
      case "array":
        return patch(s, { element: visit(def.element) });
      case "tuple": {
        const items = (def.items as AnyZod[]).map(visit);
        const rest = def.rest ? visit(def.rest) : def.rest;
        return patch(s, { items, rest });
      }
      case "record":
      case "map":
        return patch(s, { keyType: visit(def.keyType), valueType: visit(def.valueType) });
      case "set":
        return patch(s, { valueType: visit(def.valueType) });
      case "union":
        return patch(s, { options: (def.options as AnyZod[]).map(visit) });
      case "intersection":
        return patch(s, { left: visit(def.left), right: visit(def.right) });
      case "optional":
      case "nullable":
      case "default":
      case "prefault":
      case "catch":
      case "readonly":
      case "nonoptional":
      case "promise":
      case "success":
        return patch(s, { innerType: visit(def.innerType) });
      case "pipe":
        return patch(s, { in: visit(def.in), out: visit(def.out) });
      case "function":
        return patch(s, { input: visit(def.input), output: visit(def.output) });
      case "lazy": {
        const original = def.getter as () => AnyZod;
        return patch(s, { getter: () => visit(original()) });
      }
      // Leaves: nothing to recurse into.
      default:
        return s;
    }
  }

  return fn(mapInner(schema)) as T;
}
