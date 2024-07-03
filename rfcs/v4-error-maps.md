My full-time work on Zod 4, including the design & implementation of this proposal, is supported by [Clerk](https://go.clerk.com/DHliRIG). Friends don't let friends roll their own auth.

<a href="https://go.clerk.com/DHliRIG">
  <img src="https://github.com/colinhacks/zod/assets/3084745/22a4a523-5845-4ac7-b5be-02fbf436409f" alt="clerk logo" height="80" />
</a>

---

# Error maps in Zod 4

This document proposes a new error map API for Zod 4.

## Issue 1: Verbosity

The current API is verbose. To override the error message for a particular issue code:

```ts
const errorMap: ZodErrorMap = (issue, ctx) => {
  if (issue instanceof ZodInvalidLiteralIssue) {
    return { message: "Invalid literal!" };
  }
  return { message: ctx.defaultError };
};
```

### The fix

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
-  ) => { message: string };
+  ) => { message: string } | string;
```

## Issue 2: Confusing sugar

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

These keys are snake-case for the sake of visual consistency with Zod's issue code (e.g. `"invalid_type"`). But it's not consistent with the rest of Zod's API.

### Footguns

The `invalid_type_error` will only be applied to issues with code `invalid_type`. This makes sense, but it also has understandably confused users who think their custom message will be applied more broadly.

A particularly unfortunate example is this:

```ts
z.enum(["red", "white", "blue"], { invalid_type_error: "Invalid color" });
```

The custom message `invalid_type_error` is only applied to issues with code `invalid_type`. If the input is, say `"green"`, the resulting issue code is `invalid_enum_value`. As such the `invalid_type_error` message will not be applied. This is confusing.

### The fix(es)

Zod will support an object-based syntactic sugar API on the `error` key. This customizing the error message for all issue codes. This also siloes the snake case keys into their own object, so they aren't alongside camelCase keys.

```ts
const emailSchema = z.enum(["red", "white", "blue"], {
  error: {
    invalid_type: "Value should be a string",
    invalid_enum_value: "Invalid color",
  },
});
```

Zod can limit the keys to the issue codes that are actually throwable by the schema. For instance, `ZodEnum` will only ever produce `invalid_type` and `invalid_enum_value` errors. This will be enforced by TypeScript.

> Technically, a `ZodString` schema can produce `custom` issues from its stored refinements, but these mesages should be customized in the method that introduces the constraint (e.g. `.refine()`, `.uuid()`, `.min()`, etc).

The `invalid_type_error` and `required_error` fields will be deprecated.

## Issue 3: "Required" errors

There is an additional inconsistency in the current `invalid_type_error` and `required_error` API.

```ts
const emailSchema = z.string({
  invalid_type_error: "Email must be a string",
  required_error: "Field cannot be left blank",
});
```

While `invalid_type` is a Zod issue code, `required` is not. If you pass `undefined` into a `ZodString`, you get an `invalid_type` error. The same is true if you pass `null`, `12`, or any non-string value.

To users with knowledge of Zod's issue codes, the existence of `required_error` can be confusing because it doesn't correspond to an issue code.

### The fix

Zod will add a new issue code `"required"` issue code. This issue code will be used any time a value of `undefined` is passed into a non-optional schema.

```ts
const emailSchema = z.string({
  error: {
    required: "Field cannot be left blank",
    invalid_type: "Email must be a string",
  },
});
```

Trying to consolidate all type errors under `invalid_type` for the sake of elegance isn't pragmatic here. Some special treatment for `undefined` is inevitable in JavaScript. Arguably, `undefined` is not a value and has no type, so it should be considered separately from other type errors.

This also solves the inconsistency between Zod's error customization API and the set of issue codes that Zod actually throws.

> A `"required"` issue code will also be an important part of Zod's new approach to key optionality in objects (`exactOptionalPropertyTypes`)—RFC forthcoming. This code will be used when a key that's required by a `ZodObject` shape isn't specified in the input.

## Issue 4: Bottom-up execution

Zod's current approach to resolving error maps is a little backwards.

Zod generates error messages by passing a `message`-less version of the issue (`ZodIssueOptionalMessage`) into a pipeline of error maps. In order of increasing precedence, the error maps are:

1. contextual error map (passed into `.parse(<data>, {errorMap: myErrorMap})`)
2. schema-specific error map (`z.string({ errorMap: myErrorMap })` or `invalid_type_error`, etc)
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

But ultimately I don't think either of those reasons are particularly compelling, and is arguably more confusing than the alternative. This "bottom up" approach also incurs an unnecessary performance penalty since all error maps must be run for each new issue.

### The fix

Switch over to a "top-down" resolution strategy. To accommodate this, error maps should allow returning `undefined/void` to signal that the issue should be passed down to the next map in the chain.

```diff
  export type ZodErrorMap = (
    issue: ZodIssueOptionalMessage,
    ctx: {
+     /** @deprecated */
      defaultError: string;
      data: any
    }
-  ) => { message: string } | string;
+  ) => { message: string } | string | undefined;
```

For compatibility `ctx.defaultError` can be set to some unique internal string value like `"{{zod_default_error}}"`. When Zod sees this value, it will know to proceed to the next error map in the chain.

## Issue 5: Unnecessary `ctx`

With `ctx.defaultError` becoming irrelevant, the only remaining key on `ctx` is `ctx.data`.

On top of that, a sister RFC (yet to be published) will propose adding back a `input` key into `ZodIssue` in development environments. This key will contain the raw input data passed into the schema that originated the issue.

Zod has had a long-standing policy of hiding input data from issues for security reasons, because error loggers may accidentally write sensistive information to disk. Zod 4 will likely add back `issue.input`, which will then be stripped if `NODE_ENV=production`.

This obviates the need for `ctx.data`, since the same information will be available on `issue.input`.

### The fix

Deprecate `ctx` entirely.

```diff
  export type ZodErrorMap = (
    issue: ZodIssueOptionalMessage,
+   /** @deprecated */
    ctx: { defaultError: string; data: any }
  ) => { message: string } | string | undefined;
