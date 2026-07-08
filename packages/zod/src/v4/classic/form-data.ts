/**
 * z.formData — parse HTML FormData into a typed, validated object.
 *
 * Every value in a FormData entry is a string (or File).  This helper
 * bridges that gap by inspecting the target Zod schema for each key and
 * applying the right coercion before validation:
 *
 *   - ZodNumber / ZodCoercedNumber  → Number(value)
 *   - ZodBoolean / ZodCoercedBoolean→ checkbox semantics: "on"|"true"|"1" → true,
 *                                      absent key → false
 *   - ZodDate / ZodCoercedDate      → new Date(value)
 *   - ZodArray                      → FormData.getAll(key) (multi-value)
 *   - ZodFile                       → raw File entry from FormData.get(key)
 *   - ZodString / everything else   → string as-is
 *
 * Keys absent from FormData are omitted from the coerced object so that
 * optional / default / nullable schemas in the shape work as expected.
 *
 * Usage:
 *   const schema = z.formData({
 *     name:    z.string().min(1),
 *     age:     z.number().int().positive(),
 *     agree:   z.boolean(),
 *     tags:    z.array(z.string()),
 *     avatar:  z.file().optional(),
 *   });
 *
 *   // In a server action / route handler:
 *   const result = schema.safeParse(await request.formData());
 */

import type * as core from "../core/index.js";
import * as schemas from "./schemas.js";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Unwrap wrapper schemas (optional, nullable, default, catch, pipe, readonly) to reach the inner type. */
function _unwrap(schema: core.SomeType): core.SomeType {
  const type = schema._zod.def.type;
  if (
    type === "optional" ||
    type === "nullable" ||
    type === "default" ||
    type === "prefault" ||
    type === "catch" ||
    type === "readonly" ||
    type === "nonoptional" ||
    type === "success"
  ) {
    return _unwrap((schema._zod.def as any).innerType);
  }
  if (type === "pipe") {
    return _unwrap((schema._zod.def as any).in);
  }
  return schema;
}

/** Determine whether a schema represents a number (including coerced). */
function _isNumber(s: core.SomeType): boolean {
  const t = _unwrap(s)._zod.def.type;
  return t === "number";
}

/** Determine whether a schema represents a boolean (including coerced). */
function _isBoolean(s: core.SomeType): boolean {
  const t = _unwrap(s)._zod.def.type;
  return t === "boolean";
}

/** Determine whether a schema represents a Date (including coerced). */
function _isDate(s: core.SomeType): boolean {
  const t = _unwrap(s)._zod.def.type;
  return t === "date";
}

/** Determine whether a schema represents a File. */
function _isFile(s: core.SomeType): boolean {
  const t = _unwrap(s)._zod.def.type;
  return t === "file";
}

/** Determine whether a schema represents an array. */
function _isArray(s: core.SomeType): boolean {
  const t = _unwrap(s)._zod.def.type;
  return t === "array";
}

/**
 * Coerce a raw string FormData entry to the type expected by `schema`.
 * Returns the coerced value, or `undefined` for absent checkboxes.
 */
function _coerceEntry(schema: core.SomeType, rawValue: string | File | null): unknown {
  if (_isFile(schema)) {
    return rawValue; // pass File objects through unchanged
  }

  const str = rawValue as string | null;

  if (_isNumber(schema)) {
    if (str === null || str === "") return undefined;
    return Number(str);
  }

  if (_isDate(schema)) {
    if (str === null || str === "") return undefined;
    return new Date(str);
  }

  if (_isBoolean(schema)) {
    // A checkbox that is ticked sends "on"; absent = false
    if (str === null) return false;
    const lo = str.toLowerCase();
    return lo === "on" || lo === "true" || lo === "1" || lo === "yes";
  }

  // String, enum, literal, unknown, any, …
  return str;
}

/**
 * Build a plain-object snapshot from a FormData instance, coercing each
 * entry according to the declared shape.
 */
function _formDataToObject(fd: FormData, shape: core.$ZodLooseShape): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const key of Object.keys(shape)) {
    const fieldSchema: core.SomeType = shape[key];

    if (_isBoolean(fieldSchema)) {
      // Absent checkbox key → false (not missing)
      out[key] = _coerceEntry(fieldSchema, fd.has(key) ? (fd.get(key) as string) : null);
      continue;
    }

    if (_isArray(fieldSchema)) {
      // Multi-value entries — use getAll()
      const rawAll = fd.getAll(key) as (string | File)[];
      const innerSchema: core.SomeType = (_unwrap(fieldSchema)._zod.def as any).element ?? fieldSchema;
      out[key] = rawAll.map((v) => _coerceEntry(innerSchema, v));
      continue;
    }

    const raw = fd.get(key);
    if (raw === null) {
      // Key absent — omit entirely; let optional/default/nullable handle it
      continue;
    }

    out[key] = _coerceEntry(fieldSchema, raw);
  }

  return out;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type ZodFormData<T extends core.$ZodLooseShape> = schemas.ZodPipe<
  schemas.ZodTransform<Record<string, unknown>, unknown>,
  schemas.ZodObject<T>
>;

/**
 * Create a schema that accepts a `FormData` instance and returns a fully
 * typed, validated plain object.
 *
 * @example
 * const schema = z.formData({
 *   username: z.string().min(3),
 *   age:      z.number().int().min(0),
 *   rememberMe: z.boolean(),
 *   avatarFile: z.file().optional(),
 *   tags:     z.array(z.string()),
 * });
 *
 * const parsed = schema.parse(await request.formData());
 * //    ^? { username: string; age: number; rememberMe: boolean; avatarFile?: File; tags: string[] }
 */
export function formData<T extends core.$ZodLooseShape>(
  shape: T,
  params?: string | core.$ZodObjectParams
): ZodFormData<core.util.Writeable<T>> {
  const objectSchema = schemas.object(shape, params);

  const preprocessSchema = schemas.preprocess((input, ctx) => {
    if (!(input instanceof FormData)) {
      ctx.addIssue({
        code: "custom",
        message: "Expected a FormData instance",
        input,
      });
      return input;
    }
    return _formDataToObject(input, shape as core.$ZodLooseShape);
  }, objectSchema);

  return preprocessSchema as unknown as ZodFormData<core.util.Writeable<T>>;
}
