import type { $ZodType } from "./schemas.js";

/**
 * Recursively walks a zod schema tree and resolves every pipe/codec to its
 * `.out` (output) schema. The result is a new zod schema that validates the
 * *decoded* shape — useful when a framework needs to validate data that has
 * already been through the codec's decode step.
 *
 * When the subtree contains no pipes/codecs the **same instance** is returned
 * (zero extra allocations for codec-free schemas).
 */
export function toOutputSchema<T extends $ZodType>(schema: T): T {
  return recurse(schema) as T;
}

const _cache = new WeakMap<$ZodType, $ZodType>();

function recurse(schema: $ZodType): $ZodType {
  if (_cache.has(schema)) return _cache.get(schema)!;

  // Eagerly store — handles cycles (lazy schemas that reference themselves).
  _cache.set(schema, schema);

  // Cast to `any` because $ZodTypeDef only declares `type` + `checks`;
  // the child-specific properties (innerType, shape, element, …) live on
  // the concrete def sub-interfaces.
  const def: any = schema._zod.def;
  let result: $ZodType;

  switch (def.type as string) {
    // ── Leaf types — return as-is ──────────────────────────────────────
    case "string":
    case "number":
    case "int":
    case "boolean":
    case "bigint":
    case "symbol":
    case "null":
    case "undefined":
    case "void":
    case "never":
    case "any":
    case "unknown":
    case "date":
    case "enum":
    case "literal":
    case "nan":
    case "template_literal":
    case "file":
    case "success":
    case "custom":
    case "function":
    case "transform":
      result = schema;
      break;

    // ── Pipe / codec — resolve to the output side ──────────────────────
    case "pipe": {
      result = recurse(def.out);
      break;
    }

    // ── Single-child wrappers ──────────────────────────────────────────
    case "optional":
    case "nullable":
    case "nonoptional":
    case "default":
    case "prefault":
    case "catch":
    case "readonly":
    case "promise": {
      const inner = def.innerType as $ZodType;
      const newInner = recurse(inner);
      if (newInner === inner) {
        result = schema;
      } else {
        result = new (schema._zod.constr as any)({ ...def, innerType: newInner });
      }
      break;
    }

    // ── Object ─────────────────────────────────────────────────────────
    case "object": {
      const shape: Record<string, $ZodType> = def.shape;
      let changed = false;
      const newShape: Record<string, $ZodType> = {};
      for (const key in shape) {
        const field = shape[key]!;
        const newField = recurse(field);
        newShape[key] = newField;
        if (newField !== field) changed = true;
      }
      let newCatchall = def.catchall as $ZodType | undefined;
      if (newCatchall) {
        const resolved = recurse(newCatchall);
        if (resolved !== newCatchall) {
          newCatchall = resolved;
          changed = true;
        }
      }
      if (changed) {
        result = new (schema._zod.constr as any)({ ...def, shape: newShape, catchall: newCatchall });
      } else {
        result = schema;
      }
      break;
    }

    // ── Array ──────────────────────────────────────────────────────────
    case "array": {
      const element = def.element as $ZodType;
      const newElement = recurse(element);
      if (newElement === element) {
        result = schema;
      } else {
        result = new (schema._zod.constr as any)({ ...def, element: newElement });
      }
      break;
    }

    // ── Union ──────────────────────────────────────────────────────────
    case "union": {
      const options: readonly $ZodType[] = def.options;
      let changed = false;
      const newOptions = options.map((opt) => {
        const newOpt = recurse(opt);
        if (newOpt !== opt) changed = true;
        return newOpt;
      });
      if (changed) {
        result = new (schema._zod.constr as any)({ ...def, options: newOptions });
      } else {
        result = schema;
      }
      break;
    }

    // ── Intersection ───────────────────────────────────────────────────
    case "intersection": {
      const left = def.left as $ZodType;
      const right = def.right as $ZodType;
      const newLeft = recurse(left);
      const newRight = recurse(right);
      if (newLeft === left && newRight === right) {
        result = schema;
      } else {
        result = new (schema._zod.constr as any)({ ...def, left: newLeft, right: newRight });
      }
      break;
    }

    // ── Tuple ──────────────────────────────────────────────────────────
    case "tuple": {
      const items: readonly $ZodType[] = def.items;
      let changed = false;
      const newItems = items.map((item) => {
        const newItem = recurse(item);
        if (newItem !== item) changed = true;
        return newItem;
      });
      let newRest = def.rest as $ZodType | null;
      if (newRest) {
        const resolvedRest = recurse(newRest);
        if (resolvedRest !== newRest) {
          newRest = resolvedRest;
          changed = true;
        }
      }
      if (changed) {
        result = new (schema._zod.constr as any)({ ...def, items: newItems, rest: newRest });
      } else {
        result = schema;
      }
      break;
    }

    // ── Record ─────────────────────────────────────────────────────────
    case "record": {
      const keyType = def.keyType as $ZodType;
      const valueType = def.valueType as $ZodType;
      const newKeyType = recurse(keyType);
      const newValueType = recurse(valueType);
      if (newKeyType === keyType && newValueType === valueType) {
        result = schema;
      } else {
        result = new (schema._zod.constr as any)({ ...def, keyType: newKeyType, valueType: newValueType });
      }
      break;
    }

    // ── Map ────────────────────────────────────────────────────────────
    case "map": {
      const keyType = def.keyType as $ZodType;
      const valueType = def.valueType as $ZodType;
      const newKeyType = recurse(keyType);
      const newValueType = recurse(valueType);
      if (newKeyType === keyType && newValueType === valueType) {
        result = schema;
      } else {
        result = new (schema._zod.constr as any)({ ...def, keyType: newKeyType, valueType: newValueType });
      }
      break;
    }

    // ── Set ────────────────────────────────────────────────────────────
    case "set": {
      const valueType = def.valueType as $ZodType;
      const newValueType = recurse(valueType);
      if (newValueType === valueType) {
        result = schema;
      } else {
        result = new (schema._zod.constr as any)({ ...def, valueType: newValueType });
      }
      break;
    }

    // ── Lazy ───────────────────────────────────────────────────────────
    case "lazy": {
      const getter = def.getter as () => $ZodType;
      result = new (schema._zod.constr as any)({
        ...def,
        getter: () => recurse(getter()),
      });
      break;
    }

    // ── Fallback: unknown type — return as-is ──────────────────────────
    default:
      result = schema;
  }

  _cache.set(schema, result);
  return result;
}
