My full-time work on Zod 4, including the design & implementation of this proposal, is supported by [Clerk](https://go.clerk.com/DHliRIG). Friends don't let friends roll their own auth! 🤙 —Colin

<!-- [![clerk logo](https://github.com/colinhacks/zod/assets/3084745/22a4a523-5845-4ac7-b5be-02fbf436409f)](https://go.clerk.com/DHliRIG) -->

<a href="https://go.clerk.com/DHliRIG">
  <img src="https://github.com/colinhacks/zod/assets/3084745/22a4a523-5845-4ac7-b5be-02fbf436409f" alt="clerk logo" height="100" />
</a>

---

This document proposes a new error map API for Zod 4.

# Issue #1: Bottom-up execution

Zod's current approach to error maps is a little backwards. For starters, Zod generates error messages by passing a `message`-less version of the issue into a pipeline of error maps. In order of increasing precedence, the error maps are:

1. contextual error map (passed into `.parse(<data>, {errorMap: myErrorMap})`)
2. schema-specific error map (`z.string({ errorMap: myErrorMap })`)

- `invalid_type_error` and `required_error` also creates a schema-specific error map internally

3. `overrideErrorMap` (settable with `z.setErrorMap()`)
4. `defaultErrorMap` (the standard English error map in `locales/en.ts`)

The reasonable thing to do would be to pass the issue into the #1 and see if it returns a message. If it does, that message will be used; otherwise, proceed to the next map in the chain.

For some reason Zod does this "bottom-up". It first gets a message from the lowest-priority map first, then passes that into the higher-priority maps as `ctx.defaultError`.

```ts
const errorMap: ZodErrorMap = (issue, ctx) => {
  if (issue instanceof ZodInvalidLiteralIssue) {
    return { message: "Invalid literal!" };
  }
  return { message: ctx.defaultError };
};
```

The idea was to simplify the error map type signature by always requiring a return type of `{message: string}`. It would also encourage exhaustiveness checking by forcing the developer to explicitly return `{ message: ctx.defaultError }` if they want to defer to lower-priority error maps.

```ts
export type ZodErrorMap = (
  issue: ZodIssueOptionalMessage,
  ctx: { defaultError: string; data: any }
) => { message: string };

export type ZodIssueOptionalMessage =
  | ZodInvalidTypeIssue
  | ZodInvalidLiteralIssue
  // ...
  | ZodCustomIssue;
```

But this "bottom up" approach occurs an unnecessary performance penalty. All error maps must be run for each new issue.

## The fix

Switch over to a "top-down" resolution strategy. To accommodate this, error maps should allow returning `undefined/void` to signal that the issue should be passed down to the next map in the chain.

```diff
  export type ZodErrorMap = (
    issue: ZodIssueOptionalMessage,
    ctx: { defaultError: string; data: any }
-  ) => { message: string };
+  ) => undefined | { message: string };
```

# Issue #2: Verbosity

The current API is verbose. To override the error message for a particular issue code:

```ts
const errorMap: ZodErrorMap = (issue, ctx) => {
  if (issue instanceof ZodInvalidLiteralIssue) {
    return { message: "Invalid literal!" };
  }
  return { message: ctx.defaultError };
};
```

## The fix

Allow returning a string directly.

```ts
const errorMap: ZodErrorMap = (issue, ctx) => {
  if (issue instanceof ZodInvalidLiteralIssue) return "Invalid literal!";
};
```

This will be supported alongside the more verbose `{message: string}` syntax.

```diff
  export type ZodErrorMap = (
    issue: ZodIssueOptionalMessage,
    ctx: { defaultError: string; data: any }
+  ) => undefined | { message: string };
+  ) => undefined | message | { message: string };
```

# Issue #3: Inconsistency

Due to the verbosity of the current API, it was onerous for users to customize error messages for a specific schema.

```ts
const emailSchema = z.string({
  errorMap: (iss, ctx) => {
    if (iss.code === "invalid_type") {
      return { message: "Email must be a string" };
    }
    return { message: ctx.defaultError };
  },
});
```

To address this, Zod added some syntactic sugar: `invalid_type_error` and `required_error`.

```ts
const emailSchema = z.string({
  invalid_type_error: "Email must be a string",
  required_error: "Field cannot be left blank",
});
```

This has been useful for a lot of people, but it's quite inelegant in the context of Zod's broader error reporting system.

### Snake case

It's snake-case for the sake of visual consistency with Zod's issue code (e.g. `"invalid_type"`). But it's not consistent with the rest of Zod's API.

### Inconsistency with issue codes

While `invalid_type` is a known issue code, `required` is not. There's no special issue type for when a required field is missing...it's just an `invalid_type` error like any other. To users with knowledge of Zod's issue codes, the existence of `required_error` can be confusing.

### Footguns

The `invalid_type_error` will only be applied to issues with code `invalid_type`. This makes sense, but it has also confused users who think their custom message will be applied more broadly.

A particularly unfortunate example is this:

```ts
z.enum(["red", "white", "blue"], { invalid_type_error: "Invalid color" });
```

The custom message will only be applied if the input data is a non-string. If an invalid color ("green") is passed in, the resulting issue code is `invalid_enum_value`. As such the `invalid_type_error` message will not be applied. This is confusing. There's currently no easy one-liner for customizing the message for invalid enum values.

## The fix(es)

Zod will add a special `"required"` issue code. Trying to consolidate all type errors under `invalid_type` for the sake of elegance isn't pragmatic here. Some special treatment for `undefined` is inevitable in JavaScript.

> A `"required"` issue code is also an important part of Zod's new approach to key optionality in objects (`exactOptionalPropertyTypes`)—RFC forthcoming.

Zod will support an object-based syntactic sugar API on the `error` key. This customizing the error message for all issue codes. This also siloes the snake case keys into their own object, so they aren't alongside camelCase keys.

```ts
const emailSchema = z.string({
  error: {
    invalid_type: "Email must be a string",
    required: "Field cannot be blank",
  },
});
```

> As indicated in the previous example, Zod will add a special-cased issue code `"required"` for the case where `undefined` is passed as input into a non-optional schema.

Zod can limit the keys to the issue codes that are actually throwable by the schema. For instance, `ZodString` can only produce `invalid_type` and `required` errors. This will be enforced by TypeScript.

Technically, a `ZodString` schema can produce `invalid_string`, `too_small`, and `too_big` errors too, but these error messages should be customized in the method that introduces the constraint (e.g. `.uuid()`, `.min()`, etc).

Here's the enum example using the new API:

```ts
z.enum(["red", "white", "blue"], {
  error: {
    invalid_type: "Must be a string",
    invalid_enum_value: "Invalid color",
  },
});
```

# Final proposal

The type signature for ZodErrorMap will be changed to allow returning `undefined`. This will signal to Zod that the error map is kicking the can down to the next map in the chain.

```ts
export type ZodErrorMap = (
  issue: ZodIssueOptionalMessage,
  ctx: {
    /** @deprecated */
    defaultError: string;
    data: any;
  }
) => { message: string } | string | undefined;
```

A custom error map can be passed into a schema via the `error` key.

```ts
z.string({
  error: (issue, ctx) => {
    if (issue.code === "invalid_type") return "Email must be a string";
  },
});
```

> Currently error maps are passed as `errorMap`. This will be deprecated but supported for backwards compatibility.

This key will also support an object-based syntactic sugar:

```ts
z.string({
  error: {
    invalid_type: "Email must be a string",
    required: "Field cannot be blank",
  },
});
```

An even simpler string-based syntax will also be supported. This will be applied for all issue codes.

```ts
z.string({ error: "Invalid input" });
```

Currently, all refinement methods support error customization via the `message` key. For consistency, this will be deprecated in favor of `error` (but still supported).

```ts
// current
z.string().min(5, { message: "Too short" });

// new
z.string().min(5, { error: "Too short" });
```
