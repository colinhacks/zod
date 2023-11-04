# Coercion for primitives

Zod now provides a more convenient way to coerce primitive values.

```ts
const schema = z.coerce.string();
schema.parse("tuna"); // => "tuna"
schema.parse(12); // => "12"
schema.parse(true); // => "true"
```

During the parsing step, the input is passed through the `String()` function, which is a JavaScript built-in for coercing data into strings. Note that the returned schema is a `ZodString` instance so you can use all string methods.

```ts
z.coerce.string().email().min(5);
```

All primitive types support coercion.

```ts
z.coerce.string(); // String(input)
z.coerce.number(); // Number(input)
z.coerce.boolean(); // Boolean(input)
z.coerce.bigint(); // BigInt(input)
z.coerce.date(); // new Date(input)
```

**Boolean coercion**

Zod's boolean coercion is very simple! It passes the value into the `Boolean(value)` function, that's it. Any truthy value will resolve to `true`, any falsy value will resolve to `false`.

```ts
z.coerce.boolean().parse("tuna"); // => true
z.coerce.boolean().parse("true"); // => true
z.coerce.boolean().parse("false"); // => true
z.coerce.boolean().parse(1); // => true
z.coerce.boolean().parse([]); // => true

z.coerce.boolean().parse(0); // => false
z.coerce.boolean().parse(undefined); // => false
z.coerce.boolean().parse(null); // => false
```
