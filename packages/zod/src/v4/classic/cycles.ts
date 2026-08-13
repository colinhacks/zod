import * as core from "../core/index.js";

/** Thrown when a reference cycle closes through a transform. */
export class ZodCyclicError extends Error {
  constructor() {
    super(
      `Encountered a reference cycle that closes through a transform. The transformed value doesn't exist yet when the cycle closes, so the output can't mirror the input graph.`
    );
    this.name = "ZodCyclicError";
  }
}

interface MemoEntry {
  value: unknown;
  /** Stays `null` while the node is still on the parse stack. */
  issues: core.$ZodRawIssue[] | null;
}

interface MemoState {
  bySchema: Map<core.$ZodType, Map<object, MemoEntry>>;
  /** Output nodes a back-edge resolved to while they were still in progress, so
   * a transform can reject a cycle that closes through it. */
  pending: Set<object> | undefined;
}

/** Per-parse state, hung off the context object that every schema in one parse
 * call already shares. */
const STATE = "~cycles";
type WithState = { [STATE]?: MemoState };

const EMPTY_ISSUES: core.$ZodRawIssue[] = [];

core.supportCycles();

const recursionCache: WeakMap<object, boolean> = /*@__PURE__*/ new WeakMap();

/** True when this schema's subtree contains a reference cycle, so one parse can
 * re-enter the same schema node. Resolved once per schema, on first parse. */
function isRecursive(inst: core.$ZodType, stack: Set<object>): boolean {
  const cached = recursionCache.get(inst);
  if (cached !== undefined) return cached;
  // Reached from inside its own subtree: the graph is cyclic. Not cached — this
  // answer is relative to the walk in progress.
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
    // `def.shape` is redefined as a non-enumerable accessor, so `for...in` misses it.
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
  recursionCache.set(inst, result);
  return result;
}

function stateFor(ctx: object): MemoState {
  let state = (ctx as WithState)[STATE];
  if (!state) {
    state = { bySchema: new Map(), pending: undefined };
    (ctx as WithState)[STATE] = state;
  }
  return state;
}

/**
 * The capability classic hands to core's containers.
 *
 * Core allocates its output object, then calls `enter` before it descends, so
 * what gets registered here is the real output — a back-edge binds straight to
 * it and there is nothing to copy afterwards. A schema that cannot re-enter
 * itself drops the capability on its first parse, after which core's `if (cyc)`
 * short-circuits for the rest of the process.
 */
export const cycleOps: core.$ZodCycleOps = {
  enter(inst, input, payload, ctx) {
    if (!isRecursive(inst, new Set())) return 2;

    const state = stateFor(ctx);
    let byInput = state.bySchema.get(inst);
    if (!byInput) {
      byInput = new Map();
      state.bySchema.set(inst, byInput);
    }

    const hit = byInput.get(input);
    if (hit) {
      payload.value = hit.value;
      if (hit.issues) {
        // A finished node reached again through a shared reference reports the
        // same issues at this position.
        payload.issues.push(...hit.issues);
      } else {
        // A back-edge into a node still on the stack reports nothing here, and
        // skips its checks: they already run further up, on the finished value.
        payload.memo = true;
        state.pending ??= new Set();
        state.pending.add(hit.value as object);
      }
      return 1;
    }

    byInput.set(input, { value: payload.value, issues: null });
    return 0;
  },

  exit(inst, input, payload, ctx) {
    // `enter` may have dropped the capability, in which case nothing was registered.
    const entry = (ctx as WithState)[STATE]?.bySchema.get(inst)?.get(input);
    if (entry) entry.issues = payload.issues.length ? payload.issues.slice() : EMPTY_ISSUES;
  },
};

/** True when this value is an output node some back-edge is still waiting on. */
export function isPendingPlaceholder(ctx: object, value: unknown): boolean {
  const pending = (ctx as WithState)[STATE]?.pending;
  return pending !== undefined && value !== null && typeof value === "object" && pending.has(value);
}
