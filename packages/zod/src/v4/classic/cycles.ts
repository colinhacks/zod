import type * as core from "../core/index.js";

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
  /** Placeholders a back-edge resolved to, so a transform can reject one.
   * Allocated only once a back-edge actually happens. */
  pending: Set<object> | undefined;
}

/** Per-parse state, hung off the context object that every schema in one parse
 * call already shares, so nothing has to be threaded through core. */
const STATE = "~cycles";
type WithState = { [STATE]?: MemoState };

const EMPTY_ISSUES: core.$ZodRawIssue[] = [];

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

/** Copies a finished container into the placeholder a back-edge already points
 * at, so the cycle closes on the object callers actually receive. */
type Filler = (placeholder: any, finished: any) => void;

const hasOwn = Object.prototype.hasOwnProperty;

export const fillObject: Filler = (placeholder, finished) => {
  Object.assign(placeholder, finished);
  // Object.assign would have set the prototype rather than defining a key.
  if (hasOwn.call(finished, "__proto__")) {
    Object.defineProperty(placeholder, "__proto__", {
      value: finished.__proto__,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
};

export const fillArray: Filler = (placeholder, finished) => {
  for (let i = 0; i < finished.length; i++) placeholder[i] = finished[i];
};

export const fillMap: Filler = (placeholder, finished) => {
  for (const [k, v] of finished) placeholder.set(k, v);
};

export const fillSet: Filler = (placeholder, finished) => {
  for (const v of finished) placeholder.add(v);
};

/** Wraps `run` so a container registers its output before it descends. The
 * wrapper removes itself on first parse when the schema can't recurse, so a
 * non-recursive schema pays nothing beyond that first call. */
export function installCycleGuard(inst: core.$ZodType, make: () => object, fill: Filler): void {
  inst._zod.deferred ??= [];
  inst._zod.deferred.push(() => {
    const base = inst._zod.run;
    let recursive: boolean | undefined;

    inst._zod.run = (payload, ctx) => {
      if (recursive === undefined) {
        recursive = isRecursive(inst, new Set());
        if (!recursive) {
          inst._zod.run = base;
          return base(payload, ctx);
        }
      }

      const input = payload.value;
      if (input === null || typeof input !== "object") return base(payload, ctx);

      let state = (ctx as WithState)[STATE];
      if (!state) {
        state = { bySchema: new Map(), pending: undefined };
        (ctx as WithState)[STATE] = state;
      }

      let byInput = state.bySchema.get(inst);
      if (!byInput) {
        byInput = new Map();
        state.bySchema.set(inst, byInput);
      }

      const hit = byInput.get(input);
      if (hit) {
        payload.value = hit.value;
        // A finished node reached again reports the same issues at this position.
        // A back-edge into a node still on the stack reports nothing here, and
        // never reaches `base`, so its checks don't run against a half-built value.
        if (hit.issues) {
          payload.issues.push(...hit.issues);
        } else {
          state.pending ??= new Set();
          state.pending.add(hit.value as object);
        }
        return payload;
      }

      const placeholder = make();
      const entry: MemoEntry = { value: placeholder, issues: null };
      byInput.set(input, entry);

      const finish = (result: core.ParsePayload) => {
        // The container rejected the input outright and built nothing, so there
        // is no output node here. Drop the entry rather than hand a later
        // occurrence an empty placeholder.
        if (result.value === input) {
          byInput.delete(input);
          return result;
        }
        fill(placeholder, result.value);
        result.value = placeholder;
        entry.issues = result.issues.length ? result.issues.slice() : EMPTY_ISSUES;
        return result;
      };

      const result = base(payload, ctx);
      return result instanceof Promise ? result.then(finish) : finish(result);
    };
  });
}

/** True when this value is a placeholder some back-edge is still waiting on. */
export function isPendingPlaceholder(ctx: object, value: unknown): boolean {
  const pending = (ctx as WithState)[STATE]?.pending;
  return pending !== undefined && value !== null && typeof value === "object" && pending.has(value);
}
