<p align="center">
  <img src="logo.svg" width="200px" align="center" />
  <h1 align="center">Zod</h1>
</p>
<p align="center">
<a href="https://twitter.com/colinhacks" rel="nofollow"><img src="https://img.shields.io/badge/created%20by-@colinhacks-4BBAAB.svg" alt="Created by Colin McDonnell"></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/colinhacks/zod" alt="License"></a>
<a href="https://www.npmjs.com/package/zod" rel="nofollow"><img src="https://img.shields.io/npm/dw/zod.svg" alt="npm"></a>
<a href="https://www.npmjs.com/package/zod" rel="nofollow"><img src="https://img.shields.io/github/stars/colinhacks/zod" alt="stars"></a>
<a href="./src/__tests__" rel="nofollow"><img src="./coverage.svg" alt="coverage"></a>

</p>
<p align="center">
⭐️ smash that star button ⭐️
</p>

> If you like Zod, you'll love my new library [tRPC](https://trpc.io). It's a way to build end-to-end typesafe APIs without GraphQL or code generation! Check it out at [trpc.io](https://trpc.io).

<br/>

## May 17, 2021: Zod v3 is now in stable release!

Check out the [Migration Guide](https://github.com/colinhacks/zod/blob/master/MIGRATION.md) to upgrade.

Previous versions:

- [`Zod 1 docs`](https://github.com/colinhacks/zod/tree/v1)
- [`Zod 2 docs`](https://github.com/colinhacks/zod/tree/v2)

#### New features

- **Easier imports**: you can now import Zod like `import { z } from 'zod';` instead of using `import * as` syntax.
- **Structured error messages**. Use the `.format()` method to ZodError to convert the error into a strongly-typed, nested object: [format method](#error-formatting)
- **Easier unions**. Use the `or` method to ZodType (the base class for all Zod schemas) to easily create union types like `z.string().or(z.number())`
- **Easier intersections**. Use the `and` method to ZodType (the base class for all Zod schemas) to easily create intersection types
- **Global error customization**. Use `z.setErrorMap(myErrorMap)` to _globally_ customize the error messages produced by Zod: [setErrorMap](ERROR_HANDLING.md#customizing-errors-with-zoderrormap)
- **Maps and sets**. Zod now supports [`Map`](#maps) and [`Set`](#set) schemas.
- **Optional and nullable unwrapping**. ZodOptional and ZodNullable now have a `.unwrap()` method for retrieving the schema they wrap.
- **A new implementation of transformers**. See the [Migration Guide](https://github.com/colinhacks/zod/blob/master/MIGRATION.md) section to understand the syntax changes.

# Table of contents

- [What is Zod](#what-is-zod)
- [Installation](#installation)
- [Ecosystem](#ecosystem)
- [Basic usage](#basic-usage)
- [Defining schemas](#defining-schemas)
  - [Primitives](#primitives)
  - [Literals](#literals)
  - [Strings](#strings)
  - [Numbers](#numbers)
  - [Objects](#objects)
    - [.shape](#shape)
    - [.extend](#extend)
    - [.merge](#merge)
    - [.pick/.omit](#pickomit)
    - [.partial](#partial)
    - [.deepPartial](#deepPartial)
    - [.passthrough](#passthrough)
    - [.strict](#strict)
    - [.strip](#strip)
    - [.catchall](#catchall)
  - [Records](#records)
  - [Maps](#maps)
  - [Sets](#sets)
  - [Arrays](#arrays)
    - [.nonempty](#nonempty)
    - [.min/.max/.length](#minmaxlength)
  - [Unions](#unions)
  - [Optionals](#optionals)
  - [Nullables](#nullables)
  - [Enums](#enums)
    - [Zod enums](#zod-enums)
    - [Native enums](#native-enums)
  - [Tuples](#tuples)
  - [Recursive types](#recursive-types)
    - [JSON type](#json-type)
    - [Cyclical data](#cyclical-objects)
  - [Promises](#promises)
  - [Instanceof](#instanceof)
  - [Function schemas](#function-schemas)
- [Base class methods (ZodType)](#zodtype-methods-and-properties)
  - [.parse](#parse)
  - [.parseAsync](#parseasync)
  - [.safeParse](#safeparse)
  - [.safeParseAsync](#safeparseasync)
  - [.refine](#refine)
  - [.superRefine](#superRefine)
  - [.transform](#transform)
  - [.default](#default)
  - [.optional](#optional)
  - [.nullable](#nullable)
  - [.nullish](#nullish)
  - [.array](#array)
  - [.or](#or)
  - [.and](#and)
- [Type inference](#type-inference)
- [Errors](#errors)
- [Comparison](#comparison)
  - [Joi](#joi)
  - [Yup](#yup)
  - [io-ts](#io-ts)
  - [Runtypes](#runtypes)
- [Changelog](#changelog)

<!-- **Zod 2 is coming! Follow [@colinhacks](https://twitter.com/colinhacks) to stay updated and discuss the future of Zod.** -->

# What is Zod

Zod is a TypeScript-first schema declaration and validation library. I'm using the term "schema" to broadly refer to any data type, from a simple `string` to a complex nested object.

Zod is designed to be as developer-friendly as possible. The goal is to eliminate duplicative type declarations. With Zod, you declare a validator _once_ and Zod will automatically infer the static TypeScript type. It's easy to compose simpler types into complex data structures.

Some other great aspects:

- Zero dependencies
- Works in browsers and Node.js
- Tiny: 8kb minified + zipped
- Immutable: methods (i.e. `.optional()` return a new instance
- Concise, chainable interface
- Functional approach: [parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)
- Works with plain JavaScript too! You don't need to use TypeScript.

# Sponsorship

Sponsorship at any level is appreciated and encouraged. Zod is maintained by a solo developer ([hi!](https://twitter.com/colinhacks)). For individual developers, consider the [Cup of Coffee tier](https://github.com/sponsors/colinhacks). If you built a paid product using Zod, consider the [Startup tier](https://github.com/sponsors/colinhacks). You can learn more about the tiers at [github.com/sponsors/colinhacks](https://github.com/sponsors/colinhacks).

### Sponsors

<table>
  <tr>
   <td align="center">
      <a href="https://deletype.com/">
        <img src="https://avatars0.githubusercontent.com/u/15068039?s=200&v=4" width="100px;" alt="" />
      </a>
      <br>
      <b>Deletype</b>
      <br>
      <a href="https://deletype.com/">https://deletype.com/</a>
    </td>
  <td align="center">
      <a href="https://github.com/kevinsimper">
        <img src="https://avatars1.githubusercontent.com/u/1126497?s=460&v=4" width="100px;" alt="" />
      </a>
      <br>
      <b>Kevin Simper</b>
      <br>
      <a href="https://github.com/kevinsimper">@kevinsimper</a>
    </td>
    <td align="center">
      <a href="https://twitter.com/flybayer">
        <img src="https://avatars2.githubusercontent.com/u/8813276?s=460&u=4ff8beb9a67b173015c4b426a92d89cab960af1b&v=4" width="100px;" alt=""/>
      </a>
      <br>
      <b>Brandon Bayer</b>
      <br/>
      <a href="https://twitter.com/flybayer">@flybayer</a>,
      <span>creator of <a href="https://blitzjs.com">Blitz.js</a></span>
      <br />
    </td>
    
  </tr>
  <tr>
    <td align="center">
      <a href="https://www.bamboocreative.nz/">
        <img src="https://avatars1.githubusercontent.com/u/41406870?s=460&v=4" width="100px;" alt="" />
      </a>
      <br>
      <b>Bamboo Creative</b>
      <br>
      <a href="https://www.bamboocreative.nz/">https://bamboocreative.nz</a>
    </td>
    <td align="center">
      <a href="https://github.com/jeremyBanks">
        <img src="https://avatars.githubusercontent.com/u/18020?s=400&u=dba6c1402ae1746a276a5d256e01d68e774a0e9d&v=4" width="100px;" alt="" />
      </a>
      <br>
      <b>Jeremy Banks</b>
      <br>
      <a href="https://github.com/jeremyBanks">github.com/jeremyBanks</a>
    </td>
     <td align="center">
      <a href="https://marcatopartners.com/">
        <img src="https://avatars.githubusercontent.com/u/84106192?s=200&v=4" width="100px;" alt="Marcato Partners" />
      </a>
      <br>
      <b>Marcato Partners</b>
      <br>
      <a href="https://marcatopartners.com/">marcatopartners.com</a>
    </td>
  </tr>
</table>

_To get your name + Twitter + website here, sponsor Zod at the [Freelancer](https://github.com/sponsors/colinhacks) or [Consultancy](https://github.com/sponsors/colinhacks) tier._

# Installation

To install Zod v3:

```sh
npm install zod
```

⚠️ IMPORTANT: You must enable `strict` mode in your `tsconfig.json`. This is a best practice for all TypeScript projects.

```ts
// tsconfig.json
{
  // ...
  "compilerOptions": {
    // ...
    "strict": true
  }
}
```

#### TypeScript requirements

- Zod 3.x requires TypeScript 4.1+
- Zod 2.x requires TypeScript 3.7+
- Zod 1.x requires TypeScript 3.3+

# Ecosystem

There are a growing number of tools that are built atop or support Zod natively! If you've built a tool or library on top of Zod, tell me about it [on Twitter](https://twitter.com/colinhacks) or [start a Discussion](https://github.com/colinhacks/zod/discussions). I'll add it below and tweet it out.

- [`tRPC`](https://github.com/trpc/trpc): Build end-to-end typesafe APIs without GraphQL
- [`react-hook-form`](https://github.com/react-hook-form/resolvers): Build type-safe forms easily with React Hook Form and the Zod resolver.
- [`ts-to-zod`](https://github.com/fabien0102/ts-to-zod): Convert TypeScript definitions into Zod schemas.
- [`zod-mocking`](https://github.com/dipasqualew/zod-mocking): Generate mock data from your Zod schemas.
- [`zod-fast-check`](https://github.com/DavidTimms/zod-fast-check): Generate `fast-check` arbitraries from Zod schemas.
- [`zod-endpoints`](https://github.com/flock-community/zod-endpoints): Contract-first strictly typed endpoints with Zod. OpenAPI compatible.
- [`express-zod-api`](https://github.com/RobinTail/express-zod-api): Build Express-based APIs with I/O schema validation and custom middlewares

# Basic usage

Creating a simple string schema

```ts
import { z } from "zod";

// creating a schema for strings
const mySchema = z.string();
mySchema.parse("tuna"); // => "tuna"
mySchema.parse(12); // => throws ZodError
```

Creating an object schema

```ts
import { z } from "zod";

const User = z.object({
  username: z.string(),
});

User.parse({ username: string });

// extract the inferred type
type User = z.infer<typeof User>;
// { username: string }
```

# Defining schemas

## Primitives

```ts
import { z } from "zod";

// primitive values
z.string();
z.number();
z.bigint();
z.boolean();
z.date();

// empty types
z.undefined();
z.null();
z.void(); // accepts null or undefined

// catch-all types
// allows any value
z.any();
z.unknown();

// never type
// allows no values
z.never();
```

## Literals

```ts
const tuna = z.literal("tuna");
const twelve = z.literal(12);
const tru = z.literal(true);
```

> Currently there is no support for Date or bigint literals in Zod. If you have a use case for this feature, please file an issue.

## Strings

Zod includes a handful of string-specific validations.

```ts
z.string().max(5);
z.string().min(5);
z.string().length(5);
z.string().email();
z.string().url();
z.string().uuid();
z.string().regex(regex);

// deprecated, equivalent to .min(1)
z.string().nonempty();
```

> Use the `.nonempty` method if you want the empty string ( `""` ) to be considered invalid.

> Check out [validator.js](https://github.com/validatorjs/validator.js) for a bunch of other useful string validation functions.

#### Custom error messages

Optionally, you can pass in a second argument to provide a custom error message.

```ts
z.string().min(5, { message: "Must be 5 or more characters long" });
z.string().max(5, { message: "Must be 5 or fewer characters long" });
z.string().length(5, { message: "Must be exactly 5 characters long" });
z.string().email({ message: "Invalid email address." });
z.string().url({ message: "Invalid url" });
z.string().uuid({ message: "Invalid UUID" });
```

## Numbers

Zod includes a handful of number-specific validations.

```ts
z.number().min(5);
z.number().max(5);

z.number().int(); // value must be an integer

z.number().positive(); //     > 0
z.number().nonnegative(); //  >= 0
z.number().negative(); //     < 0
z.number().nonpositive(); //  <= 0
```

Optionally, you can pass in a second argument to provide a custom error message.

```ts
z.number().max(5, { message: "this👏is👏too👏big" });
```

## Objects

```ts
// all properties are required by default
const Dog = z.object({
  name: z.string(),
  age: z.number(),
});

// extract the inferred type like this
type Dog = z.infer<typeof Dog>;

// equivalent to:
type Dog = {
  name: string;
  age: number;
};
```

### `.shape`

Use `.shape` to access the schemas for a particular key.

```ts
Dog.shape.name; // => string schema
Dog.shape.age; // => number schema
```

### `.extend`

You can add additional fields an object schema with the `.extend` method.

```ts
const DogWithBreed = Dog.extend({
  breed: z.string(),
});
```

You can use `.extend` to overwrite fields! Be careful with this power!

### `.merge`

Equivalent to `A.extend(B.shape)`.

```ts
const BaseTeacher = z.object({ students: z.array(z.string()) });
const HasID = z.object({ id: z.string() });

const Teacher = BaseTeacher.merge(HasID);
type Teacher = z.infer<typeof Teacher>; // => { students: string[], id: string }
```

> If the two schemas share keys, the properties of B overrides the property of A. The returned schema also inherits the "unknownKeys" policy (strip/strict/passthrough) and the catchall schema of B.

### `.pick/.omit`

Inspired by TypeScript's built-in `Pick` and `Omit` utility types, all Zod object schemas have `.pick` and `.omit` methods that return a modified version. Consider this Recipe schema:

```ts
const Recipe = z.object({
  id: z.string(),
  name: z.string(),
  ingredients: z.array(z.string()),
});
```

To only keep certain keys, use `.pick` .

```ts
const JustTheName = Recipe.pick({ name: true });
type JustTheName = z.infer<typeof JustTheName>;
// => { name: string }
```

To remove certain keys, use `.omit` .

```ts
const NoIDRecipe = Recipe.omit({ id: true });

type NoIDRecipe = z.infer<typeof NoIDRecipe>;
// => { name: string, ingredients: string[] }
```

### `.partial`

Inspired by the built-in TypeScript utility type [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialt), the `.partial` method makes all properties optional.

Starting from this object:

```ts
const user = z.object({
  username: z.string(),
});
// { username: string }
```

We can create a partial version:

```ts
const partialUser = user.partial();
// { username?: string | undefined }
```

### `.deepPartial`

The `.partial` method is shallow — it only applies one level deep. There is also a "deep" version:

```ts
const user = z.object({
  username: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

const deepPartialUser = user.deepPartial();

/* 
{
  username?: string | undefined, 
  location?: {
    latitude?: number | undefined;
    longitude?: number | undefined;
  } | undefined
}
*/
```

> Important limitation: deep partials only work as expected in direct hierarchies of object schemas. A nested object schema can't be optional, nullable, contain refinements, contain transforms, etc.

#### Unrecognized keys

By default Zod objects schemas strip out unrecognized keys during parsing.

```ts
const person = z.object({
  name: z.string(),
});

person.parse({
  name: "bob dylan",
  extraKey: 61,
});
// => { name: "bob dylan" }
// extraKey has been stripped
```

### `.passthrough`

Instead, if you want to pass through unknown keys, use `.passthrough()` .

```ts
person.passthrough().parse({
  name: "bob dylan",
  extraKey: 61,
});
// => { name: "bob dylan", extraKey: 61 }
```

### `.strict`

You can _disallow_ unknown keys with `.strict()` . If there are any unknown keys in the input, Zod will throw an error.

```ts
const person = z
  .object({
    name: z.string(),
  })
  .strict();

person.parse({
  name: "bob dylan",
  extraKey: 61,
});
// => throws ZodError
```

### `.strip`

You can use the `.strip` method to reset an object schema to the default behavior (stripping unrecognized keys).

### `.catchall`

You can pass a "catchall" schema into an object schema. All unknown keys will be validated against it.

```ts
const person = z
  .object({
    name: z.string(),
  })
  .catchall(z.number());

person.parse({
  name: "bob dylan",
  validExtraKey: 61, // works fine
});

person.parse({
  name: "bob dylan",
  validExtraKey: false, // fails
});
// => throws ZodError
```

Using `.catchall()` obviates `.passthrough()` , `.strip()` , or `.strict()`. All keys are now considered "known".

## Arrays

```ts
const stringArray = z.array(z.string());

// equivalent
const stringArray = z.string().array();
```

Be careful with the `.array()` method. It returns a new `ZodArray` instance. This means the _order_ in which you call methods matters. For instance:

```ts
z.string().optional().array(); // (string | undefined)[]
z.string().array().optional(); // string[] | undefined
```

### `.nonempty`

If you want to ensure that an array contains at least one element, use `.nonempty()`.

```ts
const nonEmptyStrings = z.string().array().nonempty();
// the inferred type is now
// [string, ...string[]]

nonEmptyStrings.parse([]); // throws: "Array cannot be empty"
nonEmptyStrings.parse(["Ariana Grande"]); // passes
```

### `.min/.max/.length`

```ts
z.string().array().min(5); // must contain 5 or more items
z.string().array().max(5); // must contain 5 or fewer items
z.string().array().length(5); // must contain 5 items exactly
```

Unlike `.nonempty()` these methods do not change the inferred type.

## Unions

Zod includes a built-in `z.union` method for composing "OR" types.

```ts
const stringOrNumber = z.union([z.string(), z.number()]);

stringOrNumber.parse("foo"); // passes
stringOrNumber.parse(14); // passes
```

Zod will test the input against each of the "options" in order and return the first value that validates successfully.

For convenience, you can also use the `.or` method:

```ts
const stringOrNumber = z.string().or(z.number());
```

## Optionals

You can make any schema optional with `z.optional()`:

```ts
const schema = z.optional(z.string());

schema.parse(undefined); // => returns undefined
type A = z.infer<typeof A>; // string | undefined
```

You can make an existing schema optional with the `.optional()` method:

```ts
const user = z.object({
  username: z.string().optional(),
});
type C = z.infer<typeof C>; // { username?: string | undefined };
```

#### `.unwrap`

```ts
const stringSchema = z.string();
const optionalString = stringSchema.optional();
optionalString.unwrap() === stringSchema; // true
```

## Nullables

Similarly, you can create nullable types like so:

```ts
const nullableString = z.nullable(z.string());
nullableString.parse("asdf"); // => "asdf"
nullableString.parse(null); // => null
```

You can make an existing schema nullable with the `nullable` method:

```ts
const E = z.string().nullable(); // equivalent to D
type E = z.infer<typeof D>; // string | null
```

#### `.unwrap`

```ts
const stringSchema = z.string();
const nullableString = stringSchema.nullable();
nullableString.unwrap() === stringSchema; // true
```

<!--

``` ts
/* Custom Union Types */

const F = z
  .union([z.string(), z.number(), z.boolean()])
  .optional()
  .nullable();

F.parse('tuna'); // => tuna
F.parse(42); // => 42
F.parse(true); // => true
F.parse(undefined); // => undefined
F.parse(null); // => null
F.parse({}); // => throws Error!

type F = z.infer<typeof F>; // string | number | boolean | undefined | null;
``` -->

## Records

Record schemas are used to validate types such as `{ [k: string]: number }`.

If you want to validate the _values_ of an object against some schema but don't care about the keys, use `Record`.

```ts
const NumberCache = z.record(z.number());

type NumberCache = z.infer<typeof NumberCache>;
// => { [k: string]: number }
```

This is particularly useful for storing or caching items by ID.

```ts
const userStore: UserStore = {};

userStore["77d2586b-9e8e-4ecf-8b21-ea7e0530eadd"] = {
  name: "Carlotta",
}; // passes

userStore["77d2586b-9e8e-4ecf-8b21-ea7e0530eadd"] = {
  whatever: "Ice cream sundae",
}; // TypeError
```

#### A note on numerical keys

You may have expected `z.record()` to accept two arguments, one for the keys and one for the values. After all, TypeScript's built-in Record type does: `Record<KeyType, ValueType>` . Otherwise, how do you represent the TypeScript type `Record<number, any>` in Zod?

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

As you can see, JavaScript automatically casts all object keys to strings under the hood.

Since Zod is trying to bridge the gap between static and runtime types, it doesn't make sense to provide a way of creating a record schema with numerical keys, since there's no such thing as a numerical key in runtime JavaScript.

## Maps

```ts
const stringNumberMap = z.map(z.string(), z.number());

type StringNumberMap = z.infer<typeof stringNumberMap>;
// type StringNumber = Map<string, number>
```

## Sets

```ts
const numberSet = z.set(z.string());
type numberSet = z.infer<typeof numberSet>;
// Set<number>
```

## Enums

There are two ways to define enums in Zod.

### Zod enums

<!-- An enum is just a union of string literals, so you _could_ define an enum like this:

```ts
const FishEnum = z.union([
  z.literal("Salmon"),
  z.literal("Tuna"),
  z.literal("Trout"),
]);

FishEnum.parse("Salmon"); // => "Salmon"
FishEnum.parse("Flounder"); // => throws
```

For convenience Zod provides a built-in `z.enum()` function. Here's is the equivalent code: -->

```ts
const FishEnum = z.enum(["Salmon", "Tuna", "Trout"]);
type FishEnum = z.infer<typeof FishEnum>;
// 'Salmon' | 'Tuna' | 'Trout'
```

You must pass the array of values directly into `z.enum()`. This does not work:

```ts
const fish = ["Salmon", "Tuna", "Trout"];
const FishEnum = z.enum(fish);
```

In that case, Zod isn't able to infer the individual enum elements; instead the inferred type will be `string` instead of `'Salmon' | 'Tuna' | 'Trout'`

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
FishEnum.options; // ["Salmon", "Tuna", "Trout"]);
```

### Native enums

Zod enums are the recommended approach to defining and validating enums. But if you need to validate against an enum from a third-party library (or you don't want to rewrite your existing enums) you can use `z.nativeEnum()` .

**Numeric enums**

```ts
enum Fruits {
  Apple,
  Banana,
}

const FruitEnum = z.nativeEnum(Fruits);
type FruitEnum = z.infer<typeof FruitEnum>; // Fruits

FruitEnum.parse(Fruits.Apple); // passes
FruitEnum.parse(Fruits.Banana); // passes
FruitEnum.parse(0); // passes
FruitEnum.parse(1); // passes
FruitEnum.parse(3); // fails
```

**String enums**

```ts
enum Fruits {
  Apple = "apple",
  Banana = "banana",
  Cantaloupe, // you can mix numerical and string enums
}

const FruitEnum = z.nativeEnum(Fruits);
type FruitEnum = z.infer<typeof FruitEnum>; // Fruits

FruitEnum.parse(Fruits.Apple); // passes
FruitEnum.parse(Fruits.Cantaloupe); // passes
FruitEnum.parse("apple"); // passes
FruitEnum.parse("banana"); // passes
FruitEnum.parse(0); // passes
FruitEnum.parse("Cantaloupe"); // fails
```

**Const enums**

The `.nativeEnum()` function works for `as const` objects as well. ⚠️ `as const` required TypeScript 3.4+!

```ts
const Fruits = {
  Apple: "apple",
  Banana: "banana",
  Cantaloupe: 3,
} as const;

const FruitEnum = z.nativeEnum(Fruits);
type FruitEnum = z.infer<typeof FruitEnum>; // "apple" | "banana" | 3

FruitEnum.parse("apple"); // passes
FruitEnum.parse("banana"); // passes
FruitEnum.parse(3); // passes
FruitEnum.parse("Cantaloupe"); // fails
```

## Intersections

<!-- > ⚠️ Intersections are deprecated. If you are trying to merge objects, use the `.merge` method instead. -->

Intersections are useful for creating "logical AND" types. This is useful for intersecting two object types.

```ts
const Person = z.object({
  name: z.string(),
});

const Employee = z.object({
  role: z.string(),
});

const EmployedPerson = z.intersection(Person, Employee);

// equivalent to:
const EmployedPerson = Person.and(Employee);
```

Though in many cases, it is recommended to use `A.merge(B)` to merge two objects. The `.merge` method returns a new `ZodObject` instance, whereas `A.and(B)` returns a less useful `ZodIntersection` instance that lacks common object methods like `pick` and `omit`.

```ts
const a = z.union([z.number(), z.string()]);
const b = z.union([z.number(), z.boolean()]);
const c = z.intersection(a, b);

type c = z.infer<typeof c>; // => number
```

<!-- Intersections in Zod are not smart. Whatever data you pass into `.parse()` gets passed into the two intersected schemas. Because Zod object schemas don't allow any unknown keys by default, there are some unintuitive behavior surrounding intersections of object schemas. -->

<!--

``` ts
const A = z.object({
  a: z.string(),
});

const B = z.object({
  b: z.string(),
});

const AB = z.intersection(A, B);

type Teacher = z.infer<typeof Teacher>;
// { id:string; name:string };
```  -->

## Tuples

Unlike arrays, tuples have a fixed number of elements and each element can have a different type.

```ts
const athleteSchema = z.tuple([
  z.string(), // name
  z.number(), // jersey number
  z.object({
    pointsScored: z.number(),
  }), // statistics
]);

type Athlete = z.infer<typeof athleteSchema>;
// type Athlete = [string, number, { pointsScored: number }]
```

## Recursive types

You can define a recursive schema in Zod, but because of a limitation of TypeScript, their type can't be statically inferred. Instead you'll need to define the type definition manually, and provide it to Zod as a "type hint".

```ts
interface Category {
  name: string;
  subcategories: Category[];
}

// cast to z.ZodSchema<Category>
const Category: z.ZodSchema<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(Category),
  })
);

Category.parse({
  name: "People",
  subcategories: [
    {
      name: "Politicians",
      subcategories: [{ name: "Presidents", subcategories: [] }],
    },
  ],
}); // passes
```

Unfortunately this code is a bit duplicative, since you're declaring the types twice: once in the interface and again in the Zod definition.

<!-- If your schema has lots of primitive fields, there's a way of reducing the amount of duplication:

```ts
// define all the non-recursive stuff here
const BaseCategory = z.object({
  name: z.string(),
  tags: z.array(z.string()),
  itemCount: z.number(),
});

// create an interface that extends the base schema
interface Category extends z.infer<typeof BaseCategory> {
  subcategories: Category[];
}

// merge the base schema with
// a new Zod schema containing relations
const Category: z.ZodSchema<Category> = BaseCategory.merge(
  z.object({
    subcategories: z.lazy(() => z.array(Category)),
  })
);
``` -->

#### JSON type

If you want to validate any JSON value, you can use the snippet below.

```ts
type Literal = boolean | null | number | string;
type Json = Literal | { [key: string]: Json } | Json[];
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

jsonSchema.parse(data);
```

Thanks to [ggoodman](https://github.com/ggoodman) for suggesting this.

#### Cyclical objects

Despite supporting recursive schemas, passing an cyclical data into Zod will cause an infinite loop.

## Promises

```ts
const numberPromise = z.promise(z.number());
```

"Parsing" works a little differently with promise schemas. Validation happens in two parts:

1. Zod synchronously checks that the input is an instance of Promise (i.e. an object with `.then` and `.catch` methods.).
2. Zod uses `.then` to attach an additional validation step onto the existing Promise. You'll have to use `.catch` on the returned Promise to handle validation failures.

```ts
numberPromise.parse("tuna");
// ZodError: Non-Promise type: string

numberPromise.parse(Promise.resolve("tuna"));
// => Promise<number>

const test = async () => {
  await numberPromise.parse(Promise.resolve("tuna"));
  // ZodError: Non-number type: string

  await numberPromise.parse(Promise.resolve(3.14));
  // => 3.14
};
```

<!-- #### Non-native promise implementations

When "parsing" a promise, Zod checks that the passed value is an object with `.then` and `.catch` methods — that's it. So you should be able to pass non-native Promises (Bluebird, etc) into `z.promise(...).parse` with no trouble. One gotcha: the return type of the parse function will be a _native_ `Promise` , so if you have downstream logic that uses non-standard Promise methods, this won't work. -->

## Instanceof

You can use `z.instanceof` to check that the input is an instance of a class. This is useful to validate inputs against classes that are exported from third-party libraries.

```ts
class Test {
  name: string;
}

const TestSchema = z.instanceof(Test);

const blob: any = "whatever";
TestSchema.parse(new Test()); // passes
TestSchema.parse("blob"); // throws
```

## Function schemas

Zod also lets you define "function schemas". This makes it easy to validate the inputs and outputs of a function without intermixing your validation code and "business logic".

You can create a function schema with `z.function(args, returnType)` .

```ts
const myFunction = z.function();

type myFunction = z.infer<typeof myFunction>;
// => ()=>unknown
```

**Define inputs and output**

```ts
const myFunction = z
  .function()
  .args(z.string(), z.number()) // accepts an arbitrary number of arguments
  .returns(z.boolean());
type myFunction = z.infer<typeof myFunction>;
// => (arg0: string, arg1: number)=>boolean
```

**Extract the input and output schemas**
You can extract the parameters and return type of a function schema.

```ts
myFunction.parameters();
// => ZodTuple<[ZodString, ZodNumber]>

myFunction.returnType();
// => ZodBoolean
```

<!-- `z.function()` accepts two arguments:

* `args: ZodTuple` The first argument is a tuple (created with `z.tuple([...])` and defines the schema of the arguments to your function. If the function doesn't accept arguments, you can pass an empty tuple (`z.tuple([])`).
* `returnType: any Zod schema` The second argument is the function's return type. This can be any Zod schema. -->

> You can use the special `z.void()` option if your function doesn't return anything. This will let Zod properly infer the type of void-returning functions. (Void-returning function can actually return either undefined or null.)

<!--

``` ts
const args = z.tuple([z.string()]);

const returnType = z.number();

const myFunction = z.function(args, returnType);
type myFunction = z.infer<typeof myFunction>;
// => (arg0: string)=>number
``` -->

Function schemas have an `.implement()` method which accepts a function and returns a new function that automatically validates it's inputs and outputs.

```ts
const trimmedLength = z
  .function()
  .args(z.string()) // accepts an arbitrary number of arguments
  .returns(z.number())
  .implement((x) => {
    // TypeScript knows x is a string!
    return x.trim().length;
  });

trimmedLength("sandwich"); // => 8
trimmedLength(" asdf "); // => 4
```

If you only care about validating inputs, that's fine:

```ts
const myFunction = z
  .function()
  .args(z.string())
  .implement((arg) => {
    return [arg.length]; //
  });
myFunction; // (arg: string)=>number[]
```

# ZodType: methods and properties

All Zod schemas contain certain methods.

### `.parse`

`.parse(data:unknown): T`

Given any Zod schema, you can call its `.parse` method to check `data` is valid. If it is, a value is returned with full type information! Otherwise, an error is thrown.

> IMPORTANT: In Zod 2 and Zod 1.11+, the value returned by `.parse` is a _deep clone_ of the variable you passed in. This was also the case in zod@1.4 and earlier.

```ts
const stringSchema = z.string();
stringSchema.parse("fish"); // => returns "fish"
stringSchema.parse(12); // throws Error('Non-string type: number');
```

### `.parseAsync`

`.parseAsync(data:unknown): Promise<T>`

If you use asynchronous [refinements](#refinements) or [transforms](#transformers) (more on those later), you'll need to use `.parseAsync`

```ts
const stringSchema = z.string().refine(async (val) => val.length > 20);
const value = await stringSchema.parseAsync("hello"); // => hello
```

### `.safeParse`

`.safeParse(data:unknown): { success: true; data: T; } | { success: false; error: ZodError; }`

If you don't want Zod to throw errors when validation fails, use `.safeParse`. This method returns an object containing either the successfully parsed data or a ZodError instance containing detailed information about the validation problems.

```ts
stringSchema.safeParse(12);
// => { success: false; error: ZodError }

stringSchema.safeParse("billie");
// => { success: true; data: 'billie' }
```

The result is a _discriminated union_ so you can handle errors very conveniently:

```ts
const result = stringSchema.safeParse("billie");
if (!result.success) {
  // handle error then return
  result.error;
} else {
  // do something
  result.data;
}
```

### `.safeParseAsync`

> Alias: `.spa`

An asynchronous version of `safeParse`.

```ts
await stringSchema.safeParseAsync("billie");
```

For convenience, this has been aliased to `.spa`:

```ts
await stringSchema.spa("billie");
```

### `.refine`

`.refine(validator: (data:T)=>any, params?: RefineParams)`

Zod lets you provide custom validation logic via _refinements_. (For advanced features like creating multiple issues and customizing error codes, see [`.superRefine`](#superrefine).)

Zod was designed to mirror TypeScript as closely as possible. But there are many so-called "refinement types" you may wish to check for that can't be represented in TypeScript's type system. For instance: checking that a number is an integer or that a string is a valid email address.

For example, you can define a custom validation check on _any_ Zod schema with `.refine` :

```ts
const myString = z.string().refine((val) => val.length <= 255, {
  message: "String can't be more than 255 characters",
});
```

> ⚠️ Refinement functions should not throw. Instead they should return a falsy value to signal failure.

#### Arguments

As you can see, `.refine` takes two arguments.

1. The first is the validation function. This function takes one input (of type `T` — the inferred type of the schema) and returns `any`. Any truthy value will pass validation. (Prior to zod@1.6.2 the validation function had to return a boolean.)
2. The second argument accepts some options. You can use this to customize certain error-handling behavior:

```ts
type RefineParams = {
  // override error message
  message?: string;

  // appended to error path
  path?: (string | number)[];

  // params object you can use to customize message
  // in error map
  params?: object;
};
```

For advanced cases, the second argument can also be a function that returns `RefineParams`/

```ts
z.string().refine(
  (val) => val.length > 10,
  (val) => ({ message: `${val} is not more than 10 characters` })
);
```

#### Customize error path

```ts
const passwordForm = z
  .object({
    password: z.string(),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"], // path of error
  })
  .parse({ password: "asdf", confirm: "qwer" });
```

Because you provided a `path` parameter, the resulting error will be:

```ts
ZodError {
  issues: [{
    "code": "custom",
    "path": [ "confirm" ],
    "message": "Passwords don't match"
  }]
}
```

#### Asynchronous refinements

Refinements can also be async:

```ts
const userId = z.string().refine(async (id) => {
  // verify that ID exists in database
  return true;
});
```

> ⚠️If you use async refinements, you must use the `.parseAsync` method to parse data! Otherwise Zod will throw an error.

#### Relationship to transforms

Transforms and refinements can be interleaved:

```ts
z.string()
  .transform((val) => val.length)
  .refine((val) => val > 25);
```

<!-- Note that the `path` is set to `["confirm"]` , so you can easily display this error underneath the "Confirm password" textbox.


```ts
const allForms = z.object({ passwordForm }).parse({
  passwordForm: {
    password: "asdf",
    confirm: "qwer",
  },
});
```

would result in

```

ZodError {
  issues: [{
    "code": "custom",
    "path": [ "passwordForm", "confirm" ],
    "message": "Passwords don't match"
  }]
}
``` -->

### `.superRefine`

The `.refine` method is actually syntactic sugar atop a more versatile (and verbose) method called `superRefine`. Here's an example:

```ts
const Strings = z.array(z.string()).superRefine((val, ctx) => {
  if (val.length > 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: 3,
      type: "array",
      inclusive: true,
      message: "Too many items 😡",
    });
  }

  if (val.length !== new Set(val).size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No duplicated allowed.`,
    });
  }
});
```

You can add as many issues as you like. If `ctx.addIssue` is NOT called during the execution of the function, validation passes.

Normally refinements always create issues with a `ZodIssueCode.custom` error code, but with `superRefine` you can create any issue of any code. Each issue code is described in detail in the Error Handling guide (ERROR_HANDLING.md).

### `.transform`

To transform data after parsing, use the `transform` method.

```ts
const stringToNumber = z.string().transform((val) => myString.length);
stringToNumber.parse("string"); // => 6
```

> ⚠️ Transformation functions must not throw. Make sure to use refinements before the transformer to make sure the input can be parsed by the transformer.

#### Chaining order

Note that `stringToNumber` above is an instance of the `ZodEffects` subclass. It is NOT an instance of `ZodString`. If you want to use the built-in methods of `ZodString` (e.g. `.email()`) you must apply those methods _before_ any transformations.

```ts
const emailToDomain = z
  .string()
  .email()
  .transform((val) => val.split("@")[1]);

emailToDomain.parse("colinhacks@example.com"); // => example.com
```

#### Relationship to refinements

Transforms and refinements can be interleaved:

```ts
z.string()
  .transform((val) => val.length)
  .refine((val) => val > 25);
```

#### Async transformations

Transformations can also be async.

```ts
const IdToUser = z.transformer(
  z.string().uuid(),
  UserSchema,
  (userId) => async (id) => {
    return await getUserById(id);
  }
);
```

> ⚠️ If your schema contains asynchronous transformers, you must use .parseAsync() or .safeParseAsync() to parse data. Otherwise Zod will throw an error.

### `.default`

You can use transformers to implement the concept of "default values" in Zod.

```ts
const stringWithDefault = z.string().default("tuna");

stringWithDefault.parse(undefined); // => "tuna"
```

Optionally, you can pass a function into `.default` that will be re-executed whenever a default value needs to be generated:

```ts
const numberWithRandomDefault = z.number().default(Math.random);

numberWithRandomDefault.parse(undefined); // => 0.4413456736055323
numberWithRandomDefault.parse(undefined); // => 0.1871840107401901
numberWithRandomDefault.parse(undefined); // => 0.7223408162401552
```

### `.optional`

A convenience method that returns an optional version of a schema.

```ts
const optionalString = z.string().optional(); // string | undefined

// equivalent to
z.optional(z.string());
```

### `.nullable`

A convenience method that returns an nullable version of a schema.

```ts
const nullableString = z.string().nullable(); // string | null

// equivalent to
z.nullable(z.string());
```

### `.nullish`

A convenience method that returns a "nullish" version of a schema. Nullish schemas will accept both `undefined` and `null`. Read more about the concept of "nullish" [here](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing).

```ts
const nullishString = z.string().nullish(); // string | null | undefined

// equivalent to
z.string().optional().nullable();
```

### `.array`

A convenience method that returns an array schema for the given type:

```ts
const nullableString = z.string().array(); // string[]

// equivalent to
z.array(z.string());
```

### `.or`

A convenience method for union types.

```ts
z.string().or(z.number()); // string | number

// equivalent to
z.union([z.string(), z.number()]);
```

### `.and`

A convenience method for creating interesection types.

```ts
z.object({ name: z.string() }).and(z.object({ age: z.number() })); // { name: string } & { age: number }

// equivalent to
z.intersection(z.string(), z.number());
```

# Type inference

You can extract the TypeScript type of any schema with `z.infer<typeof mySchema>` .

```ts
const A = z.string();
type A = z.infer<typeof A>; // string

const u: A = 12; // TypeError
const u: A = "asdf"; // compiles
```

#### What about transforms?

In reality each Zod schema is actually associated with **two** types: an input and an output. For most schemas (e.g. `z.string()`) these two are the same. But once you add transforms into the mix, these two values can diverge. For instance `z.string().transform(val => val.length)` has an input of `string` and an output of `number`.

You can separately extract the input and output types like so:

```ts
const stringToNumber = z.string().transform((val) => val.length);

// ⚠️ Important: z.infer returns the OUTPUT type!
type input = z.input<stringToNumber>; // string
type output = z.output<stringToNumber>; // number

// equivalent to z.output!
type inferred = z.infer<stringToNumber>; // number
```

# Errors

Zod provides a subclass of Error called `ZodError`. ZodErrors contain an `issues` array containing detailed information about the validation problems.

```ts
const data = z
  .object({
    name: z.string(),
  })
  .safeParse({ name: 12 });

if (!data.success) {
  data.error.issues;
  /* [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": [ "name" ],
        "message": "Expected string, received number"
      }
  ] */
}
```

#### Error formatting

You can use the `.format()` method to convert this error into a nested object.

```ts
data.error.format();
/* {
  name: { _errors: [ 'Expected string, received number' ] }
} */
```

For detailed information about the possible error codes and how to customize error messages, check out the dedicated error handling guide: [ERROR_HANDLING.md](ERROR_HANDLING.md)

# Comparison

There are a handful of other widely-used validation libraries, but all of them have certain design limitations that make for a non-ideal developer experience.

<!-- The table below summarizes the feature differences. Below the table there are more involved discussions of certain alternatives, where necessary. -->

<!-- | Feature                                                                                                                | [Zod](https://github.com/colinhacks) | [Joi](https://github.com/hapijs/joi) | [Yup](https://github.com/jquense/yup) | [io-ts](https://github.com/gcanti/io-ts) | [Runtypes](https://github.com/pelotom/runtypes) | [ow](https://github.com/sindresorhus/ow) | [class-validator](https://github.com/typestack/class-validator) |
| ---------------------------------------------------------------------------------------------------------------------- | :-----------------------------: | :----------------------------------: | :-----------------------------------: | :--------------------------------------: | :---------------------------------------------: | :--------------------------------------: | :-------------------------------------------------------------: |
| <abbr title='Any ability to extract a TypeScript type from a validator instance counts.'>Type inference</abbr>         |               🟢                |                  🔴                  |                  🟢                   |                    🟢                    |                       🟢                        |                    🟢                    |                               🟢                                |
| <abbr title="Yup's inferred types are incorrect in certain cases, see discussion below.">Correct type inference</abbr> |               🟢                |                  🔴                  |                  🔴                   |                    🟢                    |                       🟢                        |                    🟢                    |                               🟢                                |

<abbr title="number, string, boolean, null, undefined">Primitive Types</abbr>
<abbr title="Includes any checks beyond 'Is this a string?', e.g. min/max length, isEmail, isURL, case checking, etc.">String Validation</abbr>
<abbr title="Includes any checks beyond 'Is this a number?', e.g. min/max, isPositive, integer vs float, etc.">Number Validation</abbr>
Dates

Primitive Literals
Object Literals
Tuple Literals
Objects
Arrays
Non-empty arrays
Unions
Optionals
Nullable
Enums
Enum Autocomplete
Intersections
Object Merging
Tuples
Recursive Types
Function Schemas

<abbr title="For instance, Yup allows custmo error messages with the syntax yup.number().min(5, 'Number must be more than 5!')">Validation Messages</abbr>
Immutable instances
Type Guards
Validity Checking
Casting
Default Values
Rich Errors
Branded -->

<!-- - Missing object methods: (pick, omit, partial, deepPartial, merge, extend)

* Missing nonempty arrays with proper typing (`[T, ...T[]]`)
* Missing lazy/recursive types
* Missing promise schemas
* Missing function schemas
* Missing union & intersection schemas
* Missing support for parsing cyclical data (maybe)
* Missing error customization -->

#### Joi

[https://github.com/hapijs/joi](https://github.com/hapijs/joi)

Doesn't support static type inference 😕

#### Yup

[https://github.com/jquense/yup](https://github.com/jquense/yup)

Yup is a full-featured library that was implemented first in vanilla JS, and later rewritten in TypeScript.

Differences

- Supports for casting and transformation
- All object fields are optional by default
- Missing object methods: (partial, deepPartial)
<!-- - Missing nonempty arrays with proper typing (`[T, ...T[]]`) -->
- Missing promise schemas
- Missing function schemas
- Missing union & intersection schemas

<!-- ¹Yup has a strange interpretation of the word `required`. Instead of meaning "not undefined", Yup uses it to mean "not empty". So `yup.string().required()` will not accept an empty string, and `yup.array(yup.string()).required()` will not accept an empty array. Instead, Yup us Zod arrays there is a dedicated `.nonempty()` method to indicate this, or you can implement it with a custom refinement. -->

#### io-ts

[https://github.com/gcanti/io-ts](https://github.com/gcanti/io-ts)

io-ts is an excellent library by gcanti. The API of io-ts heavily inspired the design of Zod.

In our experience, io-ts prioritizes functional programming purity over developer experience in many cases. This is a valid and admirable design goal, but it makes io-ts particularly hard to integrate into an existing codebase with a more procedural or object-oriented bias. For instance, consider how to define an object with optional properties in io-ts:

```ts
import * as t from "io-ts";

const A = t.type({
  foo: t.string,
});

const B = t.partial({
  bar: t.number,
});

const C = t.intersection([A, B]);

type C = t.TypeOf<typeof C>;
// returns { foo: string; bar?: number | undefined }
```

You must define the required and optional props in separate object validators, pass the optionals through `t.partial` (which marks all properties as optional), then combine them with `t.intersection` .

Consider the equivalent in Zod:

```ts
const C = z.object({
  foo: z.string(),
  bar: z.number().optional(),
});

type C = z.infer<typeof C>;
// returns { foo: string; bar?: number | undefined }
```

This more declarative API makes schema definitions vastly more concise.

`io-ts` also requires the use of gcanti's functional programming library `fp-ts` to parse results and handle errors. This is another fantastic resource for developers looking to keep their codebase strictly functional. But depending on `fp-ts` necessarily comes with a lot of intellectual overhead; a developer has to be familiar with functional programming concepts and the `fp-ts` nomenclature to use the library.

- Supports codecs with serialization & deserialization transforms
- Supports branded types
- Supports advanced functional programming, higher-kinded types, `fp-ts` compatibility
- Missing object methods: (pick, omit, partial, deepPartial, merge, extend)
- Missing nonempty arrays with proper typing (`[T, ...T[]]`)
- Missing lazy/recursive types
- Missing promise schemas
- Missing function schemas
- Missing union & intersection schemas
- Missing support for parsing cyclical data (maybe)
- Missing error customization

#### Runtypes

[https://github.com/pelotom/runtypes](https://github.com/pelotom/runtypes)

Good type inference support, but limited options for object type masking (no `.pick` , `.omit` , `.extend` , etc.). No support for `Record` s (their `Record` is equivalent to Zod's `object` ). They DO support branded and readonly types, which Zod does not.

- Supports "pattern matching": computed properties that distribute over unions
- Supports readonly types
- Missing object methods: (deepPartial, merge)
- Missing nonempty arrays with proper typing (`[T, ...T[]]`)
- Missing promise schemas
- Missing error customization

#### Ow

[https://github.com/sindresorhus/ow](https://github.com/sindresorhus/ow)

Ow is focused on function input validation. It's a library that makes it easy to express complicated assert statements, but it doesn't let you parse untyped data. They support a much wider variety of types; Zod has a nearly one-to-one mapping with TypeScript's type system, whereas ow lets you validate several highly-specific types out of the box (e.g. `int32Array` , see full list in their README).

If you want to validate function inputs, use function schemas in Zod! It's a much simpler approach that lets you reuse a function type declaration without repeating yourself (namely, copy-pasting a bunch of ow assertions at the beginning of every function). Also Zod lets you validate your return types as well, so you can be sure there won't be any unexpected data passed downstream.

# Changelog

View the changelog at [CHANGELOG.md](CHANGELOG.md)
