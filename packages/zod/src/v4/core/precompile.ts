import type * as schemas from "./schemas.js";
import { JIT_COMPILE_BAG_KEY } from "./util.js";

export interface $ZodPrecompileResult {
  visited: number;
  compiled: number;
}

export function precompile(input: schemas.SomeType | readonly schemas.SomeType[]): $ZodPrecompileResult {
  const stack = Array.isArray(input) ? [...input] : [input];
  const visited = new Set<schemas.SomeType>();
  let compiled = 0;

  while (stack.length) {
    const schema = stack.pop()!;
    if (visited.has(schema)) continue;
    visited.add(schema);

    const compile = (schema._zod.bag as any)[JIT_COMPILE_BAG_KEY];
    if (typeof compile === "function" && compile()) {
      compiled++;
    }

    pushChildren(schema._zod.def, stack);
  }

  return {
    visited: visited.size,
    compiled,
  };
}

function pushChildren(def: unknown, stack: schemas.SomeType[]) {
  if (!isObjectLike(def)) return;

  const seen = new Set<object>();
  const walk = (value: unknown) => {
    if (isSchema(value)) {
      stack.push(value);
      return;
    }

    if (!isObjectLike(value)) return;
    if (seen.has(value)) return;
    seen.add(value);

    if ((value as any).type === "lazy" && typeof (value as any).getter === "function") {
      try {
        walk((value as any).getter());
      } catch (_) {
        // Lazy getter may throw before dependent modules are initialized.
        // Ignore and keep traversal best-effort.
      }
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        walk(item);
      }
      return;
    }

    for (const nested of Object.values(value)) {
      walk(nested);
    }
  };

  walk(def);
}

function isObjectLike(value: unknown): value is Record<PropertyKey, unknown> {
  return !!value && typeof value === "object";
}

function isSchema(value: unknown): value is schemas.SomeType {
  return isObjectLike(value) && "_zod" in value;
}
