---
layout: doc-page
title: Functions
parent: Defining schemas
nav_order: 23
previous:
    title: Instanceof
    path: ../instanceof
next:
    title: Preprocess
    path: ../preprocess
---

Zod also lets you define "function schemas". This makes it easy to validate the inputs and outputs of a function without intermixing your validation code and "business logic".

You can create a function schema with `z.function(args, returnType)` .

```ts
const myFunction = z.function()

type myFunction = z.infer<typeof myFunction>
// => ()=>unknown
```

## Define inputs and output

```ts
const myFunction = z
  .function()
  .args(z.string(), z.number()) // accepts an arbitrary number of arguments
  .returns(z.boolean())
type myFunction = z.infer<typeof myFunction>
// => (arg0: string, arg1: number)=>boolean
```

## Extract the input and output schemas
You can extract the parameters and return type of a function schema.

```ts
myFunction.parameters()
// => ZodTuple<[ZodString, ZodNumber]>

myFunction.returnType()
// => ZodBoolean
```

<!-- `z.function()` accepts two arguments:

* `args: ZodTuple` The first argument is a tuple (created with `z.tuple([...])` and defines the schema of the arguments to your function. If the function doesn't accept arguments, you can pass an empty tuple (`z.tuple([])`).
* `returnType: any Zod schema` The second argument is the function's return type. This can be any Zod schema. -->

> You can use the special `z.void()` option if your function doesn't return anything. This will let Zod properly infer the type of void-returning functions. (Void-returning functions actually return undefined.)

<!--

``` ts
const args = z.tuple([z.string()])

const returnType = z.number()

const myFunction = z.function(args, returnType)
type myFunction = z.infer<typeof myFunction>
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
    return x.trim().length
  })

trimmedLength("sandwich") // => 8
trimmedLength(" asdf ") // => 4
```

If you only care about validating inputs, that's fine:

```ts
const myFunction = z
  .function()
  .args(z.string())
  .implement((arg) => {
    return [arg.length] //
  })
myFunction // (arg: string)=>number[]
```