import * as core from "@zod/core";
import type { AnyFunc } from "@zod/core/util";

/** @deprecated Use `z.core.$ZodIssue` from `@zod/core` instead, especially if you are building a library on top of Zod. */
export type ZodIssue = core.$ZodIssue;

export class ZodError<T = unknown> extends core.$ZodError<T> {
  /** @deprecated Use the `z.formatError(err)` function instead. */
  format(): core.$ZodFormattedError<T>;
  format<U>(mapper: (issue: core.$ZodIssue) => U): core.$ZodFormattedError<T, U>;
  format(mapper?: AnyFunc): any {
    return core.formatError(this, mapper);
  }

  /** @deprecated Use the `z.flattenError(err)` function instead. */
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

export type {
  /** @deprecated Use `z.core.$ZodFlattenedError` instead. */
  $ZodFlattenedError as ZodFlattenedError,
  /** @deprecated Use `z.core.$ZodFormattedError` instead. */
  $ZodFormattedError as ZodFormattedError,
  /** @deprecated Use `z.core.$ZodErrorMap` instead. */
  $ZodErrorMap as ZodErrorMap,
} from "@zod/core";

/** @deprecated Use `z.core.$ZodRawIssue` instead. */
export type IssueData = core.$ZodRawIssue;

// /** @deprecated Use `z.core.$ZodErrorMapCtx` instead. */
// export type ErrorMapCtx = core.$ZodErrorMapCtx;
