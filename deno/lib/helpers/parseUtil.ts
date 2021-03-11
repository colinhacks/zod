import { util } from "./util.ts";

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
  if (typeof data === "string") return "string";
  if (typeof data === "number") {
    if (Number.isNaN(data)) return "nan";
    return "number";
  }
  if (typeof data === "boolean") return "boolean";
  if (typeof data === "bigint") return "bigint";
  if (typeof data === "symbol") return "symbol";
  if (data instanceof Date) return "date";
  if (typeof data === "function") return "function";
  if (data === undefined) return "undefined";
  if (typeof data === "undefined") return "undefined";
  if (typeof data === "object") {
    if (Array.isArray(data)) return "array";
    if (data === null) return "null";
    if (
      data.then &&
      typeof data.then === "function" &&
      data.catch &&
      typeof data.catch === "function"
    ) {
      return "promise";
    }
    if (data instanceof Map) {
      return "map";
    }
    if (data instanceof Set) {
      return "set";
    }
    return "object";
  }
  return "unknown";
};
