# Error Handling in Zod

This guide explains Zod's internal error handling system, and the various ways you can customize it for your purposes.

## ZodError

All validation errors thrown by Zod are instances of `ZodError`.

```ts
class ZodError extends Error {
  errors: ZodSuberror[];
}
```

ZodError is a subclass of `Error`; if you want to place around with this class, you can create an instance like so:

```ts
import * as z from 'zod';

const myError = new z.ZodError([]);
```

ZodErrors are just a wrapper class that contain information about the problems that occurred during validation. The list of issues are contained in the `errors` property.

## ZodSuberror

`ZodSuberror` is _not_ a class. It is a [discriminated union](https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions).

The link above the the best way to learn about the concept. Discriminated unions are an ideal way to represent a data structures that may be one of many possible variants.

Every ZodSuberror has these fields:

| field     | type                   | details                                                                                           |
| --------- | ---------------------- | ------------------------------------------------------------------------------------------------- |
| `code`    | `z.ZodErrorCode`       | You can access this enum with `z.ZodErrorCode`. A full breakdown of the possible values is below. |
| `path`    | `(string \| number)[]` | e.g, `['addresses', 0, 'line1']`                                                                  |
| `message` | `string`               | e.g. `Invalid type. Expected string, received number.`                                            |

**However** depending on the error code, there may be additional properties as well. Here is a full breakdown of the additional fields by error code:

## ZodErrorCode