```

```ts
z.string({
  error(issue) {
    if (issue.code === "invalid_type") return `Bad input: ${issue.input}`;
  },
});
```

> The `ctx` argument of the error map signature will be entirely deprecated (but still supported for backwards compatibility).

# Final proposal

The type signature for ZodErrorMap will be changed to allow returning `undefined`. This will signal to Zod that the error map is kicking the can down to the next map in the chain. It will also support returning a plain string instead of `{message: string}`.

```ts
export type ZodErrorMap = (
  // includes `input` field to replace `ctx.data`
  issue: ZodIssueOptionalMessage,
  /** @deprecated */
  ctx: { defaultError: string; data: any }
) => { message: string } | string | undefined;
```

A custom error map can be passed into a schema via the `error` key.

```ts
z.string({
  error(issue) {
    if (issue.code === "invalid_type") return "Email must be a string";
  },
});
```

> Currently error maps are passed as `errorMap`. This will be deprecated but supported for backwards compatibility.

The `error` key will also support an object-based syntactic sugar.

```ts
z.string({
  error: {
    invalid_type: "Email must be a string",
    required: "Field cannot be blank",
  },
});
```

The `error` key will also support an even simpler string-based syntax. The passed error message will be applied for all issues that originate from inside this schema.

```ts
z.string({ error: "Invalid input" });
```

A new `"required"` issue code will be added. This code will be used whenever the input to a non-optional schema is `undefined`.

Currently, all refinement methods support error customization via the `message` key.

```ts
// current
z.string().min(5, { message: "Too short" });
```

For consistency, this will be deprecated in favor of `error`. The `message` field will still be supported, but will be removed in a future major version.

```ts
// new
z.string().min(5, { error: "Too short" });
```
