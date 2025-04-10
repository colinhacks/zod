import * as core from "@zod/core";
import { $ZodError } from "@zod/core";
import type { util } from "@zod/core";

/** @deprecated Use `z.core.$ZodIssue` from `@zod/core` instead, especially if you are building a library on top of Zod. */
export type ZodIssue = core.$ZodIssue;

export class ZodError<T = unknown> extends $ZodError<T> {
  /** @deprecated Use the `z.treeifyError(err)` function instead. */
  format(): core.$ZodFormattedError<T>;
  /** @deprecated Use the `z.treeifyError(err)` function instead. */
  format<U>(mapper: (issue: core.$ZodIssue) => U): core.$ZodFormattedError<T, U>;
  format(mapper?: util.AnyFunc): any {
    return core.formatError(this, mapper);
  }
  /** @deprecated Use the `z.treeifyError(err)` function instead. */
  flatten(): core.$ZodFlattenedError<T>;
  /** @deprecated Use the `z.treeifyError(err)` function instead. */
  flatten<U>(mapper: (issue: core.$ZodIssue) => U): core.$ZodFlattenedError<T, U>;
  flatten(mapper?: util.AnyFunc): core.$ZodFlattenedError<T> {
    return core.flattenError(this, mapper);
  }
  /** @deprecated Push directly to `.issues` instead. */
  addIssue(issue: core.$ZodIssue): void {
    this.issues.push(issue);
  }
  /** @deprecated Push directly to `.issues` instead. */
  addIssues(issues: core.$ZodIssue[]): void {
    this.issues.push(...issues);
  }
  /** @deprecated Check `err.issues.length === 0` instead. */
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
