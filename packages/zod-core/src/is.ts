import type { $ZodCheck, $ZodType } from "./base.js";
import type * as schemas from "./schemas.js";

export function $is(arg: unknown, type: "$ZodType"): arg is $ZodType;
export function $is(arg: unknown, type: "$ZodCheck"): arg is $ZodCheck;
export function $is(
  arg: unknown,
  type: "$ZodString"
): arg is schemas.$ZodString;

export function $is(arg: unknown, type: string) {
  return (arg as any)?.["~traits"].has(type);
}
