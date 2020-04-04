<p align="center">
  <img src="logo.svg" width="200px" align="center" />
  <h1 align="center">Zod</h1>
</p>

[![License][license-image]][license-url]
[![npm](https://img.shields.io/npm/dw/jest-coverage-badges.svg)](https://www.npmjs.com/package/jest-coverage-badges)
![coverage](coverage/badge.svg)

[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/npm/l/make-coverage-badge.svg

Created and maintained by [@vriad](https://twitter.com/vriad).

The motivation for this library and a detailed comparison to various alternatives can be found at https://vriad.com/blog/zod.
<br/>
<br/>

### Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [Primitives](#primitives)
  - [Literals](#literals)
  - [Parsing](#parsing)
  - [Type inference](#type-inference)
  - [Objects](#objects)
  - [Arrays](#arrays)
  - [Unions](#unions)
    - [Optional types](#optional-types)
    - [Nullable types](#nullable-types)
  - [Enums](#enums)
  - [Tuples](#tuples)
  - [Intersections](#intersections)
  - [Recursive types](#recursive-types)
  - [Function schemas](#function-schemas)
  - [Errors](#errors)
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

### TypeScript versions

Zod 1.0.x is compatible with TypeScript 3.2+. Earlier versions contain bugs that will interfere there were known type inference bugs in TypeScript that will cause errors.

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
const booleanSchema = z.boolean(); // => ZodType<boolean>
const undefinedSchema = z.undefined(); // => ZodType<undefined>
const nullTypeSchema = z.null(); // => ZodType<null>
```

## Literals

```ts
const tuna = z.literal('tuna'); // => ZodType<'tuna'>
const twelve = z.literal(12); // => ZodType<12>
const tru = z.literal(true); // => ZodType<true>
```

## Parsing and validation

Given a Zod schema, you can call its `.parse(data)` method to check `data` is valid. If it is, `data` is returned (with full type information!). Otherwise, an error is thrown.

```ts
const stringSchema = z.string();
stringSchema.parse('fish'); // => "fish"
stringSchema.parse(12); // throws Error('Non-string type: number');
```

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

## Type inference

You can extract the TypeScript type of any schema with `z.TypeOf<>`.

```ts
const A = z.string();
type A = z.TypeOf<typeof A>; // string

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

type Dog = z.TypeOf<typeof dogSchema>;
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

### Unknown keys

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
type NonstrictDog = z.TypeOf<typeof dogSchemaNonstrict>;
/*
{
  name:string; 
  neutered: boolean;
  [k:string]: any;
} 
*/
```

## Arrays

```ts
const dogsList = z.array(dogSchema);

dogsList.parse([{ name: 'Fido', age: 4, neutered: true }]); // passes

dogsList.parse([]); // passes
```

### Non-empty lists

```ts
const nonEmptyDogsList = z.array(dogSchema).nonempty();
nonEmptyDogsList.parse([]); // throws Error("Array cannot be empty")
```

## Unions

Zod includes a built-in `z.union` method for composing "OR" types.

```ts
const stringOrNumber = z.union([z.string(), z.number()]);

stringOrNumber.parse('foo'); // passes
stringOrNumber.parse(14); // passes
```

### Optional types

Unions are the basis for defining optional schemas. An "optional string" is just the union of `string` and `undefined`.

```ts
const A = z.union([z.string(), z.undefined()]);

A.parse(undefined); // => passes, returns undefined
type A = z.TypeOf<typeof A>; // string | undefined
```

Zod provides a shorthand way to make any schema optional:

```ts
const B = z.string().optional(); // equivalent to A

const C = z.object({
  username: z.string().optional(),
});
type C = z.TypeOf<typeof C>; // { username?: string | undefined };
```

### Nullable types

Similarly, you can create nullable types like so:

```ts
const D = z.union([z.string(), z.null()]);
```

Or you can use the shorthand `.nullable()`:

```ts
const E = z.string().nullable(); // equivalent to D
type E = z.TypeOf<typeof D>; // string | null
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

type F = z.TypeOf<typeof F>; // string | number | boolean | undefined | null;
```

## Enums

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
type c = z.TypeOf<typeof C>; // => number

const stringAndNumber = z.intersection(z.string(), z.number());
type Never = z.TypeOf<typeof stringAndNumber>; // => never
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

type Teacher = z.TypeOf<typeof Teacher>;
// { id:string; name:string };
```

### Object merging

In the examples above, the return value of `z.intersection` is an instance of `ZodIntersection`, a generic class that wraps the two schemas passed in as arguments.

But if you're trying to combine two object schemas, there is a shorthand:

```ts
const Teacher = BaseTeacher.merge(HasId);
```

The benefit of using this shorthand is that the returned value is a new object schema (`ZodObject`), instead of a generic `ZodIntersection` instance. This way, you're able to fluently chain together many `.merge` calls:

```ts
// chaining mixins
const Teacher = BaseTeacher.merge(HasId)
  .merge(HasName)
  .merge(HasAddress);
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

type Athlete = z.TypeOf<typeof athleteSchema>;
// type Athlete = [string, number, { pointsScored: number }]
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
interface Category extends z.Infer<typeof BaseCategory> {
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

### Cyclical objects

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

## Function schemas

Zod also lets you define "function schemas". This makes it easy to validate the inputs and outputs of a function without intermixing your validation code and "business logic".

You can create a function schema with `z.function(args, returnType)` which accepts these arguments.

- `args: ZodTuple` The first argument is a tuple (created with `z.tuple([...])` and defines the schema of the arguments to your function. If the function doesn't accept arguments, you can pass an empty tuple (`z.tuple([])`).
- `returnType: ZodType` The second argument is the function's return type. This can be any Zod schema.

```ts
const args = z.tuple([z.string()]);

const returnType = z.number();

const myFunction = z.function(args, returnType);
type myFunction = z.TypeOf<typeof myFunction>;
// => (arg0: string)=>number
```

`z.function` actually returns a higher-order "function factory". Every "factory" has `.implement()` method which accepts a function as input and returns a new function.

```ts
const myValidatedFunction = myFunction(x => {
  // TypeScript knows x is a string!
  return x.trim().length;
});
```

`myValidatedFunction` now automatically validates both its inputs and return value against the schemas provided to `z.function`. If either is invalid, the function throws.

This way you can confidently write application logic in a "validated function" without worrying about invalid inputs, scattering `schema.validate()` calls in your endpoint definitions,or writing duplicative types for your functions.

Here's a more complex example showing how to write a typesafe API query endpoint:

```ts
const args = z.tuple([
  z.object({ nameStartsWith: z.string() }), // filters
  z.object({ skip: z.number(), limit: z.number() }), // pagination
]);

const returnType = z.array(
  z.object({
    id: string(),
    name: string(),
  }),
);

const FetcherEndpoint = z.function(args, returnType);

const searchUsers = FetcherEndpoint.validate((filters, pagination) => {
  // the arguments automatically have the appropriate types
  // as defined by the args tuple passed to `z.function()`
  // without needing to provide types in the function declaration

  filters.nameStartsWith; // autocompletes
  filters.ageLessThan; // TypeError

  const users = User.findAll({
    // ... apply filters here
  });

  // TypeScript statically verifies that value returned by
  // this function is of type { id: string; name: string; }[]

  return 'salmon'; // TypeError
});

const users = searchUsers(
  {
    nameStartsWith: 'John',
  },
  {
    skip: 0,
    limit: 20,
  },
);

// `typeof users` => { id: string; name: string; }[]
```

This is particularly useful for defining HTTP or RPC endpoints that accept complex payloads that require validation. Moreover, you can define your endpoints once with Zod and share the code with both your client and server code to achieve end-to-end type safety.

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

### Joi

[https://github.com/hapijs/joi](https://github.com/hapijs/joi)

Doesn't support static type inference. 😕

### Yup

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

### io-ts

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

type C = z.TypeOf<typeof C>;
// returns { foo: string; bar?: number | undefined }
```

This more declarative API makes schema definitions vastly more concise.

`io-ts` also requires the use of gcanti's functional programming library `fp-ts` to parse results and handle errors. This is another fantastic resource for developers looking to keep their codebase strictly functional. But depending on `fp-ts` necessarily comes with a lot of intellectual overhead; a developer has to be familiar with functional programming concepts, `fp-ts`'s nomenclature, and the `Either` monad to do a simple schema validation. It's just not worth it for many people.

### Runtypes

[https://github.com/pelotom/runtypes](https://github.com/pelotom/runtypes)
