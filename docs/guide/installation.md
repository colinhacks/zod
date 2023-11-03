# Installation

## Requirements

- TypeScript 4.5+!
- You must enable `strict` mode in your `tsconfig.json`. This is a best practice for all TypeScript projects.

:::code-group

```json [tsconfig.json]
{
  // ...
  "compilerOptions": {
    // ...
    "strict": true
  }
}
```

:::

## From `npm` (Node/Bun)

:::code-group

```sh [npm]
npm install zod
```

```sh [yarn]
yarn add zod
```

```sh [bun]
bun add zod
```

```sh [pnpm]
pnpm add zod
```

:::

Zod also publishes a canary version on every commit. To install the canary:

:::code-group

```sh [npm]
npm install zod@canary
```

```sh [yarn]
yarn add zod@canary
```

```sh [bun]
bun add zod@canary
```

```sh [pnpm]
pnpm add zod@canary
```

:::

## From `deno.land/x` (Deno)

Unlike Node, Deno relies on direct URL imports instead of a package manager like NPM. Zod is available on [deno.land/x](https://deno.land/x). The latest version can be imported like so:

```ts
import { z } from "https://deno.land/x/zod/mod.ts";
```

You can also specify a particular version:

```ts
import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";
```

> The rest of this README assumes you are using npm and importing directly from the `"zod"` package.
