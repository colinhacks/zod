import * as core from "@zod/core";
import type { AnyFunc } from "@zod/core/util";

/** @deprecated Re-export of `$ZodIssue` from `@zod/core`. If you are building a library on top of Zod you should import from `@zod/core` instead. */
export type ZodIssue = core.$ZodIssue;

export class ZodError<T = unknown> extends core.$ZodError<T> {
  format(): core.ZodFormattedError<T>;
  format<U>(mapper: (issue: core.$ZodIssue) => U): core.ZodFormattedError<T, U>;
  format(mapper?: AnyFunc): any {
    return core.format(this, mapper);
  }

  flatten(): core.ZodFlattenedError<T>;
  flatten<U>(mapper: (issue: core.$ZodIssue) => U): core.ZodFlattenedError<T, U>;
  flatten(mapper?: AnyFunc): core.ZodFlattenedError<T> {
    return core.flatten(this, mapper);
  }
}

export { flatten, format } from "@zod/core";
export type { ZodFlattenedError, ZodFormattedError } from "@zod/core";
