# Zod enums

```ts
const FishEnum = z.enum(["Salmon", "Tuna", "Trout"]);
type FishEnum = z.infer<typeof FishEnum>;
// 'Salmon' | 'Tuna' | 'Trout'
```

`z.enum` is a Zod-native way to declare a schema with a fixed set of allowable _string_ values. Pass the array of values directly into `z.enum()`. Alternatively, use `as const` to define your enum values as a tuple of strings. See the [const assertion docs](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) for details.

```ts
const VALUES = ["Salmon", "Tuna", "Trout"] as const;
const FishEnum = z.enum(VALUES);
```

This is not allowed, since Zod isn't able to infer the exact values of each element.

```ts
const fish = ["Salmon", "Tuna", "Trout"];
const FishEnum = z.enum(fish);
```

**Autocompletion**

To get autocompletion with a Zod enum, use the `.enum` property of your schema:

```ts
FishEnum.enum.Salmon; // => autocompletes

FishEnum.enum;
/*
=> {
  Salmon: "Salmon",
  Tuna: "Tuna",
  Trout: "Trout",
}
*/
```

You can also retrieve the list of options as a tuple with the `.options` property:

```ts
FishEnum.options; // ["Salmon", "Tuna", "Trout"];
```
