import type * as schemas from "./schemas.js";

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return h >>> 0;
}

function resolveSeed(
  shape: Record<string, schemas.$ZodType>,
  data: Record<string, unknown>,
  parentSeed: string
): string {
  if (typeof data.id === "string" && data.id) return data.id;
  let composite = "";
  for (const key in shape) {
    if (shape[key]!._zod.bag.mask && typeof data[key] === "string") composite += data[key];
  }
  return composite || parentSeed;
}

function hasMask(schema: schemas.$ZodType): boolean {
  if (schema._zod.bag.mask !== undefined) return true;
  const def: any = schema._zod.def;
  switch (def.type) {
    case "object":
      for (const k in def.shape) {
        if (hasMask(def.shape[k]!)) return true;
      }
      return false;
    case "array":
      return hasMask(def.element);
    case "optional":
    case "nullable":
    case "default":
    case "readonly":
    case "catch":
    case "nonoptional":
    case "success":
    case "prefault":
      return hasMask(def.innerType);
    case "pipe":
      return hasMask(def.in) || hasMask(def.out);
    case "union":
      return def.options.some((o: schemas.$ZodType) => hasMask(o));
    case "lazy":
      return hasMask(def.getter());
    default:
      return false;
  }
}

export function applyMask<T>(schema: schemas.$ZodType, data: T, seed: string, key = "", input?: unknown): T {
  if (data == null) return data;

  const mask = schema._zod.bag.mask;
  if (mask !== undefined) {
    const s = seed || String(data);
    if (typeof mask === "function") return mask(s) as T;
    if (Array.isArray(mask)) return mask[hash(s + key) % mask.length] as T;
    return mask as T;
  }

  const def: any = schema._zod.def;
  const inp = input ?? data;
  switch (def.type) {
    case "object": {
      if (typeof data !== "object" || Array.isArray(data)) return data;
      const shape = def.shape as Record<string, schemas.$ZodType>;
      const record = data as Record<string, unknown>;
      const inputRecord = (typeof inp === "object" && inp !== null && !Array.isArray(inp) ? inp : record) as Record<
        string,
        unknown
      >;
      const objectSeed = resolveSeed(shape, record, seed);
      const result = { ...record };
      for (const k in shape) {
        if (k in result && result[k] != null)
          result[k] = applyMask(shape[k]!, result[k], objectSeed, k, inputRecord[k]);
      }
      return result as T;
    }
    case "array": {
      if (!Array.isArray(data)) return data;
      const inputArr = Array.isArray(inp) ? inp : data;
      return data.map((item, i) => applyMask(def.element, item, seed, key, inputArr[i])) as T;
    }
    case "optional":
    case "nullable":
    case "default":
    case "readonly":
    case "catch":
    case "nonoptional":
    case "success":
    case "prefault":
      return applyMask(def.innerType, data, seed, key, inp);
    case "pipe":
      if (hasMask(def.out)) return applyMask(def.out, data, seed, key, inp);
      return applyMask(def.in, data, seed, key, inp);
    case "union": {
      for (const option of def.options as schemas.$ZodType[]) {
        const result = option._zod.run({ value: inp, issues: [] }, { async: false });
        if (!(result instanceof Promise) && result.issues.length === 0) return applyMask(option, data, seed, key, inp);
      }
      return data;
    }
    case "lazy":
      return applyMask(def.getter(), data, seed, key, inp);
    default:
      return data;
  }
}

export async function applyMaskAsync<T>(
  schema: schemas.$ZodType,
  data: T,
  seed: string,
  key = "",
  input?: unknown
): Promise<T> {
  if (data == null) return data;

  const mask = schema._zod.bag.mask;
  if (mask !== undefined) {
    const s = seed || String(data);
    if (typeof mask === "function") return mask(s) as T;
    if (Array.isArray(mask)) return mask[hash(s + key) % mask.length] as T;
    return mask as T;
  }

  const def: any = schema._zod.def;
  const inp = input ?? data;
  switch (def.type) {
    case "object": {
      if (typeof data !== "object" || Array.isArray(data)) return data;
      const shape = def.shape as Record<string, schemas.$ZodType>;
      const record = data as Record<string, unknown>;
      const inputRecord = (typeof inp === "object" && inp !== null && !Array.isArray(inp) ? inp : record) as Record<
        string,
        unknown
      >;
      const objectSeed = resolveSeed(shape, record, seed);
      const result = { ...record };
      for (const k in shape) {
        if (k in result && result[k] != null)
          result[k] = await applyMaskAsync(shape[k]!, result[k], objectSeed, k, inputRecord[k]);
      }
      return result as T;
    }
    case "array": {
      if (!Array.isArray(data)) return data;
      const inputArr = Array.isArray(inp) ? inp : data;
      return Promise.all(
        data.map((item, i) => applyMaskAsync(def.element, item, seed, key, inputArr[i]))
      ) as Promise<T>;
    }
    case "optional":
    case "nullable":
    case "default":
    case "readonly":
    case "catch":
    case "nonoptional":
    case "success":
    case "prefault":
      return applyMaskAsync(def.innerType, data, seed, key, inp);
    case "pipe":
      if (hasMask(def.out)) return applyMaskAsync(def.out, data, seed, key, inp);
      return applyMaskAsync(def.in, data, seed, key, inp);
    case "union": {
      for (const option of def.options as schemas.$ZodType[]) {
        let result = option._zod.run({ value: inp, issues: [] }, { async: true });
        if (result instanceof Promise) result = await result;
        if (result.issues.length === 0) return applyMaskAsync(option, data, seed, key, inp);
      }
      return data;
    }
    case "lazy":
      return applyMaskAsync(def.getter(), data, seed, key, inp);
    default:
      return data;
  }
}
