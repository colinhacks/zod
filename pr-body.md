When `.strict()` is called through a generic wrapper like:

```ts
const wrap = <T extends z.ZodObject>(schema: T) => schema.strict();
```

the concrete Shape was lost (defaulted to `$ZodLooseShape`), making nested properties `unknown`.

Fix: change `.strict()`, `.loose()`, `.passthrough()`, `.strip()` signatures to use polymorphic `this["shape"]` instead of the generic `Shape` parameter. TypeScript's method shorthand preserves `this` correctly at each call site, so Shape is properly inferred through wrappers.

Fixes #6039