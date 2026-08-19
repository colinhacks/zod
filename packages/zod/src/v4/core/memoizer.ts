import type * as errors from "./errors.js";
import type { $ZodMemoizer, $ZodType, ParseContextInternal, ParsePayload } from "./schemas.js";
import type * as util from "./util.js";

export class $ZodCyclicError extends Error {
  constructor() {
    super(`Cannot parse a reference cycle that closes through a transform`);
    this.name = "ZodCyclicError";
  }
}

interface Entry {
  value: unknown;
  /** `null` until the node's children are parsed. */
  issues: errors.$ZodRawIssue[] | null;
}

interface State {
  buckets: Map<$ZodType, Map<object, Entry>>;
  /** Nodes a back-edge resolved to before they finished. */
  backEdges: Set<object> | undefined;
}

/** Keyed off the context object every schema in one parse call already shares. */
const STATE = "~memo";
type WithState = { [STATE]?: State };

const NO_ISSUES: errors.$ZodRawIssue[] = [];

interface Memoizer extends $ZodMemoizer {
  recursive: boolean | undefined;
  /** Set immediately before delegating to core and cleared immediately after, so
   * `alloc` registers only for a visit this module is driving. */
  handoff: Map<object, Entry> | undefined;
  /** `bucket` memoized for one parse; a recursive schema is re-entered many
   * times and its bucket never changes. */
  ctx: object | undefined;
  bucket: Map<object, Entry> | undefined;
  /** Allocated but unfinished entries. `alloc` and the matching pop both happen
   * in the synchronous part of a parse, so they nest even when children are async. */
  open: Entry[];
}

const recursive: WeakMap<object, boolean> = /*@__PURE__*/ new WeakMap();

/** Whether this schema's subtree contains a cycle, so one parse can re-enter it. */
function isRecursive(inst: $ZodType, stack: Set<object>): boolean {
  const cached = recursive.get(inst);
  if (cached !== undefined) return cached;
  // Relative to the walk in progress, so not cached.
  if (stack.has(inst)) return true;
  stack.add(inst);

  let result = false;
  const check = (child: any) => {
    if (!result && child?._zod && isRecursive(child, stack)) result = true;
  };

  const def = inst._zod.def as any;
  if (def.type === "lazy") {
    check((inst as any)._zod.innerType);
  } else {
    // $ZodObject redefines `shape` as a non-enumerable accessor, so `for...in` misses it.
    const shape = def.shape;
    if (shape) for (const key in shape) check(shape[key]);
    for (const key in def) {
      const value = def[key];
      if (!value || typeof value !== "object") continue;
      if (value._zod) check(value);
      else if (Array.isArray(value)) for (const el of value) check(el);
    }
  }

  stack.delete(inst);
  recursive.set(inst, result);
  return result;
}

/**
 * Whether one parse can re-enter this schema, i.e. its subtree contains a cycle.
 * Exported for `z.compile`, which refuses to compile such a schema: cycle
 * breaking is driven from here off state keyed on the parse context, and a
 * generated fast path has no context to key on.
 */
export function isRecursiveSchema(inst: $ZodType): boolean {
  return isRecursive(inst, new Set());
}

function bucketFor(state: State, inst: $ZodType): Map<object, Entry> {
  let bucket = state.buckets.get(inst);
  if (!bucket) {
    bucket = new Map();
    state.buckets.set(inst, bucket);
  }
  return bucket;
}

/**
 * Gives a container cycle support. Call before the container's `init`, which
 * reads the memoizer once and closes over it.
 */
export function attachMemoizer(inst: $ZodType): void {
  const m: Memoizer = {
    recursive: undefined,
    handoff: undefined,
    ctx: undefined,
    bucket: undefined,
    open: [],
    alloc(_inst, payload, empty) {
      const bucket = m.handoff;
      if (!bucket) return empty;
      m.handoff = undefined;
      const entry: Entry = { value: empty, issues: null };
      bucket.set(payload.value as object, entry);
      m.open.push(entry);
      return empty;
    },
  };
  inst._zod.memoizer = m;

  // Wraps `parse`, not `run`. `run` is assigned by a deferred of core's own that would replace anything installed here first; wrapping `parse` reaches both ways core builds `run` — it copies `parse` when there are no checks, and reads it dynamically when there are.
  inst._zod.deferred ??= [];
  inst._zod.deferred.push(() => {
    const base = inst._zod.parse;

    const wrapped = (payload: ParsePayload, ctx: ParseContextInternal): util.MaybeAsync<ParsePayload> => {
      if (m.recursive === undefined) {
        m.recursive = isRecursive(inst, new Set());
        if (!m.recursive) {
          // Nothing here can ever fire, so take it back out. `run` has to be checked too: with no checks on the schema, core copies `parse` into it rather than reading it each time.
          inst._zod.parse = base;
          if (inst._zod.run === wrapped) inst._zod.run = base;
          return base(payload, ctx);
        }
      }

      const input = payload.value;
      if (input === null || typeof input !== "object") return base(payload, ctx);

      let state = (ctx as WithState)[STATE];
      if (!state) {
        state = { buckets: new Map(), backEdges: undefined };
        (ctx as WithState)[STATE] = state;
      }

      let bucket: Map<object, Entry>;
      if (m.ctx === ctx) {
        bucket = m.bucket!;
      } else {
        bucket = bucketFor(state, inst);
        m.ctx = ctx;
        m.bucket = bucket;
      }

      const hit = bucket.get(input);
      if (hit) {
        payload.value = hit.value;
        if (hit.issues) {
          payload.issues.push(...hit.issues);
        } else {
          // Still being parsed: its own checks cover it, so skip them here.
          payload.memo = true;
          state.backEdges ??= new Set();
          state.backEdges.add(hit.value as object);
        }
        return payload;
      }

      m.handoff = bucket;
      const depth = m.open.length;
      const result = base(payload, ctx);
      m.handoff = undefined;
      // A container that rejected its input outright allocated nothing.
      const entry = m.open.length > depth ? m.open.pop()! : undefined;

      // Both paths written out so the sync one allocates no closure. It runs once per node, and capturing here cost more than everything else combined.
      if (result instanceof Promise) {
        return result.then((r) => {
          if (entry) entry.issues = r.issues.length ? r.issues.slice() : NO_ISSUES;
          return r;
        });
      }
      if (entry) entry.issues = result.issues.length ? result.issues.slice() : NO_ISSUES;
      return result;
    };

    inst._zod.parse = wrapped;
  });
}

/** Whether this value is a node a back-edge resolved to before it finished. */
export function isBackEdge(ctx: object, value: unknown): boolean {
  const backEdges = (ctx as WithState)[STATE]?.backEdges;
  return backEdges !== undefined && value !== null && typeof value === "object" && backEdges.has(value);
}
