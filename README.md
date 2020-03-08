### Table of contents

- [Installation](#installation)
- [Usage](#basic-usage)
  - [Primitives](#primitives)
  - [Parsing](#parsing)
  - [Type inference](#type-inference)
  - [Union types](#union-types)
  - [Object types](#object-types)
  - [Array types](#array-types)
  - [Tuple types](#tuple-types)
  - [Intersection types](#intersection-types)
  - [Recursive types](#recursive-types)
  - [Validated functions](#validated-functions)
- [Reference](#reference)
- [Comparison](#comparison)

# Installation

To install the latest version:

```sh
npm install --save zod
```

```sh
yarn add zod
```

### Typescript versions

Zod 1.0.x is compatible with Typescript 3.0+.

# Basic usage

Zod is a validation library designed for optimal developer experience.

- It takes advantage of Typescript generic inference to statically infer the types of your schemas, eliminating the need to define static types and runtime validators separately.
- It has a composable, declarative API that makes it easy to define complex types concisely.
- Schemas are immutable. All methods return a new schema instance.

### Primitives

```ts
import * as z from 'zod';

const stringSchema = z.string(); // => ZodType<string>
const numberSchema = z.number(); // => ZodType<number>
const booleanSchema = z.boolean(); // => ZodType<boolean>
const undefinedSchema = z.undefined(); // => ZodType<undefined>
const nullTypeSchema = z.null(); // => ZodType<null>
```

### Parsing

```ts
// every ZodType instance has a .parse() method
const stringSchema = z.string();
stringSchema.parse('fish'); // => "fish"
stringSchema.parse(12); // throws Error('Non-string type: number');
```

### Type inference

You can extract the Typescript type of any schema with `z.TypeOf<>`.

```ts
const A = z.string();
type A = z.TypeOf<typeof A>; // string

const u: A = 12; // TypeError
const u: A = 'asdf'; // compiles
```

We'll include examples of inferred types throughout the rest of the documentation.

### Union types

Including Nullable and Optional types.

Zod includes a built-in for `z.union` method for composing "OR" types.

```ts
/* Optional Types */

const A = z.string();
A.parse(undefined); // throws Error!

type A = z.TypeOf<typeof A>; // string

// "optional string" === the union of string and undefined
const B = z.union([z.string(), z.undefined()]);
B.parse(undefined); // => passes, returns undefined
type B = z.TypeOf<typeof B>; // string | undefined

const C = z.string().optional(); // equivalent to B

/* Nullable Types */
const C = z.union([z.string(), z.null()]);
const D = z.string().nullable(); // equivalent to C
type D = z.TypeOf<typeof D>; // string | null

/* Custom Union Types */

const F = z.union([z.string(), z.number()]).optional();
F.parse('tuna'); // => tuna
F.parse(42); // => 42
F.parse(undefined); // => undefined
F.parse(false); // => throws Error!
type F = z.TypeOf<typeof F>; // string | number | undefined;
```

### Object types

```ts
// all properties are required by default
const dogSchema = z.object({
  name: z.string(),
  age: z.number().optional(),
  neutered: z.boolean().nullable(),
});

type Dog = z.TypeOf<typeof dogSchema>;
/* 
equivalent to:
type Dog = { 
  name:string; 
  age?: number | undefined; 
  neutered: boolean | null;
}
*/

const cujo = dogSchema.parse({
  name: 'Cujo',
  neutered: null,
}); // passes, returns Dog

const fido: Dog = {
  name: 'Fido',
}; // TypeError: missing required property `neutered`
```

### Array types

```ts
const dogsList = z.array(dogSchema);

dogSchema.parse([
  { name: 'Cujo', neutered: null },
  { name: 'Fido', age: 4, neutered: true },
]); // passes

dogsList.parse([]); // passes

// Non-empty lists

const nonEmptyDogsList = z.array(dogSchema).nonempty();
nonEmptyDogsList.parse([]); // throws Error("Array cannot be empty")
```

### Tuple types

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

### Intersection types

Intersections are useful for creating "logical AND" types.

```ts
const a = z.union([z.number(), z.string()]);
const b = z.union([z.number(), z.boolean()]);

const c = z.intersection(a, b);
type c = z.TypeOf<typeof C>; // => number

const neverType = z.intersection(z.string(), z.number());
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

In the examples above, the return value of `z.intersection` is an instance of `ZodIntersection`, a class that wraps the two schemas passed in as arguments.

But if you're trying to combine two object schemas, there is a shorthand:

```ts
const Teacher = BaseTeacher.merge(HasId);
```

The benefit of using this shorthand is that the returned value is a new object schema (`ZodObject`), instead of a generic `ZodIntersection` instance. This was, you're able to fluently chain together many `.merge` calls:

```ts
// chaining mixins
const Teacher = BaseTeacher.merge(HasId)
  .merge(HasName)
  .merge(HasAddress);
```

### Recursive types

```ts
interface Category {
  name: string;
  subcategories: Category[];
}

// must provide a type hint: `z.ZodType<Category>`
// because Typescript can't infer recursive types
const Category: z.ZodType<Category> = z.lazy(() => {
  return z.object({
    name: z.string(),
    subcategories: z.array(Cat),
  });
});

Category.parse({
  name: 'People',
  subcategories: [
    { name: 'Actors', subcategories: [] },
    {
      name: 'Politicians',
      subcategories: [{ name: 'Presidents', subcategories: [] }],
    },
  ],
}); // passes
```

### Function schemas

Zod also lets you define "function schemas". You can create these with `z.function(args: ZodTuple, returnType: ZodType)`.

- The first argument is a tuple (created with `z.tuple([...])`. If the function doesn't accept arguments, you can use an empty tuple (`z.tuple([])`).
- The second argument is a return type. This can be any Zod schema.

```ts
const args = z.tuple([
  z.object({ nameStartsWith: z.string() }),
  z.object({ skip: z.number(), limit: z.number() }),
]);

const returnType = z.array(
  z.object({
    id: string(),
    name: string(),
  })
);

const FetcherFunction = z.function(args, returnType);

const queryUsers = (filters: any, pagination: any): any => {
  // const results = db.fetch(...)
  // return results;
};

const validatedQueryUser = FetchFunction.create((filters, pagination) => {
  // the arguments automatically have the appropriate types
  // as defined by the args tuple passed to `z.function()`
  // Typescript statically verifies that the return value
  // of this function is of type { id: string; name: string; }[]
  // If either the arguments or the return type do not pass validation,
  // an Error is thrown. This way you can confidently execute business
  // logic in a "validated function" without worrying about invalid
  // inputs or return types.
});

const users = validatedQueryUser(
  {
    nameStartsWith: 'John',
  },
  {
    skip: 0,
    limit: 20,
  }
); // => returns { id: string; name: string; }[]
```

# Comparison

There are a handful of other widely-used validation libraries, but all of them have certain design limitations that make for a non-ideal developer experience.

### Yup (https://github.com/jquense/yup)

Yup is a full-featured library that was implemented first in vanilla JS, with Typescript typings added later.

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

These may sound like nitpicks. But it's not acceptable that an object that's assignable to the inferred Typescript type can fail validation by the validator it was inferred from.

### io-ts ([https://github.com/gcanti/io-ts](https://github.com/gcanti/io-ts))

io-ts is an excellent library by gcanti. The API of io-ts heavily inspired the design of Zod.

In our experience, io-ts prioritizes functional programming purity over developer experience in many cases. This is a valid and admirable design goal, but it makes io-ts particularly hard to integrate into an existing codebase with a more procedural or object-oriented bias.

For instance, consider how to define an object with optional properties in io-ts:

```ts
const A = t.type({
  foo: t.string,
});

const B = t.partial({
  bar: t.number,
});

const C = t.intersection([A, B]);

type C = t.TypeOf<typeof C>;
/*
returns {
	foo: string;
	bar?: number | undefined
}
*/
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

### Joi

Doesn't support static type inference. 😕
