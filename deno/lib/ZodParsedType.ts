import { util } from "./helpers/util.ts";

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
]);

export type ZodParsedType = keyof typeof ZodParsedType;
