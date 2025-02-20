import * as core from "@zod/core";
import type { AnyFunc } from "@zod/core/util";

/** @deprecated Use `$ZodIssue` from `@zod/core` instead, especially if you are building a library on top of Zod. */
export type ZodIssue = core.$ZodIssue;

export class ZodError<T = unknown> extends core.$ZodError<T> {
  format(): core.$ZodFormattedError<T>;
  format<U>(mapper: (issue: core.$ZodIssue) => U): core.$ZodFormattedError<T, U>;
  format(mapper?: AnyFunc): any {
    return core.formatError(this, mapper);
  }

  flatten(): core.$ZodFlattenedError<T>;
  flatten<U>(mapper: (issue: core.$ZodIssue) => U): core.$ZodFlattenedError<T, U>;
  flatten(mapper?: AnyFunc): core.$ZodFlattenedError<T> {
    return core.flattenError(this, mapper);
  }

  addIssue(issue: core.$ZodIssue): void {
    this.issues.push(issue);
  }
  addIssues(issues: core.$ZodIssue[]): void {
    this.issues.push(...issues);
  }

  get isEmpty(): boolean {
    return this.issues.length === 0;
  }
}

export { flattenError, formatError } from "@zod/core";

export type {
  /** @deprecated Use `$ZodFlattenedError` from `@zod/core` instead. */
  $ZodFlattenedError as ZodFlattenedError,
  /** @deprecated Use `$ZodFormattedError` from `@zod/core` instead. */
  $ZodFormattedError as ZodFormattedError,
  /** @deprecated Use `$ZodErrorMap` from `@zod/core` instead. */
  $ZodErrorMap as ZodErrorMap,
} from "@zod/core";

/** @deprecated Use `$ZodRawIssue` instead. */
export type IssueData = core.$ZodRawIssue;

// /** @deprecated Use `$ZodErrorMapCtx` from `@zod/core` instead. */
// // export type ErrorMapCtx = core.$ZodErrorMapCtx;
