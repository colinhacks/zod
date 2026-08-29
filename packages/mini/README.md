# @zod/mini

Zod Mini as a standalone package. It re-exports [`zod/mini`](https://zod.dev/packages/mini) from a peer dependency on `zod`, so every schema it creates is a `zod` schema.

```sh
npm install zod @zod/mini
```

```ts
import * as z from "@zod/mini";

const User = z.object({
  name: z.string(),
  age: z.number().check(z.int(), z.positive()),
});

z.parse(User, { name: "Colin", age: 30 });
```

The version tracks `zod`: each `@zod/mini@4.x.y` requires `zod@^4.x.0`.
