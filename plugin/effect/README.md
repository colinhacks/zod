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
<!-- <p align="center">
<a href="https://github.com/colinhacks/zod/actions?query=branch%3Amaster"><img src="https://github.com/colinhacks/zod/actions/workflows/test.yml/badge.svg?event=push&branch=master" alt="Zod CI status" /></a>
<a href="https://twitter.com/colinhacks" rel="nofollow"><img src="https://img.shields.io/badge/created%20by-@colinhacks-4BBAAB.svg" alt="Created by Colin McDonnell"></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/colinhacks/zod" alt="License"></a>
<a href="https://www.npmjs.com/package/zod" rel="nofollow"><img src="https://img.shields.io/npm/dw/zod.svg" alt="npm"></a>
<a href="https://www.npmjs.com/package/zod" rel="nofollow"><img src="https://img.shields.io/github/stars/colinhacks/zod" alt="stars"></a>
<a href="https://discord.gg/KaSRdyX2vc" rel="nofollow"><img src="https://img.shields.io/discord/893487829802418277?label=Discord&logo=discord&logoColor=white" alt="discord server"></a>
</p> -->
<!-- 
<div align="center">
  <a href="https://zod.dev">Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://discord.gg/RcG33DQJdf">Discord</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://www.npmjs.com/package/zod">npm</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://deno.land/x/zod">deno</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/colinhacks/zod/issues/new">Issues</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://twitter.com/colinhacks">@colinhacks</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://trpc.io">tRPC</a>
  <br />
</div> -->

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