| code                                 | additional fields                                                                                                                                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ZodErrorCode.invalid_type            | `expected: ZodParsedType` <br> `received: ZodParsedType` <br><br>Jump to [this section](#parsedtype) for a breakdown of the possible values of ZodParsedType.                                                                                                                        |
| ZodErrorCode.nonempty_array_is_empty | _no additional properties_                                                                                                                                                                                                                                                           |
| ZodErrorCode.unrecognized_keys       | `keys: string[]`<br>The list of unrecognized keys<br>                                                                                                                                                                                                                                |
| ZodErrorCode.invalid_union           | `unionErrors: ZodError[]` <br> The errors thrown by each element of the union.                                                                                                                                                                                                       |
| ZodErrorCode.invalid_literal_value   | `expected: string \| number \| boolean` <br> The literal value.                                                                                                                                                                                                                      |
| ZodErrorCode.invalid_enum_value      | `options: string[]` <br> The set of acceptable string values for this enum.                                                                                                                                                                                                          |
| ZodErrorCode.invalid_arguments       | `argumentsError: ZodError` <br> This is a special error code only thrown by a wrapped function returned by `ZodFunction.implement()`. The `argumentsError` property is another ZodError containing the validation error details.                                                     |
| ZodErrorCode.invalid_return_type     | `returnTypeError: ZodError` <br> This is a special error code only thrown by a wrapped function returned by `ZodFunction.implement()`. The `returnTypeError` property is another ZodError containing the validation error details.                                                   |
| ZodErrorCode.invalid_date            | _no additional properties_                                                                                                                                                                                                                                                           |
| ZodErrorCode.invalid_string          | `validation: "url" \| "email" \| "uuid"`<br> Which built-in string validator failed                                                                                                                                                                                                  |
| ZodErrorCode.too_small               | `type: "string" \| "number" \| "array"` <br>The type of the data failing validation<br><br> `minimum: number` <br>The expected length/value.<br><br>`inclusive: boolean`<br>Whether the minimum is included in the range of acceptable values.<br>                                   |
| ZodErrorCode.too_big                 | `type: "string" \| "number" \| "array"` <br>The type of the data failing validation<br><br> `maximum: number` <br>The expected length/value.<br><br>`inclusive: boolean`<br>Whether the minimum is included in the range of acceptable values.<br>                                   |
| ZodErrorCode.custom_error            | `params: { [k: string]: any }` <br> This is the error code throw by **all custom refinements**. You are able to pass in a `params` object here that is available in your custom error maps (see [ZodErrorMap](#Customizing-errors-with-ZodErrorMap) below for details on error maps) |

## ZodParsedType

This is an enum used by Zod internally to represent the type of a parsed value. The possible values are:

- `string`
- `nan`
- `number`
- `integer`
- `boolean`
- `date`
- `bigint`
- `symbol`
- `function`
- `undefined`
- `null`
- `array`
- `object`
- `unknown`
- `promise`
- `void`

## A demonstrative example

Here's a sample Person schema.

```ts
const person = z.object({
  names: z.array(z.string()).nonempty(), // at least 1 name
  address: z.object({
    line1: z.string(),
    zipCode: z.number().min(10000), // American 5-digit code
  }),
});
```

Let's pass in some improperly formatted data.

```ts
try {
  person.parse({
    names: ['Dave', 12], // 12 is not a string
    address: {
      line1: '123 Maple Ave',
      zipCode: 123, // zip code isnt 5 digits
      extra: 'other stuff', // unrecognized key
    },
  });
} catch (err) {
  if (err instanceof z.ZodError) {
    console.log(err.errors);
  }
}
```

Here are the errors that will be printed:

```ts
[
  {
    code: 'invalid_type',
    expected: 'string',
    received: 'number',
    path: ['names', 1],
    message: 'Invalid input: expected string, received number',
  },
  {
    code: 'unrecognized_keys',
    keys: ['extra'],
    path: ['address'],
    message: "Unrecognized key(s) in object: 'extra'",
  },
  {
    code: 'too_small',
    minimum: 10000,
    type: 'number',
    inclusive: true,
    path: ['address', 'zipCode'],
    message: 'Value should be greater than or equal to 10000',
  },
];
```

As you can see three different issues were identified. Every ZodSuberror has a `code` property and additional metadata about the validation failure. For instance the `unrecognized_keys` error provides a list of the unrecognized keys detected in the input.

## Customizing errors with ZodErrorMap

You can customize **all** error messages produced by Zod by providing a custom instance of ZodErrorMap to `.parse()`. Internally, Zod uses a [default error map](https://github.com/vriad/zod/blob/master/defaultErrorMap.ts) to produce all error messages.

`ZodErrorMap` is a special function. It accepts two arguments: `error` and `ctx`. The return type is `{ message: string }`. Essentially the error map accepts some information about the validation that is failing and returns an appropriate error message.

- `error: Omit<ZodSuberror, "message">`

  As mentioned above, ZodSuberror is a discriminated union.

- `ctx: { defaultError: string; data: any }`

  - `ctx.default` is the error message generated by the default error map. If you only want to override the message for a single type of error, you can do that. Just return `defaultError` for everything

  - `ctx.data` contains the data that was passed into `.parse`. You can use this to customize the error message.

### A working example

Let's look at a practical example of of customized error map:

```ts
import * as z from 'zod';

const errorMap: z.ZodErrorMap = (error, ctx) => {
  /*

  If error.message is set, that means the user is trying to
  override the error message. This is how method-specific
  error overrides work, like this:

  z.string().min(5, { message: "TOO SMALL 🤬" })

  It is a best practice to return `error.message` if it is set.
  
  */
  if (error.message) return { message: error.message };

  /*
  This is where you override the various error codes
  */
  switch (error.code) {
    case z.ZodErrorCode.invalid_type:
      if (error.expected === 'string') {
        return { message: `This ain't a string!` };
      }
      break;
    case z.ZodErrorCode.custom_error:
      // produce a custom message using error.params
      // error.params won't be set unless you passed
      // a `params` arguments into a custom validator
      const params = error.params || {};
      if (params.myField) {
        return { message: `Bad input: ${params.myField}` };
      }
      break;
  }

  // fall back to default message!
  return { message: ctx.defaultError };
};

z.string().parse(12, { errorMap });

/* throws: 
  ZodError {
    errors: [{
      code: "invalid_type",
      path: [],
      message: "This ain't a string!",
      expected: "string",
      received: "number",
    }]
  }
*/
```

## Error handling for forms

If you're using Zod to validate the inputs from a web form, there is a convenient way to "flatten" a ZodError to a format that can be easily displayed to the end user.

Consider this example of a simple signup form:

```ts
const FormData = z
  .object({
    email: z.string().email(),
    password: z.string().min(10),
    confirm: z.string().min(10),
  })
  .refine(obj => obj.password === obj.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'], // sets the path of the error thrown by this refinement
  });
}
```

Now lets pass in some invalid data:

```ts
FormData.parse({
  email: 'not an email',
  password: 'tooshort',
  confirm: 'nomatch',
});
```

This will throw a ZodError with four suberrors:

```ts
console.log(err.errors);
/*
  [
    { code: 'invalid_string', validation: 'email', path: ['email'], message: 'Invalid email' },
    {
      code: 'too_small',
      minimum: 10,
      type: 'string',
      inclusive: true,
      path: ['password'],
      message: 'Should be at least 10 characters',
    },
    {
      code: 'too_small',
      minimum: 10,
      type: 'string',
      inclusive: true,
      path: ['confirm'],
      message: 'Should be at least 10 characters',
    },
    { code: 'custom_error', message: 'Passwords do not match', path: ['confirm'] },
  ]; 
  */
```

But using the `flatten()` method, we can make those errors much easier to work with:

```ts
console.log(err.flatten());
/*
  {
  formErrors: [],
  fieldErrors: {
    email: ['Invalid email'],
    password: ['Should be at least 10 characters'],
    confirm: ['Should be at least 10 characters', 'Passwords do not match'],
  },
}
```

- `fieldErrors` is an object. The keys are the field(s) that threw the error. The values are an array of error strings that can be easily presented in the interface.
- `formErrors: string[]` is an array of errors that occured on the root of the form schema. For instance if you called `FormData.parse(null)`, `formErrors` would be:
  ```ts
  ['Invalid input: expected object, received null'];
  ```
