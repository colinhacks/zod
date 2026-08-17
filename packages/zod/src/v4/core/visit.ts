// Traversal pattern adapted from Jaen's v3 `mapOnSchema` (Apache-2.0): https://gist.github.com/jaens/7e15ae1984bb338c86eb5e452dee3010

import * as schemas from "./schemas.js";
import { clone } from "./util.js";

const RESOLVING: unique symbol = Symbol("z.visit/resolving");
type Resolving = typeof RESOLVING;

type AnyZod = schemas.$ZodType;
type Kind = schemas.$ZodTypeDef["type"];

/** The concrete schema class for a `def.type`, or `$ZodType` for kinds with no dedicated class. */
type SchemaOfKind<K extends Kind> = [Extract<schemas.$ZodTypes, { _zod: { def: { type: K } } }>] extends [never]
  ? AnyZod
  : Extract<schemas.$ZodTypes, { _zod: { def: { type: K } } }>;

export type VisitFn = (node: AnyZod) => AnyZod;
export type VisitHandlers = { [K in Kind]?: (node: SchemaOfKind<K>) => AnyZod };

/**
 * @internal Bottom-up rewrite of a schema tree. Unhandled kinds and unchanged branches keep their
 * identity. Returns `$ZodType`: a visitor can swap in a schema of any type, so callers declare
 * their own return type.
 */
export function visit(schema: schemas.SomeType, fn: VisitFn): AnyZod;
export function visit(schema: schemas.SomeType, handlers: VisitHandlers): AnyZod;
export function visit(schema: schemas.SomeType, fnOrHandlers: VisitFn | VisitHandlers): AnyZod {
  const fn: VisitFn =
    typeof fnOrHandlers === "function"
      ? fnOrHandlers
      : (node) => {
          // A union of handlers isn't callable with one argument; handler `K` only ever sees kind `K`.
          const h = (fnOrHandlers as VisitHandlers)[node._zod.def.type] as ((n: AnyZod) => AnyZod) | undefined;
          return h ? h(node) : node;
        };

  const cache = new Map<AnyZod, AnyZod | Resolving>();

  function run(s: AnyZod): AnyZod {
    const cached = cache.get(s);
    if (cached === RESOLVING) {
      // Non-lazy cycle. Defer to parse time, when the cache holds the finished node.
      return new schemas.$ZodLazy({
        type: "lazy",
        getter: () => cache.get(s) as AnyZod,
      });
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
        let newCatchall = def.catchall;
        if (def.catchall) {
          newCatchall = run(def.catchall);
          if (newCatchall !== def.catchall) changed = true;
        }
        return changed ? clone(s, { ...def, shape: newShape, catchall: newCatchall }) : s;
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
        // Invoking the getter here would trip the cycle check, so lazy nodes always re-clone.
        const original = def.getter as () => AnyZod;
        // Drop the memo, or it shadows the new getter forever.
        const { _cachedInner, ...rest } = def;
        return clone(s, { ...rest, getter: () => run(original()) });
      }
      // A leaf by choice: `parts` are regex fragments, not data positions.
      case "template_literal":
      // Leaves.
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
      case "transform":
      case "custom":
        return s;
      default: {
        // A new built-in kind becomes a compile error here; unknown user kinds fall through.
        kind satisfies never;
        return s;
      }
    }
  }

  return run(schema as AnyZod);
}
