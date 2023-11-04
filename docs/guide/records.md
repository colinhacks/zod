# Records

Record schemas are used to validate types such as `{ [k: string]: number }`.

If you want to validate the _values_ of an object against some schema but don't care about the keys, use `z.record(valueType)`:

```ts
const NumberCache = z.record(z.number());

type NumberCache = z.infer<typeof NumberCache>;
// => { [k: string]: number }
```

This is particularly useful for storing or caching items by ID.

```ts
const userSchema = z.object({ name: z.string() });
const userStoreSchema = z.record(userSchema);

type UserStore = z.infer<typeof userStoreSchema>;
// => type UserStore = { [ x: string ]: { name: string } }

const userStore: UserStore = {};

userStore["77d2586b-9e8e-4ecf-8b21-ea7e0530eadd"] = {
  name: "Carlotta",
}; // passes

userStore["77d2586b-9e8e-4ecf-8b21-ea7e0530eadd"] = {
  whatever: "Ice cream sundae",
}; // TypeError
```

## Record key type

If you want to validate both the keys and the values, use
`z.record(keyType, valueType)`:

```ts
const NoEmptyKeysSchema = z.record(z.string().min(1), z.number());
NoEmptyKeysSchema.parse({ count: 1 }); // => { 'count': 1 }
NoEmptyKeysSchema.parse({ "": 1 }); // fails
```

_(Notice how when passing two arguments, `valueType` is the second argument)_

**A note on numerical keys**

While `z.record(keyType, valueType)` is able to accept numerical key types and TypeScript's built-in Record type is `Record<KeyType, ValueType>`, it's hard to represent the TypeScript type `Record<number, any>` in Zod.

As it turns out, TypeScript's behavior surrounding `[k: number]` is a little unintuitive:

```ts
const testMap: { [k: number]: string } = {
  1: "one",
};

for (const key in testMap) {
  console.log(`${key}: ${typeof key}`);
}
// prints: `1: string`
```

As you can see, JavaScript automatically casts all object keys to strings under the hood. Since Zod is trying to bridge the gap between static and runtime types, it doesn't make sense to provide a way of creating a record schema with numerical keys, since there's no such thing as a numerical key in runtime JavaScript.
