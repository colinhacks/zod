// Traversal pattern adapted from Jaen's v3 `mapOnSchema` (Apache-2.0):
// https://gist.github.com/jaens/7e15ae1984bb338c86eb5e452dee3010

import type * as schemas from "./schemas.js";
import { clone } from "./util.js";

const RESOLVING: unique symbol = Symbol("z.visit/resolving");
type Resolving = typeof RESOLVING;

type AnyZod = schemas.$ZodType;
type Kind = schemas.$ZodTypeDef["type"];

export type VisitFn = (node: AnyZod) => AnyZod;
export type VisitHandlers = { [K in Kind]?: (node: AnyZod) => AnyZod };

/**
 * Bottom-up rewrite of a schema tree. Every node is visited after its
 * children have been mapped; the returned schema replaces the node.
 * Shared sub-schemas are visited once; lazy nodes defer traversal until
 * parse-time. Direct (non-`lazy`) cycles throw.
 *
 * Branches are only re-cloned when a child reference actually changes,
 * so an identity transform returns the input schema unchanged.
 *
 * Two call shapes:
 *
 *   z.visit(schema, (node) => ...)           // raw callback
 *   z.visit(schema, { object: (o) => ... })  // handler keyed by def.type
 *
 * In handler-map form, kinds with no handler pass through unchanged —
 * including user-defined types whose `def.type` is not one of the
 * built-in variants.
 */
export function visit<T extends schemas.SomeType>(schema: T, fn: VisitFn): T;
export function visit<T extends schemas.SomeType>(schema: T, handlers: VisitHandlers): T;
export function visit<T extends schemas.SomeType>(schema: T, fnOrHandlers: VisitFn | VisitHandlers): T {
  const fn: VisitFn =
    typeof fnOrHandlers === "function"
      ? fnOrHandlers
      : (node) => {
          const h = (fnOrHandlers as VisitHandlers)[node._zod.def.type];
          return h ? h(node) : node;
        };

  const cache = new Map<AnyZod, AnyZod | Resolving>();

  function run(s: AnyZod): AnyZod {
    const cached = cache.get(s);
    if (cached === RESOLVING) {
      throw new Error("z.visit: encountered a non-lazy schema cycle");
    }
    if (cached !== undefined) return cached;
    cache.set(s, RESOLVING);
    const mapped = fn(mapInner(s));
    cache.set(s, mapped);
    return mapped;
  }

  function mapInner(s: AnyZod): AnyZod {
    const def = s._zod.def as any;
    const kind = def.type as Kind;
    switch (kind) {
      case "object": {
        const oldShape = def.shape as Record<string, AnyZod>;
        const keys = Object.keys(oldShape);
        let changed = false;
        const newShape: Record<string, AnyZod> = {};
        for (const k of keys) {
          const mapped = run(oldShape[k]!);
          if (mapped !== oldShape[k]) changed = true;
          newShape[k] = mapped;
        }
        return changed ? clone(s, { ...def, shape: newShape }) : s;
      }
      case "array": {
        const mapped = run(def.element);
        return mapped === def.element ? s : clone(s, { ...def, element: mapped });
      }
      case "tuple": {
        const oldItems = def.items as AnyZod[];
        let changed = false;
        const newItems: AnyZod[] = [];
        for (const item of oldItems) {
          const mapped = run(item);
          if (mapped !== item) changed = true;
          newItems.push(mapped);
        }
        let newRest = def.rest;
        if (def.rest) {
          newRest = run(def.rest);
          if (newRest !== def.rest) changed = true;
        }
        return changed ? clone(s, { ...def, items: newItems, rest: newRest }) : s;
      }
      case "record":
      case "map": {
        const newKey = run(def.keyType);
        const newVal = run(def.valueType);
        return newKey === def.keyType && newVal === def.valueType
          ? s
          : clone(s, { ...def, keyType: newKey, valueType: newVal });
      }
      case "set": {
        const newVal = run(def.valueType);
        return newVal === def.valueType ? s : clone(s, { ...def, valueType: newVal });
      }
      case "union": {
        const oldOptions = def.options as AnyZod[];
        let changed = false;
        const newOptions: AnyZod[] = [];
        for (const opt of oldOptions) {
          const mapped = run(opt);
          if (mapped !== opt) changed = true;
          newOptions.push(mapped);
        }
        return changed ? clone(s, { ...def, options: newOptions }) : s;
      }
      case "intersection": {
        const newLeft = run(def.left);
        const newRight = run(def.right);
        return newLeft === def.left && newRight === def.right
          ? s
          : clone(s, { ...def, left: newLeft, right: newRight });
      }
      case "optional":
      case "nullable":
      case "default":
      case "prefault":
      case "catch":
      case "readonly":
      case "nonoptional":
      case "promise":
      case "success": {
        const newInner = run(def.innerType);
        return newInner === def.innerType ? s : clone(s, { ...def, innerType: newInner });
      }
      case "pipe": {
        const newIn = run(def.in);
        const newOut = run(def.out);
        return newIn === def.in && newOut === def.out ? s : clone(s, { ...def, in: newIn, out: newOut });
      }
      case "function": {
        const newInput = run(def.input);
        const newOutput = run(def.output);
        return newInput === def.input && newOutput === def.output
          ? s
          : clone(s, { ...def, input: newInput, output: newOutput });
      }
      case "lazy": {
        // Can't eagerly invoke the getter — that would trip the cycle
        // check for self-referential schemas. Always wrap the getter so
        // traversal happens at parse-time; this means lazy nodes are
        // unconditionally re-cloned and identity propagates up.
        const original = def.getter as () => AnyZod;
        return clone(s, { ...def, getter: () => run(original()) });
      }
      // Leaves — no child schemas to recurse into.
      case "string":
      case "number":
      case "int":
      case "boolean":
      case "bigint":
      case "symbol":
      case "undefined":
      case "null":
      case "void":
      case "never":
      case "any":
      case "unknown":
      case "date":
      case "nan":
      case "enum":
      case "literal":
      case "file":
      case "template_literal":
      case "transform":
      case "custom":
        return s;
      default: {
        // Compile-time: adding a new built-in `def.type` without handling
        // it here is a type error. Runtime: user-defined types whose
        // `def.type` is outside the built-in union fall through. Users
        // intercept those from inside `fn`.
        kind satisfies never;
        return s;
      }
    }
  }

  return run(schema as unknown as AnyZod) as unknown as T;
}
