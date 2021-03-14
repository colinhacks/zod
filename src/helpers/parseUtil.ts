import { util } from "./util";

export const ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set",
]);

export type ZodParsedType = keyof typeof ZodParsedType;

export const getParsedType = (data: any): ZodParsedType => {
  if (typeof data === "string") return ZodParsedType.string;
  if (typeof data === "number") {
    if (Number.isNaN(data)) return ZodParsedType.nan;
    return ZodParsedType.number;
  }
  if (typeof data === "boolean") return ZodParsedType.boolean;
  if (typeof data === "bigint") return ZodParsedType.bigint;
  if (typeof data === "symbol") return ZodParsedType.symbol;
  if (data instanceof Date) return ZodParsedType.date;
  if (typeof data === "function") return ZodParsedType.function;
  if (data === undefined) return ZodParsedType.undefined;
  if (typeof data === "undefined") return ZodParsedType.undefined;
  if (typeof data === "object") {
    if (Array.isArray(data)) return ZodParsedType.array;
    if (data === null) return ZodParsedType.null;
    if (
      data.then &&
      typeof data.then === "function" &&
      data.catch &&
      typeof data.catch === "function"
    ) {
      return ZodParsedType.promise;
    }
    if (data instanceof Map) {
      return ZodParsedType.map;
    }
    if (data instanceof Set) {
      return ZodParsedType.set;
    }
    return ZodParsedType.object;
  }
  return ZodParsedType.unknown;
};
