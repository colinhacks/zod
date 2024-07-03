My full-time work on Zod 4, including the design & implementation of this proposal, is supported by [Clerk](https://go.clerk.com/DHliRIG). Friends don't let friends roll their own auth.

<a href="https://go.clerk.com/DHliRIG">
  <img src="https://github.com/colinhacks/zod/assets/3084745/22a4a523-5845-4ac7-b5be-02fbf436409f" alt="clerk logo" height="80" />
</a>

---

## Current behavior

Zod has had a long-standing policy of hiding input data from issues for security reasons.

The idea is that error loggers may accidentally persist sensistive information or PHI, which is undesirable in security-sensitive applications.

## Proposed change

For the sake of developer ergonomics, I propose that `ZodIssueBase` should include an `input` field containing the input data that caused the issue.

```diff
  export type ZodIssueBase = {
    path: (string | number)[];
    message?: string;
+   input?: unknown;
  };
```

This field could be accessed on thrown `ZodError` instances like so:

```ts
const result = z.string().safeParse(123);

if (!result.success) {
  result.error.issues[0].input; // 123
}
```

To preserve data security, this field will not be included when `NODE_ENV=production`. As such, the field is marked as optional in the type signature. User code that relies on this field must therefore check for its existence.

To override the default `NODE_ENV` behavior, users can set the `includeInput` config option with `z.configure` (RFC pending).

```ts
import { z } from "zod";

z.configure({
  // never include `input` on issues
  includeInput: "never",

  // always include `input` on issues
  includeInput: "always",

  // include `input` on issues only when NODE_ENV !== "production"
  includeInput: "default",
});
```

## Open questions

1. Should `input` be excluded for any other values of `NODE_ENV`? `staging` perhaps?
2. Environment-specific behavior inevitably introduces some potential for production-only breakage. Its the user's responsibility to ensure no production code depends on the existence of `issue.input`. Are there other safeguards that could be put in place to keep users from shooting themselves in the foot?
