import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const URLDescriptor = Object.getOwnPropertyDescriptor(globalThis, "URL")!;
const NativeURL = globalThis.URL;
const canParseDescriptor = Object.getOwnPropertyDescriptor(NativeURL, "canParse")!;
const parseDescriptor = Object.getOwnPropertyDescriptor(NativeURL, "parse")!;

function restoreURL() {
  Object.defineProperty(globalThis, "URL", URLDescriptor);
  Object.defineProperty(NativeURL, "canParse", canParseDescriptor);
  Object.defineProperty(NativeURL, "parse", parseDescriptor);
}

describe("URL parser fallbacks", () => {
  beforeEach(() => {
    restoreURL();
    vi.resetModules();
  });

  afterEach(restoreURL);

  test("uses the boolean and object APIs on modern runtimes", async () => {
    const canParse = vi.spyOn(NativeURL, "canParse");
    const URLStatic = NativeURL as typeof URL & { parse: (input: string) => URL | null };
    const parse = vi.spyOn(URLStatic, "parse");
    const z = await import("../../index.js");

    expect(z.validate(z.url(), "https://example.com")).toBe(true);
    expect(canParse).toHaveBeenCalledOnce();
    expect(parse).not.toHaveBeenCalled();

    canParse.mockClear();
    expect(z.validate(z.url({ normalize: true }), "https://example.com")).toBe(true);
    expect(parse).toHaveBeenCalledOnce();
    expect(canParse).not.toHaveBeenCalled();

    parse.mockClear();
    expect(z.validate(z.ipv6(), "2001:db8::1")).toBe(true);
    expect(canParse).toHaveBeenCalledOnce();
    expect(parse).not.toHaveBeenCalled();
  });

  test("URL fast-path selection preserves live option getter reads", async () => {
    const z = await import("../../index.js");
    const postProcessor = z.core.globalConfig.postProcessor;
    z.core.globalConfig.postProcessor = undefined;
    try {
      for (const inherited of [false, true]) {
        const schema = z.url();
        const target = inherited ? Object.create(Object.getPrototypeOf(schema.def)) : schema.def;
        let reads = 0;
        Object.defineProperty(target, "hostname", {
          get: () => (++reads === 1 ? /^example\.com$/ : undefined),
        });
        if (inherited) Object.setPrototypeOf(schema.def, target);
        expect(z.validate(schema, "https://example.com")).toBe(false);
        expect(reads).toBe(2);
        reads = 0;
        expect(schema.safeParse("https://example.com").success).toBe(false);
        expect(reads).toBe(2);
      }
    } finally {
      z.core.globalConfig.postProcessor = postProcessor;
    }
  });

  test("the exported object parser still returns a URL", async () => {
    const { parseURLObject } = await import("../schemas.js");
    const result = parseURLObject("https://example.com", {});
    expect(result).toBeInstanceOf(NativeURL);
    if (typeof result === "number") expect.unreachable();
    expect(result.hostname).toBe("example.com");
    expect(parseURLObject("invalid", {})).toBe(2);
  });

  test("falls back when URL.canParse is absent", async () => {
    Reflect.deleteProperty(NativeURL, "canParse");
    const z = await import("../../index.js");
    const cases = [
      [z.url(), "https://example.com", "not a url"],
      [z.ipv6(), "2001:db8::1", "not-an-ip"],
      [z.cidrv6(), "2001:db8::/32", "not-an-ip/32"],
    ] as const;

    for (const [schema, valid, invalid] of cases) {
      for (const subject of [schema, z.compile(schema)]) {
        expect(z.validate(subject, valid)).toBe(true);
        expect(z.validate(subject, invalid)).toBe(false);
        expect(subject.safeParse(valid).success).toBe(true);
        expect(subject.safeParse(invalid).success).toBe(false);
      }
    }
  });

  test("falls back when URL.parse is absent", async () => {
    Reflect.deleteProperty(NativeURL, "parse");
    const z = await import("../../index.js");
    const cases = [
      [z.url({ normalize: true }), "https://example.com", "not a url"],
      [z.url({ hostname: /^example\.com$/ }), "https://example.com", "https://other.com"],
      [z.httpUrl(), "https://example.com", "mailto:a@example.com"],
    ] as const;

    for (const [schema, valid, invalid] of cases) {
      for (const subject of [schema, z.compile(schema)]) {
        expect(z.validate(subject, valid)).toBe(true);
        expect(z.validate(subject, invalid)).toBe(false);
        expect(subject.safeParse(valid).success).toBe(true);
        expect(subject.safeParse(invalid).success).toBe(false);
      }
    }
  });

  test("rejects without a global URL constructor", async () => {
    const z = await import("../../index.js");
    const cases = [
      [z.url(), "https://example.com"],
      [z.url({ normalize: true }), "https://example.com"],
      [z.ipv6(), "2001:db8::1"],
      [z.cidrv6(), "2001:db8::/32"],
    ] as const;
    const subjects = cases.flatMap(([schema, input]) => [
      [schema, input] as const,
      [z.compile(schema), input] as const,
    ]);
    Object.defineProperty(globalThis, "URL", { configurable: true, value: undefined });

    for (const [schema, input] of subjects) {
      expect(z.validate(schema, input)).toBe(false);
      expect(schema.safeParse(input).success).toBe(false);
    }
  });
});
