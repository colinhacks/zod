import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// schemas.ts captures URL.canParse at module-load time. Reset the module
// registry and delete URL.canParse so the dynamic re-import takes the inline
// fallback branch (URL.canParse may be undefined on older runtimes).
describe("z.url() with URL.canParse absent", () => {
  const original = URL.canParse;

  beforeEach(() => {
    vi.resetModules();
    // @ts-expect-error force the fallback branch (URL.canParse may be undefined on older runtimes)
    delete URL.canParse;
  });

  afterEach(() => {
    URL.canParse = original;
  });

  test("z.url() validates correctly without URL.canParse (runtime)", async () => {
    expect(URL.canParse).toBeUndefined();
    const z = await import("../../index.js");
    expect(z.url().safeParse("https://example.com").success).toBe(true);
    expect(z.url().safeParse("not a url").success).toBe(false);
  });

  test("z.url() validates correctly without URL.canParse (compiled)", async () => {
    expect(URL.canParse).toBeUndefined();
    const z = await import("../../index.js");
    const compiled = z.compile(z.url());
    expect(compiled.safeParse("https://example.com").success).toBe(true);
    expect(compiled.safeParse("not a url").success).toBe(false);
  });
});
