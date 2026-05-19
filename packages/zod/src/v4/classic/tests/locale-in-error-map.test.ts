/**
 * Reproduction test for Feature Request #5989:
 * "Pass the currently set locale to error maps (or otherwise expose it)"
 *
 * All assertions marked "FAILS" below currently fail because `locale` is not
 * forwarded into the `$ZodRawIssue` that error-map functions receive.
 * Once `$ZodConfig.locale` is wired through `finalizeIssue`, every failing
 * assertion should become green without any change to this file.
 */
import { afterEach, describe, expect, test } from "vitest";
import * as z from "zod/v4";
import * as core from "zod/v4/core";

describe("locale exposed in error map context (#5989)", () => {
  afterEach(() => {
    // Prevent config mutations from bleeding into other test files.
  afterEach(() => {
    // Prevent config mutations from bleeding into other test files.
    delete (core.globalConfig as any).locale;
    delete core.globalConfig.customError;
  });
    delete core.globalConfig.customError;
  });

  // ---------------------------------------------------------------------------
  // 1. Global customError map reads locale
  // ---------------------------------------------------------------------------
  test("global customError receives the active locale from z.config()", () => {
    const observed: (string | undefined)[] = [];
    (core.globalConfig as any).locale = "fr";
    z.config({
      customError: (issue) => {
        observed.push((issue as any).locale);
        return (issue as any).locale === "fr" ? "Entrée invalide" : "Invalid input";
      },
    });

    const result = z.string().safeParse(123);

    expect(result.success).toBe(false);
    expect(observed[0]).toBe("fr");
    expect(result.error!.issues[0].message).toBe("Entrée invalide");
  });

  // ---------------------------------------------------------------------------
  // 2. Per-parse `error` option reads locale
  // ---------------------------------------------------------------------------
  test("per-parse error option receives the active locale from z.config()", () => {
    (core.globalConfig as any).locale = "es";

    const result = z.string().safeParse(42, {
      error: (issue) => {
        const locale = (issue as any).locale as string | undefined;
        return locale === "es" ? "Entrada inválida" : undefined;
      },
    });

    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toBe("Entrada inválida");
  });

  // ---------------------------------------------------------------------------
  // 3. Per-schema error map reads locale (via z.string({ error: … }))
  // ---------------------------------------------------------------------------
  test("per-schema error map receives the active locale from z.config()", () => {
    (core.globalConfig as any).locale = "de";

    const schema = z.string({
      error: (issue) => {
        const locale = (issue as any).locale as string | undefined;
        return locale === "de" ? "Ungültige Eingabe" : undefined;
      },
    });

    const result = schema.safeParse(99);

    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toBe("Ungültige Eingabe");
  });

  // ---------------------------------------------------------------------------
  // 4. .refine() failure — custom issue — also carries locale
  // ---------------------------------------------------------------------------
  test("custom issue from .refine() carries the active locale", () => {
    (core.globalConfig as any).locale = "ja";
    z.config({
      customError: (issue) => {
        if (issue.code !== "custom") return undefined;
        const locale = (issue as any).locale as string | undefined;
        return locale === "ja" ? "カスタムエラー" : undefined;
      },
    });

    const result = z
      .string()
      .refine(() => false)
      .safeParse("hello");

    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toBe("カスタムエラー");
  });

  // ---------------------------------------------------------------------------
  // 5. Locale updates are reflected immediately — no stale captures
  // ---------------------------------------------------------------------------
  test("locale in issue reflects the current config value at parse time", () => {
    const observed: (string | undefined)[] = [];
    z.config({
      customError: (issue) => {
        observed.push((issue as any).locale);
        return undefined;
      },
    });

    (core.globalConfig as any).locale = "pt";
    z.string().safeParse(1);

    (core.globalConfig as any).locale = "ko";
    z.string().safeParse(1);

    expect(observed).toEqual(["pt", "ko"]);
  });

  // ---------------------------------------------------------------------------
  // 6. Baseline — locale is undefined when not set (must pass before AND after)
  // ---------------------------------------------------------------------------
  test("locale is undefined in issues when not configured", () => {
    const observed: unknown[] = [];
    z.config({
      customError: (issue) => {
        observed.push((issue as any).locale);
        return undefined;
      },
    });

    z.string().safeParse(123);

    // This must stay green both before and after the feature lands.
    expect(observed[0]).toBeUndefined();
  });
});
