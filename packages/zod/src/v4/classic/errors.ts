import * as core from "../core/index.js";
import { $ZodError } from "../core/index.js";
import * as util from "../core/util.js";

/** @deprecated Use `z.core.$ZodIssue` from `@zod/core` instead, especially if you are building a library on top of Zod. */
export type ZodIssue = core.$ZodIssue;

/** An Error-like class used to store Zod validation issues.  */
export interface ZodError<T = unknown> extends $ZodError<T> {
  /** @deprecated Use the `z.treeifyError(err)` function instead. */
  format(): core.$ZodFormattedError<T>;
  format<U>(mapper: (issue: core.$ZodIssue) => U): core.$ZodFormattedError<T, U>;
  /** @deprecated Use the `z.treeifyError(err)` function instead. */
  flatten(): core.$ZodFlattenedError<T>;
  flatten<U>(mapper: (issue: core.$ZodIssue) => U): core.$ZodFlattenedError<T, U>;
  /** @deprecated Push directly to `.issues` instead. */
  addIssue(issue: core.$ZodIssue): void;
  /** @deprecated Push directly to `.issues` instead. */
  addIssues(issues: core.$ZodIssue[]): void;

  /** @deprecated Check `err.issues.length === 0` instead. */
  isEmpty: boolean;
}

/* Prototypes that already carry the lazy helper methods. Seeded with the
 * intrinsics so that `init` on a foreign object — it accepts any object —
 * can never install an accessor onto a prototype we do not own. */
const _installedErrorProtos = /* @__PURE__ */ new WeakSet<object>([Object.prototype, Error.prototype]);

/* Helper methods live as non-enumerable lazy getters on the shared
 * prototype instead of own properties on every instance. On first
 * access the getter allocates the per-instance closure and caches it
 * as a non-enumerable own property, so detached usage still works and
 * the allocation only happens for methods actually touched. */
function _lazyMethod(proto: object, key: string, make: (self: ZodError) => unknown): void {
  Object.defineProperty(proto, key, {
    configurable: true,
    enumerable: false,
    get(this: ZodError) {
      const value = make(this);
      Object.defineProperty(this, key, { value, configurable: true, writable: true });
      return value;
    },
    set(this: ZodError, value: unknown) {
      Object.defineProperty(this, key, { value, configurable: true, writable: true });
    },
  });
}

const initializer = (inst: ZodError, issues: core.$ZodIssue[]) => {
  $ZodError.init(inst, issues);
  inst.name = "ZodError";

  const proto = Object.getPrototypeOf(inst);
  if (_installedErrorProtos.has(proto)) return;
  _installedErrorProtos.add(proto);

  _lazyMethod(proto, "format", (self) => (mapper: any) => core.formatError(self, mapper));
  _lazyMethod(proto, "flatten", (self) => (mapper: any) => core.flattenError(self, mapper));
  _lazyMethod(proto, "addIssue", (self) => (issue: any) => {
    self.issues.push(issue);
    self.message = JSON.stringify(self.issues, util.jsonStringifyReplacer, 2);
  });
  _lazyMethod(proto, "addIssues", (self) => (issues: any) => {
    self.issues.push(...issues);
    self.message = JSON.stringify(self.issues, util.jsonStringifyReplacer, 2);
  });
  Object.defineProperty(proto, "isEmpty", {
    configurable: true,
    enumerable: false,
    get(this: ZodError) {
      return this.issues.length === 0;
    },
  });
};
export const ZodError: core.$constructor<ZodError> = /*@__PURE__*/ core.$constructor("ZodError", initializer);
export const ZodRealError: core.$constructor<ZodError> = /*@__PURE__*/ core.$constructor("ZodError", initializer, {
  Parent: Error,
});

/** @deprecated Use `z.core.$ZodFlattenedError` instead. */
export type ZodFlattenedError<T, U = string> = core.$ZodFlattenedError<T, U>;
/** @deprecated Use `z.core.$ZodFormattedError` instead. */
export type ZodFormattedError<T, U = string> = core.$ZodFormattedError<T, U>;
/** @deprecated Use `z.core.$ZodErrorMap` instead. */
export type ZodErrorMap<T extends core.$ZodIssueBase = core.$ZodIssue> = core.$ZodErrorMap<T>;

/** @deprecated Use `z.core.$ZodRawIssue` instead. */
export type IssueData = core.$ZodRawIssue;

// /** @deprecated Use `z.core.$ZodErrorMapCtx` instead. */
// export type ErrorMapCtx = core.$ZodErrorMapCtx;
