import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Tests the microtask timing PATTERN (not the real code).
// This verifies the approach works, but doesn't test util.ts directly.
const microtaskState = vi.hoisted(() => {
  let _allowsEval = true;
  Promise.resolve().then(() => {
    _allowsEval = false;
  });

  return {
    valueBeforeMicrotask: _allowsEval,
    getValueAfterMicrotask: () => _allowsEval,
  };
});

describe("microtask timing pattern", () => {
  test("value is true before microtask, false after", () => {
    expect(microtaskState.valueBeforeMicrotask).toBe(true);
    expect(microtaskState.getValueAfterMicrotask()).toBe(false);
  });
});

// Tests the ACTUAL implementation in util.ts
const loadAllowsEval = async () => {
  const { allowsEval } = await import("../../core/util.js");
  return allowsEval;
};

describe("allowsEval", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  test("returns true when Function constructor works", async () => {
    const { value } = await loadAllowsEval();
    expect(value).toBe(true);
  });

  test("returns false when Function constructor is blocked", async () => {
    vi.stubGlobal("Function", function () {
      throw new Error("blocked");
    });
    const { value } = await loadAllowsEval();
    expect(value).toBe(false);
  });

  test("returns false on Cloudflare (after microtask)", async () => {
    vi.stubGlobal("navigator", { userAgent: "Cloudflare-Workers" });
    const { value } = await loadAllowsEval();
    expect(value).toBe(false);
  });

  test("value is plain property, not getter (for non-CF)", async () => {
    const allowsEval = await loadAllowsEval();
    const descriptor = Object.getOwnPropertyDescriptor(allowsEval, "value");
    expect(descriptor?.get).toBeUndefined();
    expect(descriptor?.value).toBe(true);
  });

  test("value is getter on Cloudflare", async () => {
    vi.stubGlobal("navigator", { userAgent: "Cloudflare-Workers" });
    const allowsEval = await loadAllowsEval();
    const descriptor = Object.getOwnPropertyDescriptor(allowsEval, "value");
    expect(descriptor?.get).toBeDefined();
  });
});
