# Tree-Shaking Tests

This package contains tests to verify that Zod v4's locale tree-shaking works correctly.

## Test Files

- **`test-no-locales.ts`** - Default import (Core + English auto-configured)
- **`test-one-locale.ts`** - Core + English + 1 additional locale (German)
- **`test-three-locales.ts`** - Core + English + 3 additional locales (de, fr, ja)
- **`test-many-locales.ts`** - Core + English + 10 additional locales

## Running Tests

```bash
pnpm verify:sizes
```

This will:

1. Build each test file with Rollup + terser
2. Measure the minified bundle size
3. Compare against expected sizes with 15% tolerance
4. Report any regressions

## Expected Sizes

| Test               | Expected Size | Description            |
| ------------------ | ------------- | ---------------------- |
| test-no-locales    | ~50 KB        | Core + English only    |
| test-one-locale    | ~55 KB        | + German locale        |
| test-three-locales | ~65 KB        | + 3 locales (de/fr/ja) |
| test-many-locales  | ~95 KB        | + 10 locales           |

**Before tree-shaking fix:** ~220 KB (all 47 locales bundled)
**After tree-shaking fix:** ~50 KB (only English) = **~77% reduction**

## Size Limits

Tests enforce a 15% tolerance above expected sizes. If bundles exceed this:

- ❌ Test fails
- Indicates potential tree-shaking regression
- May need to update expected sizes if legitimate changes

## Build Outputs

All build outputs are in `dist/` and are gitignored:

- `dist/*.js` - Built bundles
- Test TypeScript files are also excluded from distribution

## Updating Expected Sizes

If you've made legitimate changes that affect bundle size, update `EXPECTED_SIZES` in `verify-sizes.js`.
