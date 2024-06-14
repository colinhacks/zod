<p align="center">
  <img src="logo.svg" width="200px" align="center" alt="Zod logo" />
  <h1 align="center">Zod</h1>
  <p align="center">
    ✨ <a href="https://zod.dev">https://zod.dev</a> ✨
    <br/>
    TypeScript-first schema validation with static type inference
  </p>
</p>
<br/>

<br/>
<br/>

## `Effect` plugin for Zod

This is a plugin to add support for `Effect` to Zod. Effect provides a foundation for writing TypeScript in a functional, composable way. Refer to the [Effect docs](https://effect.website/docs/guides/essentials/importing-effect) for details.

## Usage

Requirements (peer dependencies):

- `zod@^3.0.0`
- `effect@^3.0.0`

To install the plugin:

```bash
npm add effect zod @zod-plugin/effect
```

To use the plugin, add the following line in the _entry point_ of your application:

```ts
import "@zod-plugin/effect";
```

This adds two new methods to the `ZodType` base class. These methods are now available on all schemas throughout your application.

### `.effect.parse(data): Effect<T, ZodError, never>`

This method accepts some input data and parses it _asynchronously_.

```ts
import * as z from "zod";
import { Effect } from "effect";

import "@zod-plugin/effect";

const schema = z.object({
  name: z.string(),
});

const effect = schema.effect.parse({ name: "Michael Arnaldi" });
//=>  Effect<{ name: string }, ZodError, never>;

await Effect.runPromise(effect);
// => { name: "Michael Arnaldi" }
```

### `.effect.parseSync(data): Effect<T, ZodError, never>`

This method accepts some input data and parses it _synchronously_. If any asynchronous refinements or transforms are encountered, Effect will throw an error.

```ts
import * as z from "zod";
import { Effect } from "effect";

import "@zod-plugin/effect";

const schema = z.object({
  name: z.string(),
});

const effect = schema.effect.parseSync({ name: "Michael Arnaldi" });
//=>  Effect<{ name: string }, ZodError, never>;

await Effect.runSync(effect);
// => { name: "Michael Arnaldi" }
```
