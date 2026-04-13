# Locale Tests

## Purpose

These tests verify that each Zod v4 locale produces the correct translated error messages for every supported error code. They act as a **contract** between the locale implementation and the expected user-facing output — catching regressions, translation drift, and formatting bugs.

## What Is Tested

Each locale test file covers four groups of assertions:

| Group                 | Zod schema patterns                                                                               | Error codes exercised                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `too_small errors`    | `z.string().min()`, `z.number().min()`, `z.array().min()`, `z.set().min()`                        | `too_small`                                                                                |
| `too_big errors`      | `z.string().max()`, `z.number().max()`, `z.array().max()`                                         | `too_big`                                                                                  |
| `invalid_type errors` | `z.string()`, `z.number()`, `z.boolean()`, `z.array()` parsed with wrong types                    | `invalid_type`                                                                             |
| `other error cases`   | `z.enum()`, `.multipleOf()`, `.strict()`, `z.union()`, `.regex()`, `.startsWith()`, `.endsWith()` | `invalid_value`, `not_multiple_of`, `unrecognized_keys`, `invalid_union`, `invalid_format` |

## Why This Implementation

### Static string assertions

Each test calls `safeParse()` on an intentionally invalid input and asserts the exact translated message string using `toBe()`. This approach:

- **Catches subtle translation bugs** — a wrong word, missing space, or swapped order fails immediately.
- **Is self-documenting** — reading the test shows exactly what message users will see.
- **Is zero-dependency** — no mocking, no fixtures, just the real locale function running against the real Zod error pipeline.

### `safeParse` + success guard pattern

```ts
const result = z.string().min(5).safeParse("abc");
expect(result.success).toBe(false);
if (!result.success) {
  expect(result.error.issues[0].message).toBe("...");
}
```

The explicit `success: false` check before accessing `.error` ensures TypeScript narrowing works correctly and that the test fails with a clear message if the schema unexpectedly succeeds.

### One file per locale

Each locale gets its own isolated test file (`ar.test.ts`, `de.test.ts`, etc.) rather than a single parameterized suite. This keeps failures easy to locate, allows locale-specific edge cases (e.g. plural forms, RTL separators), and makes it straightforward to add or skip tests for a single locale.

### Coverage scope

Tests cover the most commonly triggered error codes across all types. Locale-specific edge cases (e.g. plural forms for `unrecognized_keys`, RTL punctuation in Arabic, gendered adjectives in Slavic locales) are included wherever the locale source differentiates them.

## Locales Covered (50 total)

| Code    | Language                   |
| ------- | -------------------------- |
| `ar`    | Arabic                     |
| `az`    | Azerbaijani                |
| `be`    | Belarusian                 |
| `bg`    | Bulgarian                  |
| `ca`    | Catalan                    |
| `cs`    | Czech                      |
| `da`    | Danish                     |
| `de`    | German                     |
| `en`    | English                    |
| `eo`    | Esperanto                  |
| `es`    | Spanish                    |
| `fa`    | Persian (Farsi)            |
| `fi`    | Finnish                    |
| `fr`    | French                     |
| `fr-CA` | French (Canada)            |
| `he`    | Hebrew                     |
| `hr`    | Croatian                   |
| `hu`    | Hungarian                  |
| `hy`    | Armenian                   |
| `id`    | Indonesian                 |
| `is`    | Icelandic                  |
| `it`    | Italian                    |
| `ja`    | Japanese                   |
| `ka`    | Georgian                   |
| `kh`    | Khmer (Cambodia)           |
| `km`    | Khmer                      |
| `ko`    | Korean                     |
| `lt`    | Lithuanian                 |
| `mk`    | Macedonian                 |
| `ms`    | Malay                      |
| `nl`    | Dutch                      |
| `no`    | Norwegian                  |
| `ota`   | Ottoman Turkish            |
| `pl`    | Polish                     |
| `ps`    | Pashto                     |
| `pt`    | Portuguese                 |
| `ru`    | Russian                    |
| `sl`    | Slovenian                  |
| `sv`    | Swedish                    |
| `ta`    | Tamil                      |
| `th`    | Thai                       |
| `tr`    | Turkish                    |
| `ua`    | Ukrainian (alternate code) |
| `uk`    | Ukrainian                  |
| `ur`    | Urdu                       |
| `uz`    | Uzbek                      |
| `vi`    | Vietnamese                 |
| `yo`    | Yoruba                     |
| `zh-CN` | Chinese (Simplified)       |
| `zh-TW` | Chinese (Traditional)      |

## Adding Tests for a New Locale

1. Create `packages/zod/src/v4/core/tests/locales/<code>.test.ts`
2. Import the locale: `import xx from "../../../locales/<code>.js"`
3. Copy the four test group structure from an existing file (e.g. `de.test.ts`)
4. Trace each message through the locale source file (`packages/zod/src/v4/locales/<code>.ts`) to derive the expected string — do not guess
5. Pay attention to: TypeDictionary overrides, plural forms in `unrecognized_keys`, locale-specific separators in `joinValues`, and sizing unit/verb for string/array/set
