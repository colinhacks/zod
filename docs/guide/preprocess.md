# Preprocess

> Zod now supports primitive coercion without the need for `.preprocess()`. See the [coercion docs](#coercion-for-primitives) for more information.

Typically Zod operates under a "parse then transform" paradigm. Zod validates the input first, then passes it through a chain of transformation functions. (For more information about transforms, read the [.transform docs](#transform).)

But sometimes you want to apply some transform to the input _before_ parsing happens. A common use case: type coercion. Zod enables this with the `z.preprocess()`.

```ts
const castToString = z.preprocess((val) => String(val), z.string());
```

This returns a `ZodEffects` instance. `ZodEffects` is a wrapper class that contains all logic pertaining to preprocessing, refinements, and transforms.
