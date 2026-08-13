import { test } from "vitest";
import type {
  $ZodCatch,
  $ZodDefault,
  $ZodLazy,
  $ZodNonOptional,
  $ZodNullable,
  $ZodOptional,
  $ZodPipe,
  $ZodPipeExact,
  $ZodPipeMetadataExact,
  $ZodPrefault,
  $ZodPreprocess,
  $ZodReadonly,
  $ZodString,
  $ZodSuccess,
  $ZodTransform,
  $ZodWrapperMetadataExact,
} from "zod/v4/core";

// Regression test for #4611: a recursive type alias that includes a `$ZodPipe`
// node used to fail with "Type instantiation is excessively deep and possibly
// infinite" because `$ZodPipeInternals` referenced `A["_zod"]["values"]` etc.
// directly. The default `$ZodPipe<A, B>` now uses recursion-safe metadata.
test("recursive $ZodPipe alias (#4611)", () => {
  type Foo = $ZodPipe<Bar, $ZodTransform>;
  type Bar = $ZodString | Foo;

  const _foo = null as unknown as Foo;
  const _bar = null as unknown as Bar;
  void _foo;
  void _bar;
});

// `$ZodPipeExact` keeps the precise metadata used by classic/mini for input/
// output optionality math. Asserting against the exact field types prevents
// accidental widening of the exact view back to the recursion-safe defaults.
test("$ZodPipeExact preserves exact bubbled metadata", () => {
  type Exact = $ZodPipeExact<$ZodString, $ZodTransform>;
  type Meta = $ZodPipeMetadataExact<$ZodString, $ZodTransform>;

  const _optin = null as unknown as Exact["_zod"]["optin"] satisfies Meta["optin"];
  const _optout = null as unknown as Exact["_zod"]["optout"] satisfies Meta["optout"];
  const _values = null as unknown as Exact["_zod"]["values"] satisfies Meta["values"];
  void _optin;
  void _optout;
  void _values;
});

// Schema-hub-style recursion: a `FieldSchema` alias that mixes `$ZodPipe` with
// the other wrappers (lazy/nullable/readonly). All of these wrappers bubble
// inner-type metadata via the same `Meta` parameter pattern, so the alias
// resolves without TS2589.
test("recursive pipe inside wrapper union (#4611, full)", () => {
  type Wrapped =
    | $ZodLazy<FieldSchema>
    | $ZodNullable<FieldSchema>
    | $ZodPipe<FieldSchema, $ZodTransform>
    | $ZodReadonly<FieldSchema>;

  type FieldSchema = $ZodString | Wrapped;

  const _w = null as unknown as Wrapped;
  const _f = null as unknown as FieldSchema;
  void _w;
  void _f;
});

// Per-wrapper recursion-safety: a self-referential alias `T = $ZodString |
// $ZodWrapper<T>` must compile for every wrapper that bubbles inner-type
// metadata. If any of these regress to the old `T["_zod"][...]` shape, the
// corresponding alias here trips TS2589 and fails typecheck.
//
// `$ZodExactOptional` is intentionally omitted: it narrows
// `output: core.output<T>` against its parent's `output: core.output<T> |
// undefined`, and that narrowing redeclaration forces TS to eagerly resolve
// `T["_zod"]` regardless of the wrapper-metadata shape. That recursion limit
// is independent of #4611 and exists on `main`.
test("recursive alias compiles for every wrapper", () => {
  type _ZodOptional = $ZodString | $ZodOptional<_ZodOptional>;
  type _ZodNullable = $ZodString | $ZodNullable<_ZodNullable>;
  type _ZodDefault = $ZodString | $ZodDefault<_ZodDefault>;
  type _ZodPrefault = $ZodString | $ZodPrefault<_ZodPrefault>;
  type _ZodNonOptional = $ZodString | $ZodNonOptional<_ZodNonOptional>;
  type _ZodSuccess = $ZodString | $ZodSuccess<_ZodSuccess>;
  type _ZodCatch = $ZodString | $ZodCatch<_ZodCatch>;
  type _ZodReadonly = $ZodString | $ZodReadonly<_ZodReadonly>;
  type _ZodLazy = $ZodString | $ZodLazy<_ZodLazy>;
  type _ZodPipe = $ZodString | $ZodPipe<_ZodPipe, $ZodTransform>;
  type _ZodPreprocess = $ZodString | $ZodPreprocess<_ZodPreprocess>;

  void (null as unknown as _ZodOptional);
  void (null as unknown as _ZodNullable);
  void (null as unknown as _ZodDefault);
  void (null as unknown as _ZodPrefault);
  void (null as unknown as _ZodNonOptional);
  void (null as unknown as _ZodSuccess);
  void (null as unknown as _ZodCatch);
  void (null as unknown as _ZodReadonly);
  void (null as unknown as _ZodLazy);
  void (null as unknown as _ZodPipe);
  void (null as unknown as _ZodPreprocess);
});

// `$ZodWrapperMetadataExact<T>` powers the exact-metadata variants of every
// wrapper. Lock in that the exact metadata still resolves to the inner
// `T["_zod"][...]` types — that's what classic/mini rely on.
test("$ZodWrapperMetadataExact mirrors the inner schema metadata", () => {
  type Exact = $ZodWrapperMetadataExact<$ZodString>;

  const _values = null as unknown as Exact["values"] satisfies $ZodString["_zod"]["values"];
  const _optin = null as unknown as Exact["optin"] satisfies $ZodString["_zod"]["optin"];
  const _optout = null as unknown as Exact["optout"] satisfies $ZodString["_zod"]["optout"];
  const _propValues = null as unknown as Exact["propValues"] satisfies $ZodString["_zod"]["propValues"];
  const _pattern = null as unknown as Exact["pattern"] satisfies $ZodString["_zod"]["pattern"];
  void _values;
  void _optin;
  void _optout;
  void _propValues;
  void _pattern;
});
