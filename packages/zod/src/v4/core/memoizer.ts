import type * as errors from "./errors.js";
import type { $ZodMemoizer, $ZodType, $ZodTypeDef, ParseContextInternal, ParsePayload } from "./schemas.js";
import * as util from "./util.js";

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

// a value a cycle can close through; callables count, since z.properties asserts on one
function isRef(value: unknown): value is object {
  return value !== null && (typeof value === "object" || typeof value === "function");
}

// Receivers prefix paths in place, so the cache and every hand-out need their own copies.
function cloneIssues(issues: errors.$ZodRawIssue[]): errors.$ZodRawIssue[] {
  return issues.map((iss) => (iss.path ? { ...iss, path: iss.path.slice() } : { ...iss }));
}

const recursive: WeakMap<object, boolean> = /*@__PURE__*/ new WeakMap();

/** What the walk established, in order of certainty: ordered so the strongest answer among children wins. */
const NONE = 0;
const ASSUMED = 1;
const PROVEN = 2;
type Answer = typeof NONE | typeof ASSUMED | typeof PROVEN;

/** Whether this schema's subtree contains a cycle, so one parse can re-enter it. */
function isRecursive(inst: $ZodType, stack: Set<object>, resolve: boolean): Answer {
  const cached = recursive.get(inst);
  if (cached !== undefined) return cached ? PROVEN : NONE;
  // Relative to the walk in progress, so not cached.
  if (stack.has(inst)) return PROVEN;
  stack.add(inst);

  let result: Answer = NONE;
  const check = (child: any) => {
    if (result !== PROVEN && child?._zod) {
      const answer = isRecursive(child, stack, resolve);
      if (answer > result) result = answer;
    }
  };

  // `Reflect.ownKeys` rather than `Object.keys`, so a cycle through a declared symbol key is still seen
  const shape = (sh: object, spread: boolean): Answer => {
    let answer: Answer = NONE;
    for (const key of Reflect.ownKeys(sh)) {
      const desc = Object.getOwnPropertyDescriptor(sh, key)!;
      // an object resolves its shape by spread, so a key it does not enumerate is never parsed; `z.properties` reads every own key and so keeps them all
      if (spread && !desc.enumerable) continue;
      // resolving runs user code, and a factory mints a fresh subtree per read, so an edge the walk can't follow counts as a cycle
      const child = desc.get ? ASSUMED : desc.value?._zod ? isRecursive(desc.value, stack, resolve) : NONE;
      if (child > answer) answer = child;
    }
    return answer;
  };

  const merge = (answer: Answer) => {
    if (answer > result) result = answer;
  };

  const def = inst._zod.def as any;
  const kind = def.type as $ZodTypeDef["type"];
  switch (kind) {
    case "object": {
      const raw = util.rawShape(def);
      // a def with no raw shape answers `shape` from an accessor of its own, and running that can mint a whole fresh subtree
      merge(raw ? shape(raw, true) : ASSUMED);
      check(def.catchall);
      break;
    }
    case "properties":
      merge(shape(def.shape, false));
      break;
    case "array":
      check(def.element);
      break;
    case "tuple":
      for (const el of def.items) check(el);
      check(def.rest);
      break;
    case "record":
    case "map":
      check(def.keyType);
      check(def.valueType);
      break;
    case "set":
      check(def.valueType);
      break;
    case "union":
      for (const el of def.options) check(el);
      break;
    case "intersection":
      check(def.left);
      check(def.right);
      break;
    case "optional":
    case "nullable":
    case "default":
    case "prefault":
    case "catch":
    case "readonly":
    case "nonoptional":
    case "promise":
    case "success":
      check(def.innerType);
      break;
    case "pipe":
      check(def.in);
      check(def.out);
      break;
    case "function":
      check(def.input);
      check(def.output);
      break;
    // `$ZodLazy` caches its inner on the def, so a resolved edge is followed exactly
    case "lazy": {
      const inner = def._cachedInner ?? (resolve ? (inst as any)._zod.innerType : undefined);
      // walked with resolution off: one hop sees past the deferral, and a lazy that yields only another unresolved lazy is generative, so it stops there
      merge(inner ? isRecursive(inner, stack, false) : ASSUMED);
      break;
    }
    // a leaf by choice: `parts` are regex fragments, not data positions
    case "template_literal":
    // leaves
    case "string":
    case "number":
    case "int":
    case "boolean":
    case "bigint":
    case "symbol":
    case "undefined":
    case "null":
    case "void":
    case "never":
    case "any":
    case "unknown":
    case "date":
    case "nan":
    case "enum":
    case "literal":
    case "file":
    case "transform":
    case "custom":
      break;
    default: {
      // a new built-in kind becomes a compile error here
      kind satisfies never;
      // a user-defined kind can still hold children, and only its author knows where, so fall back to scanning the def — skipping accessors, since reading one can run user code
      for (const key in def) {
        const desc = Object.getOwnPropertyDescriptor(def, key);
        if (!desc || desc.get) continue;
        const value = desc.value;
        if (!value || typeof value !== "object") continue;
        if (value._zod) check(value);
        else if (Array.isArray(value)) for (const el of value) check(el);
      }
    }
  }

  stack.delete(inst);
  return settle(inst, result);
}

/** An assumed answer must not outlive the resolution that settles it, so only a certain one is cached. */
function settle(inst: $ZodType, answer: Answer): Answer {
  if (answer !== ASSUMED) recursive.set(inst, answer === PROVEN);
  return answer;
}

/**
 * Whether one parse can re-enter this schema, i.e. its subtree contains a cycle.
 * Exported for `z.compile`, which refuses to compile such a schema: cycle
 * breaking is driven from here off state keyed on the parse context, and a
 * generated fast path has no context to key on.
 */
export function isRecursiveSchema(inst: $ZodType): boolean {
  // z.compile never parses, so nothing would ever resolve a lazy for it; it runs once and already treats a throw here as recursive
  return isRecursive(inst, new Set(), true) !== NONE;
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
    let rechecked = false;
    // `bucket` memoized for one parse; a recursive schema is re-entered many times and its bucket never changes
    let lastCtx: object | undefined;
    let lastBucket: Map<object, Entry> | undefined;

    // Wraps `parse` in a deferred so it sees the container's final parse. Core's own deferred copies `parse` into `run` when there are no checks, and it ran first, so `run` is patched to match; with checks, `run` reads `parse` dynamically.
    inst._zod.deferred ??= [];
    inst._zod.deferred.push(() => {
      const base = inst._zod.parse;

      const wrapped = (payload: ParsePayload, ctx: ParseContextInternal): util.MaybeAsync<ParsePayload> => {
        if (isRecursiveInst === undefined) {
          const walked = isRecursive(inst, new Set(), false);
          if (walked === NONE) {
            // Nothing here can ever fire, so take it back out.
            inst._zod.parse = base;
            if (inst._zod.run === wrapped) inst._zod.run = base;
            return base(payload, ctx);
          }
          // this parse resolves the deferred edges on its own path, so ask once more before latching
          if (walked === PROVEN || rechecked) isRecursiveInst = true;
          else rechecked = true;
        }

        const input = payload.value;
        if (!isRef(input)) return base(payload, ctx);

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
  return backEdges !== undefined && isRef(value) && backEdges.has(value);
}
