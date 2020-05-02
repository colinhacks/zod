<p align="center">
  <img src="logo.svg" width="200px" align="center" />
  <h1 align="center">Zod</h1>
</p>
<div style="display:flex;flex-direction:row;justify-content:center;flex-wrap:wrap;">

[![License][license-image]][license-url]
[![npm](https://img.shields.io/npm/dw/zod.svg)](https://www.npmjs.com/package/zod)
[![stars](https://img.shields.io/github/stars/vriad/zod)](https://img.shields.io/github/stars/vriad/zod)
[![coverage](./coverage.svg)](./src/__tests__)

</div>

[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/github/license/vriad/zod

<br/>

<!-- Created and maintained by [@vriad](https://twitter.com/vriad). The motivation for this library and a detailed comparison to various alternatives can be found at https://vriad.com/blog/zod.

If you find this package useful, leave a star to help more folks find it ⭐️🤏 -->

<!-- <br/> -->

#### Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [Primitives](#primitives)
  - [Literals](#literals)
  - [Parsing](#parsing)
  - [Type inference](#type-inference)
  - [Custom validation](#custom-validation)
  - [Objects](#objects)
    - [.nonstrict](#unknown-keys)
    - [.merge](#merging)
    - [.augment](#augmentation)
    - [.pick/.omit](#masking)
    - [.partial/.deepPartial](#partials)
  - [Records](#records)
  - [Arrays](#arrays)
    - [.nonempty](#nonempty-arrays)
  - [Unions](#unions)
    - [.optional](#optional-types)
    - [.nullable](#nullable-types)
    - [.enum](#enums)
  - [Intersections](#intersections)
  - [Tuples](#tuples)
  - [Recursive types](#recursive-types)
  - [Promises](#promises)
  - [Function schemas](#function-schemas)
  - [Errors](#errors)
- [Changelog](#changelog)
- [Comparison](#comparison)
  - [Joi](#joi)
  - [Yup](#yup)
  - [io-ts](#io-ts)
  - [Runtypes](#runtypes)

# Installation

To install the latest version:

```sh
npm install --save zod
```

```sh
yarn add zod
```

#### TypeScript versions

Zod 1.0.x is compatible with TypeScript 3.2+.

# Usage

Zod is a validation library designed for optimal developer experience. It's a TypeScript-first schema declaration library with rigorous (and correct!) inferred types, incredible developer experience, and a few killer features missing from the existing libraries.

- It takes advantage of TypeScript generic inference to statically infer the types of your schemas, eliminating the need to define static types and runtime validators separately.
- Eliminates the need to keep static types and runtime validators in sync by hand
- It has a composable, declarative API that makes it easy to define complex types concisely.
- Schemas are immutable. All methods return a new schema instance.

Zod was also designed with some core principles designed to make all declarations as non-magical and developer-friendly as possible:

- All fields are required unless explicitly marked as optional (just like TypeScript!)
- Schemas are immutable; methods (i.e. `.optional()` return a new instance.
- Zod schemas operate on a ["Parse, don't validate!"](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) basis!

## Primitives

```ts
import * as z from 'zod';

const stringSchema = z.string(); // => ZodType<string>
const numberSchema = z.number(); // => ZodType<number>
const bigintSchema = z.bigint(); // => ZodType<bigint>
const booleanSchema = z.boolean(); // => ZodType<boolean>
const dateSchema = z.date(); // => ZodType<Date>

const undefinedSchema = z.undefined(); // => ZodType<undefined>
const nullSchema = z.null(); // => ZodType<null>

const anySchema = z.any(); // => ZodType<any>
const unknownSchema = z.unknown(); // => ZodType<unknown>
```

## Literals

```ts
const tuna = z.literal('tuna'); // => ZodType<'tuna'>
const twelve = z.literal(12); // => ZodType<12>
const tru = z.literal(true); // => ZodType<true>
```

Currently there is no support for Date literals in Zod. If you have a use case for this feature, please file an issue.

## Parsing and validation

### Parsing

Given a Zod schema, you can call its `.parse(data)` method to check `data` is valid. If it is, a value is returned with full type information! Otherwise, an error is thrown.

IMPORTANT: As of Zod 1.4, the value returned by `.parse` is _the same variable you passed in_. Previously it returned a deep clone. One exception: "parsing" a `Promise` schemas returns a new Promise for reasons explained in the documentation.

```ts
const stringSchema = z.string();
stringSchema.parse('fish'); // => "fish"
stringSchema.parse(12); // throws Error('Non-string type: number');
```

### Type guards

You can also use a Zod schema as a type guard using the schema's `.check()` method, like so:

```ts
const stringSchema = z.string();
const blob: any = 'Albuquerque';
if (stringSchema.check(blob)) {
  // blob is now of type `string`
  // within this if statement
}
```

You can use the same method to check for invalid data:

```ts
const stringSchema = z.string();

const process = (blob: any) => {
  if (!stringSchema.check(blob)) {
    throw new Error('Not a string');
  }

  // blob is now of type `string`
  // underneath the if statement
};
```

To learn more about error handling with Zod, jump to [Errors](#errors).

### Custom validation

Every Zod schema has a `.refine` method that lets you define custom validation checks. Zod was designed to mirror TypeScript as closely as possible. But there are many so-called "refinement types" you may wish to check for that can't be represented in TypeScript's type system. For instance: checking that a number is an Int or that a string is a valid email address.

In these cases, you would use the `.refine` method.

```ts
const myString = z.string().refine(val => val.length <= 255, "String can't be more than 255 characters");
```

As you can see, `.refine` takes two arguments. The first is the validation function, and the second is a custom error message . The argument to the validation function (`val` in the example above) is statically typed to be the inferred type of the schema.

Check out [validator.js](https://github.com/validatorjs/validator.js) for a bunch of useful string validation functions.

## Type inference

You can extract the TypeScript type of any schema with `z.infer<typeof [schema]>`.

```ts
const A = z.string();
type A = z.infer<typeof A>; // string

const u: A = 12; // TypeError
const u: A = 'asdf'; // compiles
```

We'll include examples of inferred types throughout the rest of the documentation.

## Objects

```ts
// all properties are required by default
const dogSchema = z.object({
  name: z.string(),
  neutered: z.boolean(),
});

type Dog = z.infer<typeof dogSchema>;
/* 
equivalent to:
type Dog = { 
  name:string; 
  neutered: boolean;
}
*/

const cujo = dogSchema.parse({
  name: 'Cujo',
  neutered: true,
}); // passes, returns Dog

const fido: Dog = {
  name: 'Fido',
}; // TypeError: missing required property `neutered`
```

#### `.shape` property

```ts
const Location = z.object({ latitude: z.number(), longitude: z.number() });

const Business = z.object({
  location: Location,
});

Business.shape.location; // => Location schema
```

#### Merging

You can combine two object schemas with `.merge`, like so:

```ts
const BaseTeacher = z.object({ subjects: z.array(z.string()) });
const HasID = z.object({ id: z.string() });

const Teacher = BaseTeacher.merge(HasId);
type Teacher = z.infer<typeof Teacher>; // => { subjects: string[], id: string }
```

You're able to fluently chain together many `.merge` calls as well:

```ts
// chaining mixins
const Teacher = BaseTeacher.merge(HasId)
  .merge(HasName)
  .merge(HasAddress);
```

`.merge` is just syntactic sugar over the more generic `z.intersection` which is documented below.

IMPORTANT: the schema returned by `.merge` is the _intersection_ of the two schemas. The schema passed into `.merge` does not "overwrite" properties of the original schema. To demonstrate:

```ts
const Obj1 = z.object({ field: z.string() });
const Obj2 = z.object({ field: z.number() });

const Merged = Obj1.merge(Obj2);

type Merged = z.infer<typeof merged>;
// => { field: never }
// because no type can simultaneously be both a string and a number
```

To "overwrite" existing keys, use `.augment` (documented below).

#### Augmentation

You can augment an object schema with the `.augment` method.

```ts
const Animal = z
  .object({
    species: z.string(),
  })
  .augment({
    population: z.number(),
  });
```

⚠️ You can use `.augment` to overwrite fields! Be careful with this power!

```ts
// overwrites `species`
const ModifiedAnimal = Animal.augment({
  species: z.array(z.string()),
});

// => { population: number, species: string[] }
```

#### Masking

Object masking is one of Zod's killer features. It lets you create slight variations of your object schemas easily and succinctly.

```ts
const Recipe = z.object({
  id: z.string(),
  name: z.string(),
  ingredients: z.array(z.string()),
});
```

Inspired by TypeScript's built-in `Pick` and `Omit` utility types, all Zod object schemas have `.pick` and `.omit` methods that return a "masked" version of the schema.

To only keep certain keys, use `.pick`.

```ts
const JustTheName = Recipe.pick({ name: true });

type JustTheName = z.infer<typeof JustTheName>; // => { name: string }
```

To remove certain keys, use `.omit`.

```ts
const NoIDRecipe = Recipe.omit({ id: true });

type NoIDRecipe = z.infer<typeof NoIDRecipe>; // => { name: string, ingredients: string[] }
```

This is useful for database logic, where endpoints often accept as input slightly modified versions of your database schemas. For instance, the input to a hypothetical `createRecipe` endpoint would accept the `NoIDRecipe` type, since the ID will be generated by your database automatically.

This is a vital feature for implementing typesafe backend logic, yet as far as I know, no other validation library (yup, Joi, io-ts, runtypes, class-validator, ow...) offers similar functionality as of this writing (April 2020). This is one of the must-have features that inspired the creation of Zod.

#### Partials

Inspired by the built-in TypeScript utility type [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialt), all Zod object schemas have a `.partial` method that makes all properties optional.

Starting from this object:

```ts
const user = z.object({
  username: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});
/*
  { username: string, location: { city: number, state: number } }
*/
```

We can create a partial version:

```ts
const partialUser = user.partial();
/*
{ 
  username?: string | undefined,
  location?: {
    city: number;
    state: number;
  } | undefined
}
*/

// equivalent to:
const partialUser = z.object({
  username: user.shape.username.optional(),
  location: user.shape.location.optional(),
});
```

Or you can use `.deepPartial`:

```ts
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

Important limitation: deep partials only work as expected in hierarchies of object schemas. It also can't be used on recursive schemas currently, since creating a recursive schema requires casting to the generic `ZodType` type (which doesn't include all the methods of the `ZodObject` class). Currently an improved version of Zod is under development that will have better support for recursive schemas.

#### Unknown keys

IMPORTANT: By default, Zod object schemas _do not_ allow unknown keys.

```ts
dogSchema.parse({
  name: 'Spot',
  neutered: true,
  color: 'brown',
}); // Error(`Unexpected keys in object: 'color'`)
```

This is an intentional decision to make Zod's behavior consistent with TypeScript. Consider this:

```ts
const spot: Dog = {
  name: 'Spot',
  neutered: true,
  color: 'brown',
};
// TypeError: Object literal may only specify known
// properties, and 'color' does not exist in type Dog
```

TypeScript doesn't allow unknown keys when assigning to an object type, so neither does Zod (by default). If you want to allow this, just call the `.nonstrict()` method on any object schema:

```ts
const dogSchemaNonstrict = dogSchema.nonstrict();

dogSchemaNonstrict.parse({
  name: 'Spot',
  neutered: true,
  color: 'brown',
}); // passes
```

This change is reflected in the inferred type as well:

```ts
type NonstrictDog = z.infer<typeof dogSchemaNonstrict>;
/*
{
  name:string; 
  neutered: boolean;
  [k:string]: any;
} 
*/
```

## Records

Records are similar to object schemas, but don't enforce a type restriction on the keys. For instance:

```ts
const objectSchema = z.object({ name: z.string() });
```

`objectSchema` only accepts objects with single key: `name`. You could use `.nonstrict()` to create a schema that accepts unknown keys, but that schema doesn't enforce a type on the _values_ associated with those unknown keys.

```ts
const nonstrict = objectSchema.nonstrict();
type nonstrict = z.infer<typeof nonstrict>;
// => { name: string, [k:string]: any }

const parsed = nonstrict.parse({ name: 'Serena', bar: ['whatever'] });
parsed.bar; // no type information
```

But what if you want an object that enforces a schema on all of the values it contains? That's when you would use a record.

```ts
const User = z.object({
  name: z.string(),
});

const UserStore = z.record(User);
type UserStore = z.infer<typeof UserStore>;
// => { [k: string]: { name: string } }
```

This is particularly useful for storing or caching items by ID.

```ts
const userStore: UserStore = {};

userStore['77d2586b-9e8e-4ecf-8b21-ea7e0530eadd'] = {
  name: 'Carlotta',
}; // passes

userStore['77d2586b-9e8e-4ecf-8b21-ea7e0530eadd'] = {
  whatever: 'Ice cream sundae',
}; // TypeError
```

And of course you can call `.parse` just like any other Zod schema.

```ts
UserStore.parse({
  user_1328741234: { name: 'James' },
}); // => passes
```

#### A note on numerical keys

You may have expected `z.record()` to accept two arguments, one for the keys and one for the values. After all, TypeScript's built-in Record type does (`Record<KeyType, ValueType>`). Otherwise, how do you represent the TypeScript type `Record<number, any>` in Zod?

As it turns out, TypeScript's behavior surrounding `[k: number]` is a little unintuitive:

```ts
const testMap: { [k: number]: string } = {
  1: 'one',
};

for (const key in testMap) {
  console.log(`${key}: ${typeof key}`);
}
// prints: `1: string`
```

As you can see, JavaScript automatically casts all object keys to strings under the hood. Since Zod is trying to bridge the gap between static and runtime types, it doesn't make sense to provide a way of creating a record schema with numerical keys, since there's no such thing as a numerical key in runtime JavaScript.

## Arrays

```ts
const dogsList = z.array(dogSchema);

dogsList.parse([{ name: 'Fido', age: 4, neutered: true }]); // passes

dogsList.parse([]); // passes
```

#### Non-empty lists

```ts
const nonEmptyDogsList = z.array(dogSchema).nonempty();
nonEmptyDogsList.parse([]); // throws Error("Array cannot be empty")
```

## Tuples

These differ from arrays in that they have a fixed number of elements, and each element can have a different type.

```ts
const athleteSchema = z.tuple([
  // takes an array of schemas
  z.string(), // name
  z.number(), // jersey number
  z.object({
    pointsScored: z.number(),
  }), // statistics
]);

type Athlete = z.infer<typeof athleteSchema>;
// type Athlete = [string, number, { pointsScored: number }]
```

## Unions

Zod includes a built-in `z.union` method for composing "OR" types.

```ts
const stringOrNumber = z.union([z.string(), z.number()]);

stringOrNumber.parse('foo'); // passes
stringOrNumber.parse(14); // passes
```

#### Optional types

Unions are the basis for defining optional schemas. An "optional string" is just the union of `string` and `undefined`.

```ts
const A = z.union([z.string(), z.undefined()]);

A.parse(undefined); // => passes, returns undefined
type A = z.infer<typeof A>; // string | undefined
```

Zod provides a shorthand way to make any schema optional:

```ts
const B = z.string().optional(); // equivalent to A

const C = z.object({
  username: z.string().optional(),
});
type C = z.infer<typeof C>; // { username?: string | undefined };
```

#### Nullable types

Similarly, you can create nullable types like so:

```ts
const D = z.union([z.string(), z.null()]);
```

Or you can use the shorthand `.nullable()`:

```ts
const E = z.string().nullable(); // equivalent to D
type E = z.infer<typeof D>; // string | null
```

You can create unions of any two or more schemas.

```ts
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
```

#### Enums

You can combine unions and string literals to create an enum schemas.

```ts
const FishEnum = z.union([z.literal('Salmon'), z.literal('Tuna'), z.literal('Trout')]);

FishEnum.parse('Salmon'); // => "Salmon"
FishEnum.parse('Flounder'); // => throws
```

You can also use the built-in `z.enum()` function, like so:

```ts
const FishEnum = z.enum(['Salmon', 'Tuna', 'Trout']);

// if you use `z.enum([ ... ])`
// you can also autocomplete enum values
// with the computed `.Values` property
FishEnum.Values.Salmon; // => autocompletes
FishEnum.Values;
/* 
=> {
  Salmon: "Salmon",
  Tuna: "Tuna",
  Trout: "Trout",
} 
*/
```

## Intersections

Intersections are useful for creating "logical AND" types.

```ts
const a = z.union([z.number(), z.string()]);
const b = z.union([z.number(), z.boolean()]);

const c = z.intersection(a, b);
type c = z.infer<typeof C>; // => number

const stringAndNumber = z.intersection(z.string(), z.number());
type Never = z.infer<typeof stringAndNumber>; // => never
```

This is particularly useful for defining "schema mixins" that you can apply to multiple schemas.

```ts
const HasId = z.object({
  id: z.string(),
});

const BaseTeacher = z.object({
  name: z.string(),
});

const Teacher = z.intersection(BaseTeacher, HasId);

type Teacher = z.infer<typeof Teacher>;
// { id:string; name:string };
```

## Recursive types

You can define a recursive schema in Zod, but because of a limitation of TypeScript, their type can't be statically inferred. If you need a recursive Zod schema you'll need to define the type definition manually, and provide it to Zod as a "type hint".

```ts
interface Category {
  name: string;
  subcategories: Category[];
}

const Category: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(Category),
  }),
);

Category.parse({
  name: 'People',
  subcategories: [
    {
      name: 'Politicians',
      subcategories: [{ name: 'Presidents', subcategories: [] }],
    },
  ],
}); // passes
```

Unfortunately this code is a bit duplicative, since you're declaring the types twice: once in the interface and again in the Zod definition. If your schema has lots of primitive fields, there's a way of reducing the amount of duplication:

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
const Category: z.ZodType<Category> = BaseCategory.merge(
  z.object({
    subcategories: z.lazy(() => z.array(Category)),
  }),
);
```

#### Cyclical objects

Validation still works as expected even when there are cycles in the data.

```ts
const cyclicalCategory: any = {
  name: 'Category A',
};

// creating a cycle
cyclicalCategory.subcategories = [cyclicalCategory];

const parsedCategory = Category.parse(cyclicalCategory); // parses successfully

parsedCategory.subcategories[0].subcategories[0].subcategories[0];
// => parsedCategory: Category;
```

## Promises

As of zod@1.3, there is also support for Promise schemas!

```ts
const numberPromise = z.promise(z.number());
```

"Parsing" works a little differently with promise schemas. Validation happens in two parts:

1. Zod synchronously checks that the input is an instance of Promise (i.e. an object with `.then` and `.catch` methods.).
2. Zod _waits for the promise to resolve_ then validates the resolved value.

```ts
numberPromise.parse('tuna');
// ZodError: Non-Promise type: string

numberPromise.parse(Promise.resolve('tuna'));
// => Promise<number>

const test = async () => {
  await numberPromise.parse(Promise.resolve('tuna'));
  // ZodError: Non-number type: string

  await numberPromise.parse(Promise.resolve(3.14));
  // => 3.14
};
```

#### Non-native promise implementations

When "parsing" a promise, Zod checks that the passed value is an object with `.then` and `.catch` methods - that's it. So you should be able to pass non-native Promises (Bluebird, etc) into `z.promise(...).parse` with no trouble. One gotcha: the return type of the parse function will be a _native_ `Promise`, so if you have downstream logic that uses non-standard Promise methods, this won't work.

## Function schemas

Zod also lets you define "function schemas". This makes it easy to validate the inputs and outputs of a function without intermixing your validation code and "business logic".

You can create a function schema with `z.function(args, returnType)` which accepts these arguments.

- `args: ZodTuple` The first argument is a tuple (created with `z.tuple([...])` and defines the schema of the arguments to your function. If the function doesn't accept arguments, you can pass an empty tuple (`z.tuple([])`).
- `returnType: any Zod schema` The second argument is the function's return type. This can be any Zod schema.

```ts
const args = z.tuple([z.string()]);

const returnType = z.number();

const myFunction = z.function(args, returnType);
type myFunction = z.infer<typeof myFunction>;
// => (arg0: string)=>number
```

Function schemas have an `.implement()` method which accepts a function as input and returns a new function.

```ts
const myValidatedFunction = myFunction.implement(x => {
  // TypeScript knows x is a string!
  return x.trim().length;
});
```

`myValidatedFunction` now automatically validates both its inputs and return value against the schemas provided to `z.function`. If either is invalid, the function throws.

This way you can confidently write application logic in a "validated function" without worrying about invalid inputs, scattering `schema.validate()` calls in your endpoint definitions,or writing duplicative types for your functions.

Here's a more complex example showing how to write a typesafe API query endpoint:

```ts
const args = z.tuple([
  z.object({ id: z.string() }), // get by ID
]);

const returnType = z.promise(
  z.object({
    id: string(),
    name: string(),
  }),
);

const FetcherEndpoint = z.function(args, returnType);

const getUserByID = FetcherEndpoint.validate(args => {
  args; // => { id: string }

  const user = await User.findByID(args.id);

  // TypeScript statically verifies that value returned by
  // this function is of type Promise<{ id: string; name: string; }>
  return 'salmon'; // TypeError

  return user; // success
});
```

This is particularly useful for defining HTTP or RPC endpoints that accept complex payloads that require validation. Moreover, you can define your endpoints once with Zod and share the code with both your client and server code to achieve end-to-end type safety.

```ts
// Express example
server.get(`/user/:id`, async (req, res) => {
  const user = await getUserByID({ id: req.params.id }).catch(err => {
    res.status(400).send(err.message);
  });

  res.status(200).send(user);
});
```

<!--
## Masking

Masking is one of Zod's killer features. It sets it a step ahead of most other libraries, especially those that utilize class-based validation schemas (like TypeORM). The problem with defining schemas as a class is that it's not possible to generate slight variations of it. Doing so would require high-order generics, which doesyou would need to implement a "doubly-generic" class factory.

Consider an example where you define a `User` schema with two fields:

```ts
const User = z.object({
  id: z.string(),
  name: z.string(),
});
```

If you want to implement a typesafe "createUser" function, you'll need a slightly modified version of `User` as the argument. Specifically, you'll want to get rid of the `id` field, assuming your database auto-generates IDs. Historically you'd have to define a brand-new schema, say `CreateUserInput`.

If this example sounds contrived, check out the homepage of the popular GraphQL schema definition library [TypeGraphQL](https://typegraphql.com/). The sample code shows two declarations: one for the `Recipe` model and another _nearly identical_ class for `RecipeInput` (the data type used to create new recipes). Unfortunately duplicative definitions like this are commonly needed (especially in the GraphQL ecosystem), meaning you have to keep a slew of slightly modified schemas in sync manually.

Zod's solution to this is "masking". Masking is known by a lot of other names too: _derived types_, _views_ (especially in the SQL world), _projections_, and more.


#### Picking
```ts
const User = z.object({
  id: z.string(),
  name: z.string(),
});

const createUserInput = User.pick({ name: true });

type createUserInput = z.infer<typeof createUserInput>;
// => { name: string }
```

Equivalently, you can use `.omit` to remove keys from the object schema.

```ts
const createUserInput = User.pick({ id: true });

type createUserInput = z.infer<typeof createUserInput>;
// => { name: string }
```

#### Nested objects

Masking also works on nested object schemas:

```ts
const User = z.object({
  outer: z.object({
    prop1: z.string(),
    inner: z.object({
      prop2: z.number(),
    }),
  }),
});

// picking
User.pick({ outer: true }); // { outer: inner: { prop1: string, prop2: number }}
User.pick({ outer: { prop1: true } }); // { outer: { prop1: string }}
User.pick({ outer: { inner: true } }); // { outer: { innfer: { prop2: number }}}
User.pick({ outer: { prop1: true, inner: { prop2: true } } }); // { outer: inner: { prop1: string, prop2: number }}

// omiting
User.omit({ outer: true }); // {}
User.omit({ outer: { prop1: true } }); // { outer: { inner: { prop2: number }}}
User.omit({ outer: { inner: true } }); // { outer: { prop1: string }}
User.omit({ outer: { inner: { prop2: true } } }); // { outer: { prop1: string, inner: {} }}
```


#### Recursive schemas -->

## Errors

Zod includes a custom `Error` subclass called `ZodError`. All validation errors thrown by Zod are instances of `ZodError`.

A `ZodError` instance has an `errors` property of type

```ts
// ZodError#errors
{
  path: (string | number)[],
  message: string
}[]
```

This array represents all errors Zod encounters when attempting to parse a value.

```ts
const person = z.object({
  name: {
    first: z.string(),
    last: z.string(),
  },
  age: z.number(),
  address: z.array(z.string()),
});

try {
  person.parse({
    name: { first: 'Dave', last: 42 },
    age: 'threeve',
    address: ['123 Maple Street', {}],
  });
} catch (err) {
  if (err instanceof ZodError) {
    console.log(JSON.stringify(err.errors));
    /*
      [
        {
          "path": [ "name", "last" ],
          "message": "Non-string type: number"
        },
        {
          "path": [ "age" ],
          "message": "Non-number type: string"
        },
        {
          "path": [ "address", 1 ],
          "message": "Non-string type: object"
        }
      ]
    */

    // err.message returns a formatted error message
    console.log(err.message);
    /*
      `name.last`: Non-string type: number
      `age`: Non-number type: string
      `address.1`: Non-string type: object
    */
  } else {
    // should never happen
  }
}
```

# Comparison

There are a handful of other widely-used validation libraries, but all of them have certain design limitations that make for a non-ideal developer experience.

<!-- The table below summarizes the feature differences. Below the table there are more involved discussions of certain alternatives, where necessary. -->

<!-- | Feature                                                                                                                | [Zod](https://github.com/vriad) | [Joi](https://github.com/hapijs/joi) | [Yup](https://github.com/jquense/yup) | [io-ts](https://github.com/gcanti/io-ts) | [Runtypes](https://github.com/pelotom/runtypes) | [ow](https://github.com/sindresorhus/ow) | [class-validator](https://github.com/typestack/class-validator) |
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

#### Joi

[https://github.com/hapijs/joi](https://github.com/hapijs/joi)

Doesn't support static type inference. 😕

#### Yup

[https://github.com/jquense/yup](https://github.com/jquense/yup)

Yup is a full-featured library that was implemented first in vanilla JS, with TypeScript typings added later.

Yup supports static type inference, but unfortunately the inferred types aren't actually correct. Currently, the yup package treats all object properties as optional by default:

```ts
const schema = yup.object({
  asdf: yup.string(),
});
schema.validate({}); // passes

type SchemaType = yup.InferType<typeof schema>;
// returns { asdf: string }
// should be { asdf?: string }
```

Yup also mis-infers the type of required arrays.

```ts
const numList = yup
  .array()
  .of(yup.string())
  .required();

// interpreted as a non-empty list
numList.validateSync([]); // fails

// yet the inferred type doesn't reflect this
type NumList = yup.InferType<typeof numList>;
// returns 		string[]
// should be 	[string,...string[]]
```

These may sound like nitpicks. But it's not acceptable that an object that's assignable to the inferred TypeScript type can fail validation by the validator it was inferred from.

#### io-ts

[https://github.com/gcanti/io-ts](https://github.com/gcanti/io-ts)

io-ts is an excellent library by gcanti. The API of io-ts heavily inspired the design of Zod.

In our experience, io-ts prioritizes functional programming purity over developer experience in many cases. This is a valid and admirable design goal, but it makes io-ts particularly hard to integrate into an existing codebase with a more procedural or object-oriented bias.

For instance, consider how to define an object with optional properties in io-ts:

```ts
import * as t from 'io-ts';

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

You must define the required and optional props in separate object validators, pass the optionals through `t.partial` (which marks all properties as optional), then combine them with `t.intersection`.

Consider the equivalent in Zod:

```ts
const C = z.object({
  foo: z.string(),
  bar: z.string().optional(),
});

type C = z.infer<typeof C>;
// returns { foo: string; bar?: number | undefined }
```

This more declarative API makes schema definitions vastly more concise.

`io-ts` also requires the use of gcanti's functional programming library `fp-ts` to parse results and handle errors. This is another fantastic resource for developers looking to keep their codebase strictly functional. But depending on `fp-ts` necessarily comes with a lot of intellectual overhead; a developer has to be familiar with functional programming concepts, `fp-ts`'s nomenclature, and the `Either` monad to do a simple schema validation. It's just not worth it for many people.

#### Runtypes

[https://github.com/pelotom/runtypes](https://github.com/pelotom/runtypes)

# Changelog

| zod version | release notes                                                       |
| ----------- | ------------------------------------------------------------------- |
| zod@1.5     | Any and unknown types                                               |
| zod@1.4     | Refinement types (`.refine`), `.parse` no longer returns deep clone |
| zod@1.3     | Promise schemas                                                     |
| zod@1.2.6   | `.parse` accepts `unknown`, `bigint` schemas                        |
| zod@1.2.5   | `.partial` and `.deepPartial` on object schemas                     |
| zod@1.2.3   | Date schemas                                                        |
| zod@1.2.0   | `.pick`, `.omit`, and `.augment` on object schemas                  |
| zod@1.1.0   | Records                                                             |
| zod@1.0.11  | `.nonstrict`                                                        |
| zod@1.0.10  | Type assertions with `.check`                                       |
| zod@1.0.4   | Empty tuples                                                        |
| zod@1.0.0   | Type assertions, literals, enums, detailed error reporting          |
| zod@1.0.0   | Initial release                                                     |
