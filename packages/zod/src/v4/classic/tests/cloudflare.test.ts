import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const state = vi.hoisted(() => {
  Object.defineProperty(globalThis, "navigator", {
    value: { userAgent: "Cloudflare-Workers" },
    configurable: true,
    writable: true,
  });

  const userAgent = typeof navigator === "undefined" ? undefined : navigator?.userAgent;
  const isCloudflare = typeof userAgent === "string" && userAgent.includes("Cloudflare");

  let _allowsEval: boolean;
  try {
    const F = Function;
    new F("");
    _allowsEval = true;
  } catch (_) {
    _allowsEval = false;
  }

  const valueBeforeMicrotask = _allowsEval;

  if (isCloudflare && _allowsEval) {
    Promise.resolve().then(() => {
      _allowsEval = false;
    });
  }

  return {
    isCloudflare,
    valueBeforeMicrotask,
    getAllowsEval: () => _allowsEval,
  };
});

describe("Cloudflare JIT microtask timing", () => {
  test("allowsEval is true during sync, false after microtask", () => {
    expect(state.isCloudflare).toBe(true);
    expect(state.valueBeforeMicrotask).toBe(true);
    expect(state.getAllowsEval()).toBe(false);
  });

  test("util.allowsEval is false after module load", async () => {
    vi.resetModules();
    const { allowsEval } = await import("../../core/util.js");
    expect(allowsEval.value).toBe(false);
  });
});

describe("Cloudflare allowsEval behavior", () => {
  let navigatorDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    vi.resetModules();
    navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Cloudflare-Workers" },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (navigatorDescriptor) {
      Object.defineProperty(globalThis, "navigator", navigatorDescriptor);
    } else {
      delete (globalThis as any).navigator;
    }
    vi.resetModules();
  });

  const loadAllowsEval = async () => {
    const mod = await import("../../core/util.js");
    return mod.allowsEval.value;
  };

  test("disables fast path after startup", async () => {
    expect(await loadAllowsEval()).toBe(false);
  });

  test("caches value instead of re-evaluating", async () => {
    const first = await loadAllowsEval();
    expect(first).toBe(false);

    vi.stubGlobal("Function", function ThrowingFunction() {
      throw new Error("Function constructor disabled");
    });

    const second = await loadAllowsEval();
    expect(second).toBe(first);
  });

  test("stays disabled when eval is disabled from start", async () => {
    vi.stubGlobal("Function", function ThrowingFunction() {
      throw new Error("Function constructor disabled");
    });

    vi.resetModules();
    expect(await loadAllowsEval()).toBe(false);
  });
});

describe("non-Cloudflare allowsEval behavior", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  const loadAllowsEval = async () => {
    const mod = await import("../../core/util.js");
    return mod.allowsEval.value;
  };

  test("falls back when eval is disabled", async () => {
    vi.stubGlobal("Function", function ThrowingFunction() {
      throw new Error("Function constructor disabled");
    });

    vi.resetModules();
    expect(await loadAllowsEval()).toBe(false);
  });

  test("caches value", async () => {
    const first = await loadAllowsEval();

    vi.stubGlobal("Function", function ThrowingFunction() {
      throw new Error("Function constructor disabled");
    });

    const second = await loadAllowsEval();
    expect(second).toBe(first);
  });
});
