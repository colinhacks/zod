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

// Receivers prefix paths in place, so the cache and every hand-out need their own copies.
function cloneIssues(issues: errors.$ZodRawIssue[]): errors.$ZodRawIssue[] {
  return issues.map((iss) => (iss.path ? { ...iss, path: iss.path.slice() } : { ...iss }));
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
    // `for...in` skips symbols, so a cycle through a declared symbol key would read as non-recursive
    if (shape) for (const key of Reflect.ownKeys(shape)) check(shape[key]);
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

// Set immediately before delegating to core and cleared immediately after, so `alloc` registers only for a visit this module is driving.
let handoff: Map<object, Entry> | undefined;

// Allocated but unfinished entries. `alloc` and the matching pop both happen in the synchronous part of a parse, so they nest even when children are async, and one stack serves every schema.
const open: Entry[] = [];

const memo: $ZodMemoizer = {
  alloc(_inst, payload, empty) {
    const bucket = handoff;
    if (!bucket) return empty;
    handoff = undefined;
    const entry: Entry = { value: empty, issues: null };
    bucket.set(payload.value as object, entry);
    open.push(entry);
    return empty;
  },

  guard(inst) {
    inst._zod.deferred ??= [];
    inst._zod.deferred.push(() => {
      const base = inst._zod.parse;
      const wrapped = (payload: ParsePayload, ctx: ParseContextInternal): util.MaybeAsync<ParsePayload> => {
        // The value is a placeholder a back-edge is still waiting on, so the cycle closes through this transform. Its output can't exist in time to bind.
        if (ctx.direction !== "backward" && isBackEdge(ctx, payload.value)) throw new $ZodCyclicError();
        return base(payload, ctx);
      };
      inst._zod.parse = wrapped;
      if (inst._zod.run === base) inst._zod.run = wrapped;
    });
  },

  attach(inst) {
    let isRecursiveInst: boolean | undefined;
    // `bucket` memoized for one parse; a recursive schema is re-entered many times and its bucket never changes
    let lastCtx: object | undefined;
    let lastBucket: Map<object, Entry> | undefined;

    // Wraps `parse` in a deferred so it sees the container's final parse. Core's own deferred copies `parse` into `run` when there are no checks, and it ran first, so `run` is patched to match; with checks, `run` reads `parse` dynamically.
    inst._zod.deferred ??= [];
    inst._zod.deferred.push(() => {
      const base = inst._zod.parse;

      const wrapped = (payload: ParsePayload, ctx: ParseContextInternal): util.MaybeAsync<ParsePayload> => {
        if (isRecursiveInst === undefined) {
          isRecursiveInst = isRecursive(inst, new Set());
          if (!isRecursiveInst) {
            // Nothing here can ever fire, so take it back out.
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
        if (lastCtx === ctx) {
          bucket = lastBucket!;
        } else {
          bucket = bucketFor(state, inst);
          lastCtx = ctx;
          lastBucket = bucket;
        }

        const hit = bucket.get(input);
        if (hit) {
          payload.value = hit.value;
          if (hit.issues) {
            if (hit.issues.length) payload.issues.push(...cloneIssues(hit.issues));
          } else {
            // Still being parsed: its own checks cover it, so skip them here.
            payload.memo = true;
            state.backEdges ??= new Set();
            state.backEdges.add(hit.value as object);
          }
          return payload;
        }

        handoff = bucket;
        const depth = open.length;
        const result = base(payload, ctx);
        handoff = undefined;
        // A container that rejected its input outright allocated nothing.
        const entry = open.length > depth ? open.pop()! : undefined;

        // Both paths written out so the sync one allocates no closure. It runs once per node, and capturing here cost more than everything else combined.
        if (result instanceof Promise) {
          return result.then((r) => {
            if (entry) entry.issues = r.issues.length ? cloneIssues(r.issues) : NO_ISSUES;
            return r;
          });
        }
        if (entry) entry.issues = result.issues.length ? cloneIssues(result.issues) : NO_ISSUES;
        return result;
      };

      inst._zod.parse = wrapped;
      if (inst._zod.run === base) inst._zod.run = wrapped;
    });
  },
};

/** The memoizer that gives containers cycle support. `zod` installs it by default; `zod/mini` opts in with `config({ memoizer: memoizer() })`. */
export function memoizer(): $ZodMemoizer {
  return memo;
}

/** Whether this value is a node a back-edge resolved to before it finished. */
export function isBackEdge(ctx: object, value: unknown): boolean {
  const backEdges = (ctx as WithState)[STATE]?.backEdges;
  return backEdges !== undefined && value !== null && typeof value === "object" && backEdges.has(value);
}
