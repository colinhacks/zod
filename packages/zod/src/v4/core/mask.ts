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
  const id = data.id;
  if (id != null && (typeof id === "string" || typeof id === "number" || typeof id === "bigint")) return String(id);
  let composite = "";
  for (const key in shape) {
    if (shape[key]!._zod.bag.mask && typeof data[key] === "string") composite += data[key];
  }
  return composite || parentSeed;
}

function hasMask(schema: schemas.$ZodType, seen: WeakSet<schemas.$ZodType> = new WeakSet()): boolean {
  if (seen.has(schema)) return false;
  seen.add(schema);
  if (schema._zod.bag.mask !== undefined) return true;
  const def: any = schema._zod.def;
  switch (def.type) {
    case "object":
      for (const k in def.shape) {
        if (hasMask(def.shape[k]!, seen)) return true;
      }
      return false;
    case "array":
      return hasMask(def.element, seen);
    case "record":
      return hasMask(def.valueType, seen);
    case "tuple":
      if (def.items.some((item: schemas.$ZodType) => hasMask(item, seen))) return true;
      return def.rest ? hasMask(def.rest, seen) : false;
    case "map":
      return hasMask(def.valueType, seen);
    case "set":
      return hasMask(def.valueType, seen);
    case "optional":
    case "nullable":
    case "default":
    case "readonly":
    case "catch":
    case "nonoptional":
    case "prefault":
      return hasMask(def.innerType, seen);
    case "pipe":
      return hasMask(def.in, seen) || hasMask(def.out, seen);
    case "union":
      return def.options.some((o: schemas.$ZodType) => hasMask(o, seen));
    case "lazy":
      return hasMask(def.getter(), seen);
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
    case "record": {
      if (typeof data !== "object" || data === null || Array.isArray(data)) return data;
      const rec = data as Record<string, unknown>;
      const inpRec = (typeof inp === "object" && inp !== null && !Array.isArray(inp) ? inp : rec) as Record<
        string,
        unknown
      >;
      const result: Record<string, unknown> = {};
      for (const k in rec) {
        result[k] = rec[k] != null ? applyMask(def.valueType, rec[k], seed, k, inpRec[k]) : rec[k];
      }
      return result as T;
    }
    case "tuple": {
      if (!Array.isArray(data)) return data;
      const inputArr = Array.isArray(inp) ? inp : data;
      const items = def.items as schemas.$ZodType[];
      return data.map((item, i) => {
        const schema = i < items.length ? items[i]! : def.rest;
        return schema && item != null ? applyMask(schema, item, seed, key, inputArr[i]) : item;
      }) as T;
    }
    case "map": {
      if (!(data instanceof Map)) return data;
      const inpMap = inp instanceof Map ? inp : data;
      const result = new Map();
      for (const [k, v] of data) {
        result.set(k, v != null ? applyMask(def.valueType, v, seed, String(k), inpMap.get(k)) : v);
      }
      return result as T;
    }
    case "set": {
      if (!(data instanceof Set)) return data;
      const result = new Set();
      for (const v of data) {
        result.add(v != null ? applyMask(def.valueType, v, seed, key) : v);
      }
      return result as T;
    }
    case "optional":
    case "nullable":
    case "default":
    case "readonly":
    case "catch":
    case "nonoptional":
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
    case "record": {
      if (typeof data !== "object" || data === null || Array.isArray(data)) return data;
      const rec = data as Record<string, unknown>;
      const inpRec = (typeof inp === "object" && inp !== null && !Array.isArray(inp) ? inp : rec) as Record<
        string,
        unknown
      >;
      const result: Record<string, unknown> = {};
      for (const k in rec) {
        result[k] = rec[k] != null ? await applyMaskAsync(def.valueType, rec[k], seed, k, inpRec[k]) : rec[k];
      }
      return result as T;
    }
    case "tuple": {
      if (!Array.isArray(data)) return data;
      const inputArr = Array.isArray(inp) ? inp : data;
      const items = def.items as schemas.$ZodType[];
      return Promise.all(
        data.map((item, i) => {
          const schema = i < items.length ? items[i]! : def.rest;
          return schema && item != null ? applyMaskAsync(schema, item, seed, key, inputArr[i]) : item;
        })
      ) as Promise<T>;
    }
    case "map": {
      if (!(data instanceof Map)) return data;
      const inpMap = inp instanceof Map ? inp : data;
      const result = new Map();
      for (const [k, v] of data) {
        result.set(k, v != null ? await applyMaskAsync(def.valueType, v, seed, String(k), inpMap.get(k)) : v);
      }
      return result as T;
    }
    case "set": {
      if (!(data instanceof Set)) return data;
      const result = new Set();
      for (const v of data) {
        result.add(v != null ? await applyMaskAsync(def.valueType, v, seed, key) : v);
      }
      return result as T;
    }
    case "optional":
    case "nullable":
    case "default":
    case "readonly":
    case "catch":
    case "nonoptional":
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
