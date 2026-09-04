// What a failing safeParse costs BEFORE anyone reads `.error`: the result object. Compares the shipped literal-with-accessors shape against alternatives with the same own-property surface (an own, enumerable, configurable `error` accessor) and, for reference, the shapes that change it. Fixed iterations, gc between samples, min of 7 interleaved rounds.
import * as z from "zod";

declare global {
  var gc: undefined | (() => void);
}
if (!globalThis.gc) {
  console.error("run with --expose-gc");
  process.exit(1);
}

const issues = [{ code: "invalid_type", expected: "string", input: 42, inst: null }];
const ctx = { async: false };
class Err {
  issues: unknown[];
  constructor(i: unknown[]) {
    this.issues = i;
  }
}
const finalize = (iss: any) => ({ code: iss.code, expected: iss.expected, path: [], message: "Invalid input" });

// 1. shipped: literal with get/set closures
function literalAccessors(iss: any[], c: any): any {
  let error: any;
  return {
    success: false,
    get error() {
      if (!error) {
        error = new Err(iss.map(finalize));
        iss = undefined as any;
        c = undefined;
      }
      return error;
    },
    set error(e: any) {
      error = e;
      iss = undefined as any;
      c = undefined;
    },
  };
}

// 2. own accessor via a shared descriptor; state in a hidden symbol slot
const STATE = Symbol("state");
const sharedDesc: PropertyDescriptor = {
  enumerable: true,
  configurable: true,
  get(this: any) {
    const st = this[STATE];
    if (st.error === undefined) {
      st.error = new Err(st.issues.map(finalize));
      st.issues = undefined;
      st.ctx = undefined;
    }
    return st.error;
  },
  set(this: any, e: any) {
    const st = this[STATE];
    st.error = e;
    st.issues = undefined;
    st.ctx = undefined;
  },
};
function sharedDescriptor(iss: any[], c: any): any {
  const r: any = { success: false, [STATE]: { issues: iss, ctx: c, error: undefined } };
  Object.defineProperty(r, "error", sharedDesc);
  return r;
}

// 2b. own accessor + a NON-enumerable slot, both defined in one defineProperties call (spread and Reflect.ownKeys no longer see the slot's value)
const twoDescs: PropertyDescriptorMap = {
  [STATE]: { value: undefined, writable: true, enumerable: false, configurable: true },
  error: sharedDesc,
};
function sharedDescriptors(iss: any[], c: any): any {
  const r: any = { success: false };
  (twoDescs[STATE as any] as PropertyDescriptor).value = { issues: iss, ctx: c, error: undefined };
  Object.defineProperties(r, twoDescs);
  (twoDescs[STATE as any] as PropertyDescriptor).value = undefined;
  return r;
}

// 2c. own accessor via the shared descriptor; state in a WeakMap keyed by the result
const states = new WeakMap<object, { issues: any[] | undefined; ctx: any; error: any }>();
const weakDesc: PropertyDescriptor = {
  enumerable: true,
  configurable: true,
  get(this: any) {
    const st = states.get(this)!;
    if (st.error === undefined) {
      st.error = new Err(st.issues!.map(finalize));
      st.issues = undefined;
      st.ctx = undefined;
    }
    return st.error;
  },
  set(this: any, e: any) {
    const st = states.get(this)!;
    st.error = e;
    st.issues = undefined;
    st.ctx = undefined;
  },
};
function weakMapState(iss: any[], c: any): any {
  const r: any = { success: false };
  states.set(r, { issues: iss, ctx: c, error: undefined });
  Object.defineProperty(r, "error", weakDesc);
  return r;
}

// 3. prototype accessor (NOT own: changes Object.keys / spread / JSON) — reference only
class Failure {
  success = false as const;
  private _issues: any[] | undefined;
  private _ctx: any;
  private _error: any;
  constructor(iss: any[], c: any) {
    this._issues = iss;
    this._ctx = c;
  }
  get error() {
    if (this._error === undefined) {
      this._error = new Err(this._issues!.map(finalize));
      this._issues = undefined;
      this._ctx = undefined;
    }
    return this._error;
  }
  set error(e: any) {
    this._error = e;
    this._issues = undefined;
    this._ctx = undefined;
  }
}
function prototypeAccessor(iss: any[], c: any): any {
  return new Failure(iss, c);
}

// 4. eager plain object (pre-#6519) — reference
function eager(iss: any[], _c: any): any {
  return { success: false, error: new Err(iss.map(finalize)) };
}

// 5. shipped zod safeParse end to end, for scale
const schema = z.string();
function zodSafeParse(): any {
  return schema.safeParse(42);
}

let sink = 0;
function sample(fn: () => any, readError: boolean, iters: number): number {
  globalThis.gc!();
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < iters; i++) {
    const r = fn();
    if (readError ? r.error.issues.length === 0 : r.success) sink++;
  }
  return Number(process.hrtime.bigint() - t0) / iters;
}

const variants: Array<[string, () => any]> = [
  ["literal accessors (shipped)", () => literalAccessors(issues, ctx)],
  ["shared descriptor + slot", () => sharedDescriptor(issues, ctx)],
  ["defineProperties + hidden slot", () => sharedDescriptors(issues, ctx)],
  ["shared descriptor + WeakMap", () => weakMapState(issues, ctx)],
  ["prototype accessor (ref)", () => prototypeAccessor(issues, ctx)],
  ["eager object (ref)", () => eager(issues, ctx)],
  ["z.string().safeParse(42)", zodSafeParse],
];
const ITERS = 1_000_000;
for (const readError of [false, true]) {
  const mins = new Map<string, number>();
  for (const [, fn] of variants) sample(fn, readError, ITERS / 10);
  for (let r = 0; r < 7; r++) {
    for (const [name, fn] of variants) {
      const v = sample(fn, readError, ITERS);
      if (!mins.has(name) || v < mins.get(name)!) mins.set(name, v);
    }
  }
  console.log(readError ? "construct + read .error.issues" : "construct + read .success");
  for (const [name] of variants) console.log(`  ${name.padEnd(30)} ${mins.get(name)!.toFixed(1)} ns`);
}
console.log(`sink=${sink}`);
