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
<p align="center">
<a href="https://github.com/colinhacks/zod/actions?query=branch%3Amaster"><img src="https://github.com/colinhacks/zod/actions/workflows/test.yml/badge.svg?event=push&branch=master" alt="Zod CI status" /></a>
<a href="https://twitter.com/colinhacks" rel="nofollow"><img src="https://img.shields.io/badge/created%20by-@colinhacks-4BBAAB.svg" alt="Created by Colin McDonnell"></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/colinhacks/zod" alt="License"></a>
<a href="https://www.npmjs.com/package/zod" rel="nofollow"><img src="https://img.shields.io/npm/dw/zod.svg" alt="npm"></a>
<a href="https://www.npmjs.com/package/zod" rel="nofollow"><img src="https://img.shields.io/github/stars/colinhacks/zod" alt="stars"></a>
<a href="https://discord.gg/KaSRdyX2vc" rel="nofollow"><img src="https://img.shields.io/discord/893487829802418277?label=Discord&logo=discord&logoColor=white" alt="discord server"></a>
</p>

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
</div>

<br/>
<br/>

> These docs have been translated into [Chinese](./README_ZH.md).

## Table of contents

<!-- The full documentation is available both on the [official documentation site](https://zod.js.org/) (recommended) and in `README.md`.

#### Go to [zod.js.org](https://zod.js.org) >> -->

- [Table of contents](#table-of-contents)
- [Introduction](#introduction)
  - [Sponsors](#sponsors)
    - [Gold](#gold)
    - [Silver](#silver)
    - [Bronze](#bronze)
  - [Ecosystem](#ecosystem)
    - [Resources](#resources)
    - [API libraries](#api-libraries)
    - [Form integrations](#form-integrations)
    - [Zod to X](#zod-to-x)
    - [X to Zod](#x-to-zod)
    - [Mocking](#mocking)
    - [Powered by Zod](#powered-by-zod)
    - [Utilities for Zod](#utilities-for-zod)
- [Installation](#installation)
  - [Requirements](#requirements)
  - [From `npm` (Node/Bun)](#from-npm-nodebun)
  - [From `deno.land/x` (Deno)](#from-denolandx-deno)
- [Basic usage](#basic-usage)
- [Primitives](#primitives)
- [Coercion for primitives](#coercion-for-primitives)
- [Literals](#literals)
- [Strings](#strings)
  - [ISO datetimes](#iso-datetimes)
  - [IP addresses](#ip-addresses)
- [Numbers](#numbers)
- [BigInts](#bigints)
- [NaNs](#nans)
- [Booleans](#booleans)
- [Dates](#dates)
- [Zod enums](#zod-enums)
- [Native enums](#native-enums)
- [Optionals](#optionals)
- [Nullables](#nullables)
- [Objects](#objects)
  - [`.shape`](#shape)
  - [`.keyof`](#keyof)
  - [`.extend`](#extend)
  - [`.merge`](#merge)
  - [`.pick/.omit`](#pickomit)
  - [`.partial`](#partial)
  - [`.deepPartial`](#deeppartial)
  - [`.required`](#required)
  - [`.passthrough`](#passthrough)
  - [`.strict`](#strict)
  - [`.strip`](#strip)
  - [`.catchall`](#catchall)
- [Arrays](#arrays)
  - [`.element`](#element)
  - [`.nonempty`](#nonempty)
  - [`.min/.max/.length`](#minmaxlength)
- [Tuples](#tuples)
- [Unions](#unions)
- [Discriminated unions](#discriminated-unions)
- [Records](#records)
  - [Record key type](#record-key-type)
- [Maps](#maps)
- [Sets](#sets)
- [Intersections](#intersections)
- [Recursive types](#recursive-types)
  - [ZodType with ZodEffects](#zodtype-with-zodeffects)
  - [JSON type](#json-type)
  - [Cyclical objects](#cyclical-objects)
- [Promises](#promises)
- [Instanceof](#instanceof)
- [Functions](#functions)
- [Preprocess](#preprocess)
- [Custom schemas](#custom-schemas)
- [Schema methods](#schema-methods)
  - [`.parse`](#parse)
  - [`.parseAsync`](#parseasync)
  - [`.safeParse`](#safeparse)
  - [`.safeParseAsync`](#safeparseasync)
  - [`.refine`](#refine)
    - [Arguments](#arguments)
    - [Customize error path](#customize-error-path)
    - [Asynchronous refinements](#asynchronous-refinements)
    - [Relationship to transforms](#relationship-to-transforms)
  - [`.superRefine`](#superrefine)
    - [Abort early](#abort-early)
    - [Type refinements](#type-refinements)
  - [`.transform`](#transform)
    - [Chaining order](#chaining-order)
    - [Validating during transform](#validating-during-transform)
    - [Relationship to refinements](#relationship-to-refinements)
    - [Async transforms](#async-transforms)
  - [`.default`](#default)
  - [`.describe`](#describe)
  - [`.catch`](#catch)
  - [`.optional`](#optional)
  - [`.nullable`](#nullable)
  - [`.nullish`](#nullish)
  - [`.array`](#array)
  - [`.promise`](#promise)
  - [`.or`](#or)
  - [`.and`](#and)
  - [`.brand`](#brand)
  - [`.readonly`](#readonly)
  - [`.pipe`](#pipe)
    - [You can use `.pipe()` to fix common issues with `z.coerce`.](#you-can-use-pipe-to-fix-common-issues-with-zcoerce)
- [Guides and concepts](#guides-and-concepts)
  - [Type inference](#type-inference)
  - [Writing generic functions](#writing-generic-functions)
    - [Constraining allowable inputs](#constraining-allowable-inputs)
  - [Error handling](#error-handling)
  - [Error formatting](#error-formatting)
- [Comparison](#comparison)
  - [Joi](#joi)
  - [Yup](#yup)
  - [io-ts](#io-ts)
  - [Runtypes](#runtypes)
  - [Ow](#ow)
- [Changelog](#changelog)

## Introduction

Zod is a TypeScript-first schema declaration and validation library. I'm using the term "schema" to broadly refer to any data type, from a simple `string` to a complex nested object.

Zod is designed to be as developer-friendly as possible. The goal is to eliminate duplicative type declarations. With Zod, you declare a validator _once_ and Zod will automatically infer the static TypeScript type. It's easy to compose simpler types into complex data structures.

Some other great aspects:

- Zero dependencies
- Works in Node.js and all modern browsers
- Tiny: 8kb minified + zipped
- Immutable: methods (e.g. `.optional()`) return a new instance
- Concise, chainable interface
- Functional approach: [parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)
- Works with plain JavaScript too! You don't need to use TypeScript.

### Sponsors

Sponsorship at any level is appreciated and encouraged. For individual developers, consider the [Cup of Coffee tier](https://github.com/sponsors/colinhacks). If you built a paid product using Zod, consider one of the [podium tiers](https://github.com/sponsors/colinhacks).

#### Gold

<table>
  <tr>
    <td align="center">
      <a href="https://speakeasyapi.dev/" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/91446104?s=200&v=4" width="200px;" alt="Speakeasy API" />
      </a>
      <br />
      <b>Speakeasy</b>
      <br />
      <a href="https://speakeasyapi.dev/" target="_blank">speakeasyapi.dev</a>
      <br />
      <p width="200px">SDKs, Terraform, Docs.<br/>Your API made enterprise-ready</p>
    </td>
    <td align="center">
      <a href="https://deletype.com/" target="_blank">
        <img src="https://avatars0.githubusercontent.com/u/15068039?s=200&v=4" width="200px;" alt="Deletype logo" />
      </a>
      <br />
      <b>Deletype</b>
      <br />
      <a href="https://deletype.com" target="_blank">deletype.com</a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://trigger.dev/" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/95297378?s=200&v=4" width="200px;" alt="Trigger.dev logo" />
      </a>
      <br />
      <b>Trigger.dev</b>
      <br />
      <a href="https://trigger.dev" target="_blank">trigger.dev</a>
      <br/>
      <p>Effortless automation for developers</p>
    </td>
    <td align="center">
      <a href="https://transloadit.com/?utm_source=zod&utm_medium=referral&utm_campaign=sponsorship&utm_content=github" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/125754?s=200&v=4" width="200px;" alt="Transloadit logo" />
      </a>
      <br />
      <b>Transloadit</b>
      <br />
      <a href="https://transloadit.com/?utm_source=zod&utm_medium=referral&utm_campaign=sponsorship&utm_content=github" target="_blank">transloadit.com</a>
      <br/>
      <p>Simple file processing for developers</p>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://infisical.com" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/107880645?s=200&v=4" width="200px;" alt="Infisical logo" />
      </a>
      <br />
      <b>Infisical</b>
      <br />
      <a href="https://infisical.com" target="_blank">infisical.com</a>
      <br/>
      <p>Open-source platform for secret<br/>management: sync secrets across your<br/>team/infrastructure and prevent secret leaks</p>
    </td>
    <td align="center">
      <a href="https://whop.com/" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/91036480?s=200&v=4" width="200px;" alt="Whop logo" />
      </a>
      <br />
      <b>Whop</b>
      <br />
      <a href="https://whop.com/" target="_blank">whop.com</a>
      <br />
      <p width="200px">A marketplace for really cool internet products</p>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://cryptojobslist.com/" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/36402888?s=200&v=4" width="200px;" alt="CryptoJobsList logo" />
      </a>
      <br />
      <b>CryptoJobsList</b>
      <br />
      <a href="https://cryptojobslist.com/" target="_blank">cryptojobslist.com</a>
      <br />
      <p width="200px">The biggest list of crypto, blockchain and Web3 jobs</p>
    </td>
    <td align="center">
      <a href="https://plain.com/" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/70170949?s=200&v=4" width="200px;" alt="Plain logo" />
      </a>
      <br />
      <b>Plain.</b>
      <br />
      <a href="https://plain.com/" target="_blank">plain.com</a>
      <br />
      <p width="200px">How developers support their users</p>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://inngest.com/" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/78935958?s=200&v=4" width="200px;" alt="Inngest logo" />
      </a>
      <br />
      <b>Inngest</b>
      <br />
      <a href="https://inngest.com/" target="_blank">inngest.com</a>
      <br />
      <p width="200px">Serverless queues + durable workflows for TypeScript</p>
    </td>
    <td align="center">
      <a href="https://storyblok.com/" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/13880908?s=200&v=4" width="200px;" alt="Storyblok CMS" />
      </a>
      <br />
      <b>Storyblok</b>
      <br />
      <a href="https://storyblok.com/" target="_blank">storyblok.com</a>
      <br />
      <p width="200px">The only headless CMS with a visual editor</p>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://mux.link/zod" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/16199997?s=200&v=4" width="200px;" alt="Mux logo" />
      </a>
      <br />
      <b>Mux</b>
      <br />
      <a href="https://mux.link/zod" target="_blank">mux.com</a>
      <br />
      <p width="200px">The internet's video infrastructure</p>
    </td>
  </tr>
</table>

#### Silver

<table>
  <tr>
    <td align="center" colspan="2">
      <a href="https://www.numeric.io" target="_blank">
        <img src="https://i.imgur.com/kTiLtZt.png" width="250px;" alt="Numeric logo" />
      </a>
      <br />
      <b>Numeric</b>
      <br />
      <a href="https://www.numeric.io" target="_blank">numeric.io</a>
    </td>
    <td align="center">
      <a href="https://marcatopartners.com/" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/84106192?s=200&v=4" width="150px;" alt="Marcato Partners" />
      </a>
      <br />
      <b>Marcato Partners</b>
      <br />
      <a href="https://marcatopartners.com/" target="_blank">marcatopartners.com</a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://interval.com" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/67802063?s=200&v=4" width="150px;" alt="" />
      </a>
      <br />
      <b>Interval</b>
      <br />
      <a href="https://interval.com" target="_blank">interval.com</a>
    </td>
    <td align="center">
      <a href="https://seasoned.cc" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/33913103?s=200&v=4" width="150px;" alt="" />
      </a>
      <br />
      <b>Seasoned Software</b>
      <br />
      <a href="https://seasoned.cc" target="_blank">seasoned.cc</a>
    </td>
    <td align="center">
      <a href="https://www.bamboocreative.nz/" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/41406870?v=4" width="150px;" alt="Bamboo Creative logo" />
      </a>
      <br />
      <b>Bamboo Creative</b>
      <br />
      <a href="https://www.bamboocreative.nz" target="_blank">bamboocreative.nz</a>
    </td>
  </tr>
</table>

#### Bronze

<table>
  <tr>
    <td align="center">
      <a href="https://twitter.com/flybayer" target="_blank">
        <img src="https://avatars2.githubusercontent.com/u/8813276?s=460&u=4ff8beb9a67b173015c4b426a92d89cab960af1b&v=4" width="100px;" alt=""/>
      </a>
      <br />
      <b>Brandon Bayer</b>
      <br/>
      <a href="https://twitter.com/flybayer" target="_blank">@flybayer</a>,
      <span>creator of <a href="https://blitzjs.com">Blitz.js</a></span>
      <br />
    </td>
    <td align="center">
      <a href="https://github.com/brabeji" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/2237954?v=4" width="100px;" alt=""/>
      </a>
      <br />
      <b>Jiří Brabec</b>
      <br/>
      <a href="https://github.com/brabeji" target="_blank">@brabeji</a>
      <br />
    </td>
     <td align="center">
      <a href="https://twitter.com/alexdotjs" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/459267?v=4" width="100px;" alt="" />
      </a>
      <br />
      <b>Alex Johansson</b>
      <br />
      <a href="https://twitter.com/alexdotjs" target="_blank">@alexdotjs</a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://fungible.systems/" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/80220121?s=200&v=4" width="100px;" alt="Fungible Systems logo"/>
      </a>
      <br />
      <b>Fungible Systems</b>
      <br/>
      <a href="https://fungible.systems/" target="_blank">fungible.systems</a>
      <br />
    </td>
    <td align="center">
      <a href="https://adaptable.io/" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/60378268?s=200&v=4" width="100px;" alt=""/>
      </a>
      <br />
      <b>Adaptable</b>
      <br/>
      <a href="https://adaptable.io/" target="_blank">adaptable.io</a>
      <br />
    </td>
    <td align="center">
      <a href="https://www.avanawallet.com/" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/105452197?s=200&v=4" width="100px;" alt="Avana Wallet logo"/>
      </a>
      <br />
      <b>Avana Wallet</b>
      <br/>
      <a href="https://www.avanawallet.com/" target="_blank">avanawallet.com</a><br/>
      <span>Solana non-custodial wallet</span>
      <br />
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://learnwithjason.dev" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/66575486?s=200&v=4" width="100px;" alt="Learn with Jason logo"/>
      </a>
      <br />
      <b>Jason Lengstorf</b>
      <br/>
      <a href="https://learnwithjason.dev/" target="_blank">learnwithjason.dev</a>
      <br />
    </td>
    <td align="center">
      <a href="https://ill.inc/" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/89107581?s=200&v=4" width="100px;" alt="Global Illumination"/>
      </a>
      <br />
      <b>Global Illumination, Inc.</b>
      <br/>
      <a href="https://ill.inc/" target="_blank">ill.inc</a>
      <br />
    </td>
    <td align="center">
      <a href="https://www.masterborn.com/career?utm_source=github&utm_medium=referral&utm_campaign=zodsponsoring" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/48984031?s=200&v=4" width="100px;" alt="MasterBorn logo"/>
      </a>
      <br />
      <b>MasterBorn</b>
      <br/>
      <a href="https://www.masterborn.com/career?utm_source=github&utm_medium=referral&utm_campaign=zodsponsoring" target="_blank">masterborn.com</a>
      <br />
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/kronodeus" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/18314366?v=4" width="100px;" alt="Ryan Palmer"/>
      </a>
      <br />
      <b>Ryan Palmer</b>
      <br/>
      <a href="https://github.com/kronodeus" target="_blank">@kronodeus</a>
      <br />
    </td>
    <td align="center">
      <a href="https://github.com/overthemike" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/223509?v=4" width="100px;" alt="Michael Sweeney"/>
      </a>
      <br />
      <b>Michael Sweeney</b>
      <br/>
      <a href="https://github.com/overthemike" target="_blank">@overthemike</a>
      <br />
    </td>
    <td align="center">
      <a href="https://usenextbase.com/" target="_blank">
        <img src="https://pbs.twimg.com/profile_images/1692236063409070080/28yXFtop_400x400.jpg" width="100px;" alt="Nextbase logo"/>
      </a>
      <br />
      <b>Nextbase</b>
      <br/>
      <a href="https://usenextbase.com/" target="_blank">usenextbase.com</a>
      <br />
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://remotion.dev" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/85344006" width="100px;" alt="Remotion logo"/>
      </a>
      <br />
      <b>Remotion</b>
      <br/>
      <a href="https://remotion.dev" target="_blank">remotion.dev</a>
      <br />
    </td>
  </tr>
</table>

### Ecosystem

There are a growing number of tools that are built atop or support Zod natively! If you've built a tool or library on top of Zod, tell me about it [on Twitter](https://twitter.com/colinhacks) or [start a Discussion](https://github.com/colinhacks/zod/discussions). I'll add it below and tweet it out.

#### Resources

- [Total TypeScript Zod Tutorial](https://www.totaltypescript.com/tutorials/zod) by [@mattpocockuk](https://twitter.com/mattpocockuk)
- [Fixing TypeScript's Blindspot: Runtime Typechecking](https://www.youtube.com/watch?v=rY_XqfSHock) by [@jherr](https://twitter.com/jherr)

#### API libraries

- [`tRPC`](https://github.com/trpc/trpc): Build end-to-end typesafe APIs without GraphQL.
- [`@anatine/zod-nestjs`](https://github.com/anatine/zod-plugins/tree/main/packages/zod-nestjs): Helper methods for using Zod in a NestJS project.
- [`zod-endpoints`](https://github.com/flock-community/zod-endpoints): Contract-first strictly typed endpoints with Zod. OpenAPI compatible.
- [`zhttp`](https://github.com/evertdespiegeleer/zhttp): An OpenAPI compatible, strictly typed http library with Zod input and response validation.
- [`domain-functions`](https://github.com/SeasonedSoftware/domain-functions/): Decouple your business logic from your framework using composable functions. With first-class type inference from end to end powered by Zod schemas.
- [`@zodios/core`](https://github.com/ecyrbe/zodios): A typescript API client with runtime and compile time validation backed by axios and zod.
- [`express-zod-api`](https://github.com/RobinTail/express-zod-api): Build Express-based APIs with I/O schema validation and custom middlewares.
- [`tapiduck`](https://github.com/sumukhbarve/monoduck/blob/main/src/tapiduck/README.md): End-to-end typesafe JSON APIs with Zod and Express; a bit like tRPC, but simpler.
- [`koa-zod-router`](https://github.com/JakeFenley/koa-zod-router): Create typesafe routes in Koa with I/O validation using Zod.

#### Form integrations

- [`react-hook-form`](https://github.com/react-hook-form/resolvers#zod): A first-party Zod resolver for React Hook Form.
- [`zod-validation-error`](https://github.com/causaly/zod-validation-error): Generate user-friendly error messages from `ZodError`s.
- [`zod-formik-adapter`](https://github.com/robertLichtnow/zod-formik-adapter): A community-maintained Formik adapter for Zod.
- [`react-zorm`](https://github.com/esamattis/react-zorm): Standalone `<form>` generation and validation for React using Zod.
- [`zodix`](https://github.com/rileytomasek/zodix): Zod utilities for FormData and URLSearchParams in Remix loaders and actions.
- [`conform`](https://conform.guide/api/zod/parseWithZod): A typesafe form validation library for progressive enhancement of HTML forms. Works with Remix and Next.js.
- [`remix-params-helper`](https://github.com/kiliman/remix-params-helper): Simplify integration of Zod with standard URLSearchParams and FormData for Remix apps.
- [`formik-validator-zod`](https://github.com/glazy/formik-validator-zod): Formik-compliant validator library that simplifies using Zod with Formik.
- [`zod-i18n-map`](https://github.com/aiji42/zod-i18n): Useful for translating Zod error messages.
- [`@modular-forms/solid`](https://github.com/fabian-hiller/modular-forms): Modular form library for SolidJS that supports Zod for validation.
- [`houseform`](https://github.com/crutchcorn/houseform/): A React form library that uses Zod for validation.
- [`sveltekit-superforms`](https://github.com/ciscoheat/sveltekit-superforms): Supercharged form library for SvelteKit with Zod validation.
- [`mobx-zod-form`](https://github.com/MonoidDev/mobx-zod-form): Data-first form builder based on MobX & Zod.
- [`@vee-validate/zod`](https://github.com/logaretm/vee-validate/tree/main/packages/zod): Form library for Vue.js with Zod schema validation.

#### Zod to X

- [`zod-to-ts`](https://github.com/sachinraja/zod-to-ts): Generate TypeScript definitions from Zod schemas.
- [`zod-to-json-schema`](https://github.com/StefanTerdell/zod-to-json-schema): Convert your Zod schemas into [JSON Schemas](https://json-schema.org/).
- [`@anatine/zod-openapi`](https://github.com/anatine/zod-plugins/tree/main/packages/zod-openapi): Converts a Zod schema to an OpenAPI v3.x `SchemaObject`.
- [`zod-fast-check`](https://github.com/DavidTimms/zod-fast-check): Generate `fast-check` arbitraries from Zod schemas.
- [`zod-dto`](https://github.com/kbkk/abitia/tree/master/packages/zod-dto): Generate Nest.js DTOs from a Zod schema.
- [`fastify-type-provider-zod`](https://github.com/turkerdev/fastify-type-provider-zod): Create Fastify type providers from Zod schemas.
- [`zod-to-openapi`](https://github.com/asteasolutions/zod-to-openapi): Generate full OpenAPI (Swagger) docs from Zod, including schemas, endpoints & parameters.
- [`nestjs-graphql-zod`](https://github.com/incetarik/nestjs-graphql-zod): Generates NestJS GraphQL model classes from Zod schemas. Provides GraphQL method decorators working with Zod schemas.
- [`zod-openapi`](https://github.com/samchungy/zod-openapi): Create full OpenAPI v3.x documentation from Zod schemas.
- [`fastify-zod-openapi`](https://github.com/samchungy/fastify-zod-openapi): Fastify type provider, validation, serialization and @fastify/swagger support for Zod schemas.
- [`typeschema`](https://typeschema.com/): Universal adapter for schema validation.

#### X to Zod

- [`ts-to-zod`](https://github.com/fabien0102/ts-to-zod): Convert TypeScript definitions into Zod schemas.
- [`@runtyping/zod`](https://github.com/johngeorgewright/runtyping/tree/master/packages/zod): Generate Zod from static types & JSON schema.
- [`json-schema-to-zod`](https://github.com/StefanTerdell/json-schema-to-zod): Convert your [JSON Schemas](https://json-schema.org/) into Zod schemas. [Live demo](https://StefanTerdell.github.io/json-schema-to-zod-react/).
- [`json-to-zod`](https://github.com/rsinohara/json-to-zod): Convert JSON objects into Zod schemas. [Live demo](https://rsinohara.github.io/json-to-zod-react/).
- [`graphql-codegen-typescript-validation-schema`](https://github.com/Code-Hex/graphql-codegen-typescript-validation-schema): GraphQL Code Generator plugin to generate form validation schema from your GraphQL schema.
- [`zod-prisma`](https://github.com/CarterGrimmeisen/zod-prisma): Generate Zod schemas from your Prisma schema.
- [`Supervillain`](https://github.com/Southclaws/supervillain): Generate Zod schemas from your Go structs.
- [`prisma-zod-generator`](https://github.com/omar-dulaimi/prisma-zod-generator): Emit Zod schemas from your Prisma schema.
- [`prisma-trpc-generator`](https://github.com/omar-dulaimi/prisma-trpc-generator): Emit fully implemented tRPC routers and their validation schemas using Zod.
- [`zod-prisma-types`](https://github.com/chrishoermann/zod-prisma-types) Create Zod types from your Prisma models.
- [`quicktype`](https://app.quicktype.io/): Convert JSON objects and JSON schemas into Zod schemas.
- [`@sanity-typed/zod`](https://github.com/saiichihashimoto/sanity-typed/tree/main/packages/zod): Generate Zod Schemas from [Sanity Schemas](https://www.sanity.io/docs/schema-types).

#### Mocking

- [`@anatine/zod-mock`](https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock): Generate mock data from a Zod schema. Powered by [faker.js](https://github.com/faker-js/faker).
- [`zod-mocking`](https://github.com/dipasqualew/zod-mocking): Generate mock data from your Zod schemas.
- [`zod-fixture`](https://github.com/timdeschryver/zod-fixture): Use your zod schemas to automate the generation of non-relevant test fixtures in a deterministic way.
- [`zocker`](https://zocker.sigrist.dev): Generate plausible mock-data from your schemas.
- [`zodock`](https://github.com/ItMaga/zodock) Generate mock data based on Zod schemas.

#### Powered by Zod

- [`freerstore`](https://github.com/JacobWeisenburger/freerstore): Firestore cost optimizer.
- [`slonik`](https://github.com/gajus/slonik/tree/gajus/add-zod-validation-backwards-compatible#runtime-validation-and-static-type-inference): Node.js Postgres client with strong Zod integration.
- [`soly`](https://github.com/mdbetancourt/soly): Create CLI applications with zod.
- [`pastel`](https://github.com/vadimdemedes/pastel): Create CLI applications with react, zod, and ink.
- [`zod-xlsx`](https://github.com/sidwebworks/zod-xlsx): A xlsx based resource validator using Zod schemas.
- [`znv`](https://github.com/lostfictions/znv): Type-safe environment parsing and validation for Node.js with Zod schemas.
- [`zod-config`](https://github.com/alexmarqs/zod-config): Load configurations across multiple sources with flexible adapters, ensuring type safety with Zod.

#### Utilities for Zod

- [`zod_utilz`](https://github.com/JacobWeisenburger/zod_utilz): Framework agnostic utilities for Zod.
- [`zod-sandbox`](https://github.com/nereumelo/zod-sandbox): Controlled environment for testing zod schemas. [Live demo](https://zod-sandbox.vercel.app/).
- [`zod-dev`](https://github.com/schalkventer/zod-dev): Conditionally disables Zod runtime parsing in production.

## Installation

### Requirements

- TypeScript 4.5+!
- You must enable `strict` mode in your `tsconfig.json`. This is a best practice for all TypeScript projects.

  ```ts
  // tsconfig.json
  {
    // ...
    "compilerOptions": {
      // ...
      "strict": true
    }
  }
  ```

### From `npm` (Node/Bun)

```sh
npm install zod       # npm
yarn add zod          # yarn
bun add zod           # bun
pnpm add zod          # pnpm
```

Zod also publishes a canary version on every commit. To install the canary:

```sh
npm install zod@canary       # npm
yarn add zod@canary          # yarn
bun add zod@canary           # bun
pnpm add zod@canary          # pnpm
```

### From `deno.land/x` (Deno)

Unlike Node, Deno relies on direct URL imports instead of a package manager like NPM. Zod is available on [deno.land/x](https://deno.land/x). The latest version can be imported like so:

```ts
import { z } from "https://deno.land/x/zod/mod.ts";
```

You can also specify a particular version:

```ts
import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";
```

> The rest of this README assumes you are using npm and importing directly from the `"zod"` package.

## Basic usage

Creating a simple string schema

```ts
import { z } from "zod";

// creating a schema for strings
const mySchema = z.string();

// parsing
mySchema.parse("tuna"); // => "tuna"
mySchema.parse(12); // => throws ZodError

// "safe" parsing (doesn't throw error if validation fails)
mySchema.safeParse("tuna"); // => { success: true; data: "tuna" }
mySchema.safeParse(12); // => { success: false; error: ZodError }
```

Creating an object schema

```ts
import { z } from "zod";

const User = z.object({
  username: z.string(),
});

User.parse({ username: "Ludwig" });

// extract the inferred type
type User = z.infer<typeof User>;
// { username: string }
```

## Primitives

```ts
import { z } from "zod";

// primitive values
z.string();
z.number();
z.bigint();
z.boolean();
z.date();
z.symbol();

// empty types
z.undefined();
z.null();
z.void(); // accepts undefined

// catch-all types
// allows any value
z.any();
z.unknown();

// never type
// allows no values
z.never();
```

## Coercion for primitives

Zod now provides a more convenient way to coerce primitive values.

```ts
const schema = z.coerce.string();
schema.parse("tuna"); // => "tuna"
schema.parse(12); // => "12"
```

During the parsing step, the input is passed through the `String()` function, which is a JavaScript built-in for coercing data into strings.

The returned schema is a normal `ZodString` instance so you can use all string methods.

```ts
z.coerce.string().email().min(5);
```

**How coercion works**

All primitive types support coercion. Zod coerces all inputs using the built-in constructors: `String(input)`, `Number(input)`, `new Date(input)`, etc.

```ts
z.coerce.string(); // String(input)
z.coerce.number(); // Number(input)
z.coerce.boolean(); // Boolean(input)
z.coerce.bigint(); // BigInt(input)
z.coerce.date(); // new Date(input)
```

Note that some behavior may not be what you expect.

```ts
schema.parse(true); // => "true"
schema.parse(undefined); // => "undefined"
schema.parse(null); // => "null"
```

For more control over coercion logic, consider using [`z.preprocess`](#preprocess) or [`z.pipe()`](#pipe).

**Boolean coercion**

Zod's approach to coercion is very simple! It passes the value into the `Boolean(value)` function, that's it. Any truthy value will resolve to `true`, any falsy value will resolve to `false`.

```ts
z.coerce.boolean().parse("tuna"); // => true
z.coerce.boolean().parse("true"); // => true
z.coerce.boolean().parse("false"); // => true
z.coerce.boolean().parse(1); // => true
z.coerce.boolean().parse([]); // => true

z.coerce.boolean().parse(0); // => false
z.coerce.boolean().parse(""); // => false
z.coerce.boolean().parse(undefined); // => false
z.coerce.boolean().parse(null); // => false
```

## Literals

Literal schemas represent a [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types), like `"hello world"` or `5`.

```ts
const tuna = z.literal("tuna");
const twelve = z.literal(12);
const twobig = z.literal(2n); // bigint literal
const tru = z.literal(true);

const terrificSymbol = Symbol("terrific");
const terrific = z.literal(terrificSymbol);

// retrieve literal value
tuna.value; // "tuna"
```

> Currently there is no support for Date literals in Zod. If you have a use case for this feature, please file an issue.

## Strings

Zod includes a handful of string-specific validations.

```ts
// validations
z.string().max(5);
z.string().min(5);
z.string().length(5);
z.string().email();
z.string().url();
z.string().emoji();
z.string().uuid();
z.string().cuid();
z.string().cuid2();
z.string().ulid();
z.string().regex(regex);
z.string().includes(string);
z.string().startsWith(string);
z.string().endsWith(string);
z.string().datetime(); // ISO 8601; default is without UTC offset, see below for options
z.string().ip(); // defaults to IPv4 and IPv6, see below for options

// transformations
z.string().trim(); // trim whitespace
z.string().toLowerCase(); // toLowerCase
z.string().toUpperCase(); // toUpperCase
```

> Check out [validator.js](https://github.com/validatorjs/validator.js) for a bunch of other useful string validation functions that can be used in conjunction with [Refinements](#refine).

You can customize some common error messages when creating a string schema.

```ts
const name = z.string({
  required_error: "Name is required",
  invalid_type_error: "Name must be a string",
});
```

When using validation methods, you can pass in an additional argument to provide a custom error message.

```ts
z.string().min(5, { message: "Must be 5 or more characters long" });
z.string().max(5, { message: "Must be 5 or fewer characters long" });
z.string().length(5, { message: "Must be exactly 5 characters long" });
z.string().email({ message: "Invalid email address" });
z.string().url({ message: "Invalid url" });
z.string().emoji({ message: "Contains non-emoji characters" });
z.string().uuid({ message: "Invalid UUID" });
z.string().includes("tuna", { message: "Must include tuna" });
z.string().startsWith("https://", { message: "Must provide secure URL" });
z.string().endsWith(".com", { message: "Only .com domains allowed" });
z.string().datetime({ message: "Invalid datetime string! Must be UTC." });
z.string().ip({ message: "Invalid IP address" });
```

### ISO datetimes

The `z.string().datetime()` method enforces ISO 8601; default is no timezone offsets and arbitrary sub-second decimal precision.

```ts
const datetime = z.string().datetime();

datetime.parse("2020-01-01T00:00:00Z"); // pass
datetime.parse("2020-01-01T00:00:00.123Z"); // pass
datetime.parse("2020-01-01T00:00:00.123456Z"); // pass (arbitrary precision)
datetime.parse("2020-01-01T00:00:00+02:00"); // fail (no offsets allowed)
```

Timezone offsets can be allowed by setting the `offset` option to `true`.

```ts
const datetime = z.string().datetime({ offset: true });

datetime.parse("2020-01-01T00:00:00+02:00"); // pass
datetime.parse("2020-01-01T00:00:00.123+02:00"); // pass (millis optional)
datetime.parse("2020-01-01T00:00:00.123+0200"); // pass (millis optional)
datetime.parse("2020-01-01T00:00:00.123+02"); // pass (only offset hours)
datetime.parse("2020-01-01T00:00:00Z"); // pass (Z still supported)
```

You can additionally constrain the allowable `precision`. By default, arbitrary sub-second precision is supported (but optional).

```ts
const datetime = z.string().datetime({ precision: 3 });

datetime.parse("2020-01-01T00:00:00.123Z"); // pass
datetime.parse("2020-01-01T00:00:00Z"); // fail
datetime.parse("2020-01-01T00:00:00.123456Z"); // fail
```

### IP addresses

The `z.string().ip()` method by default validate IPv4 and IPv6.

```ts
const ip = z.string().ip();

ip.parse("192.168.1.1"); // pass
ip.parse("84d5:51a0:9114:1855:4cfa:f2d7:1f12:7003"); // pass
ip.parse("84d5:51a0:9114:1855:4cfa:f2d7:1f12:192.168.1.1"); // pass

ip.parse("256.1.1.1"); // fail
ip.parse("84d5:51a0:9114:gggg:4cfa:f2d7:1f12:7003"); // fail
```

You can additionally set the IP `version`.

```ts
const ipv4 = z.string().ip({ version: "v4" });
ipv4.parse("84d5:51a0:9114:1855:4cfa:f2d7:1f12:7003"); // fail

const ipv6 = z.string().ip({ version: "v6" });
ipv6.parse("192.168.1.1"); // fail
```

## Numbers

You can customize certain error messages when creating a number schema.

```ts
const age = z.number({
  required_error: "Age is required",
  invalid_type_error: "Age must be a number",
});
```

Zod includes a handful of number-specific validations.

```ts
z.number().gt(5);
z.number().gte(5); // alias .min(5)
z.number().lt(5);
z.number().lte(5); // alias .max(5)

z.number().int(); // value must be an integer

z.number().positive(); //     > 0
z.number().nonnegative(); //  >= 0
z.number().negative(); //     < 0
z.number().nonpositive(); //  <= 0

z.number().multipleOf(5); // Evenly divisible by 5. Alias .step(5)

z.number().finite(); // value must be finite, not Infinity or -Infinity
z.number().safe(); // value must be between Number.MIN_SAFE_INTEGER and Number.MAX_SAFE_INTEGER
```

Optionally, you can pass in a second argument to provide a custom error message.

```ts
z.number().lte(5, { message: "this👏is👏too👏big" });
```

## BigInts

Zod includes a handful of bigint-specific validations.

```ts
z.bigint().gt(5n);
z.bigint().gte(5n); // alias `.min(5n)`
z.bigint().lt(5n);
z.bigint().lte(5n); // alias `.max(5n)`

z.bigint().positive(); // > 0n
z.bigint().nonnegative(); // >= 0n
z.bigint().negative(); // < 0n
z.bigint().nonpositive(); // <= 0n

z.bigint().multipleOf(5n); // Evenly divisible by 5n.
```

## NaNs

You can customize certain error messages when creating a nan schema.

```ts
const isNaN = z.nan({
  required_error: "isNaN is required",
  invalid_type_error: "isNaN must be 'not a number'",
});
```

## Booleans

You can customize certain error messages when creating a boolean schema.

```ts
const isActive = z.boolean({
  required_error: "isActive is required",
  invalid_type_error: "isActive must be a boolean",
});
```

## Dates

Use z.date() to validate `Date` instances.

```ts
z.date().safeParse(new Date()); // success: true
z.date().safeParse("2022-01-12T00:00:00.000Z"); // success: false
```

You can customize certain error messages when creating a date schema.

```ts
const myDateSchema = z.date({
  required_error: "Please select a date and time",
  invalid_type_error: "That's not a date!",
});
```

Zod provides a handful of date-specific validations.

```ts
z.date().min(new Date("1900-01-01"), { message: "Too old" });
z.date().max(new Date(), { message: "Too young!" });
```

**Coercion to Date**

Since [zod 3.20](https://github.com/colinhacks/zod/releases/tag/v3.20), use [`z.coerce.date()`](#coercion-for-primitives) to pass the input through `new Date(input)`.

```ts
const dateSchema = z.coerce.date();
type DateSchema = z.infer<typeof dateSchema>;
// type DateSchema = Date

/* valid dates */
console.log(dateSchema.safeParse("2023-01-10T00:00:00.000Z").success); // true
console.log(dateSchema.safeParse("2023-01-10").success); // true
console.log(dateSchema.safeParse("1/10/23").success); // true
console.log(dateSchema.safeParse(new Date("1/10/23")).success); // true

/* invalid dates */
console.log(dateSchema.safeParse("2023-13-10").success); // false
console.log(dateSchema.safeParse("0000-00-00").success); // false
```

For older zod versions, use [`z.preprocess`](#preprocess) like [described in this thread](https://github.com/colinhacks/zod/discussions/879#discussioncomment-2036276).

## Zod enums

```ts
const FishEnum = z.enum(["Salmon", "Tuna", "Trout"]);
type FishEnum = z.infer<typeof FishEnum>;
// 'Salmon' | 'Tuna' | 'Trout'
```

`z.enum` is a Zod-native way to declare a schema with a fixed set of allowable _string_ values. Pass the array of values directly into `z.enum()`. Alternatively, use `as const` to define your enum values as a tuple of strings. See the [const assertion docs](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) for details.

```ts
const VALUES = ["Salmon", "Tuna", "Trout"] as const;
const FishEnum = z.enum(VALUES);
```

This is not allowed, since Zod isn't able to infer the exact values of each element.

```ts
const fish = ["Salmon", "Tuna", "Trout"];
const FishEnum = z.enum(fish);
```

**`.enum`**

To get autocompletion with a Zod enum, use the `.enum` property of your schema:

```ts
FishEnum.enum.Salmon; // => autocompletes

FishEnum.enum;
/*
=> {
  Salmon: "Salmon",
  Tuna: "Tuna",
  Trout: "Trout",
}
*/
```

You can also retrieve the list of options as a tuple with the `.options` property:

```ts
FishEnum.options; // ["Salmon", "Tuna", "Trout"];
```

**`.exclude/.extract()`**

You can create subsets of a Zod enum with the `.exclude` and `.extract` methods.

```ts
const FishEnum = z.enum(["Salmon", "Tuna", "Trout"]);
const SalmonAndTrout = FishEnum.extract(["Salmon", "Trout"]);
const TunaOnly = FishEnum.exclude(["Salmon", "Trout"]);
```

## Native enums

Zod enums are the recommended approach to defining and validating enums. But if you need to validate against an enum from a third-party library (or you don't want to rewrite your existing enums) you can use `z.nativeEnum()`.

**Numeric enums**

```ts
enum Fruits {
  Apple,
  Banana,
}

const FruitEnum = z.nativeEnum(Fruits);
type FruitEnum = z.infer<typeof FruitEnum>; // Fruits

FruitEnum.parse(Fruits.Apple); // passes
FruitEnum.parse(Fruits.Banana); // passes
FruitEnum.parse(0); // passes
FruitEnum.parse(1); // passes
FruitEnum.parse(3); // fails
```

**String enums**

```ts
enum Fruits {
  Apple = "apple",
  Banana = "banana",
  Cantaloupe, // you can mix numerical and string enums
}

const FruitEnum = z.nativeEnum(Fruits);
type FruitEnum = z.infer<typeof FruitEnum>; // Fruits

FruitEnum.parse(Fruits.Apple); // passes
FruitEnum.parse(Fruits.Cantaloupe); // passes
FruitEnum.parse("apple"); // passes
FruitEnum.parse("banana"); // passes
FruitEnum.parse(0); // passes
FruitEnum.parse("Cantaloupe"); // fails
```

**Const enums**

The `.nativeEnum()` function works for `as const` objects as well. ⚠️ `as const` requires TypeScript 3.4+!

```ts
const Fruits = {
  Apple: "apple",
  Banana: "banana",
  Cantaloupe: 3,
} as const;

const FruitEnum = z.nativeEnum(Fruits);
type FruitEnum = z.infer<typeof FruitEnum>; // "apple" | "banana" | 3

FruitEnum.parse("apple"); // passes
FruitEnum.parse("banana"); // passes
FruitEnum.parse(3); // passes
FruitEnum.parse("Cantaloupe"); // fails
```

You can access the underlying object with the `.enum` property:

```ts
FruitEnum.enum.Apple; // "apple"
```

## Optionals

You can make any schema optional with `z.optional()`. This wraps the schema in a `ZodOptional` instance and returns the result.

```ts
const schema = z.optional(z.string());

schema.parse(undefined); // => returns undefined
type A = z.infer<typeof schema>; // string | undefined
```

For convenience, you can also call the `.optional()` method on an existing schema.

```ts
const user = z.object({
  username: z.string().optional(),
});
type C = z.infer<typeof user>; // { username?: string | undefined };
```

You can extract the wrapped schema from a `ZodOptional` instance with `.unwrap()`.

```ts
const stringSchema = z.string();
const optionalString = stringSchema.optional();
optionalString.unwrap() === stringSchema; // true
```

## Nullables

Similarly, you can create nullable types with `z.nullable()`.

```ts
const nullableString = z.nullable(z.string());
nullableString.parse("asdf"); // => "asdf"
nullableString.parse(null); // => null
```

Or use the `.nullable()` method.

```ts
const E = z.string().nullable(); // equivalent to nullableString
type E = z.infer<typeof E>; // string | null
```

Extract the inner schema with `.unwrap()`.

```ts
const stringSchema = z.string();
const nullableString = stringSchema.nullable();
nullableString.unwrap() === stringSchema; // true
```

## Objects

```ts
// all properties are required by default
const Dog = z.object({
  name: z.string(),
  age: z.number(),
});

// extract the inferred type like this
type Dog = z.infer<typeof Dog>;

// equivalent to:
type Dog = {
  name: string;
  age: number;
};
```

### `.shape`

Use `.shape` to access the schemas for a particular key.

```ts
Dog.shape.name; // => string schema
Dog.shape.age; // => number schema
```

### `.keyof`

Use `.keyof` to create a `ZodEnum` schema from the keys of an object schema.

```ts
const keySchema = Dog.keyof();
keySchema; // ZodEnum<["name", "age"]>
```

### `.extend`

You can add additional fields to an object schema with the `.extend` method.

```ts
const DogWithBreed = Dog.extend({
  breed: z.string(),
});
```

You can use `.extend` to overwrite fields! Be careful with this power!

### `.merge`

Equivalent to `A.extend(B.shape)`.

```ts
const BaseTeacher = z.object({ students: z.array(z.string()) });
const HasID = z.object({ id: z.string() });

const Teacher = BaseTeacher.merge(HasID);
type Teacher = z.infer<typeof Teacher>; // => { students: string[], id: string }
```

> If the two schemas share keys, the properties of B overrides the property of A. The returned schema also inherits the "unknownKeys" policy (strip/strict/passthrough) and the catchall schema of B.

### `.pick/.omit`

Inspired by TypeScript's built-in `Pick` and `Omit` utility types, all Zod object schemas have `.pick` and `.omit` methods that return a modified version. Consider this Recipe schema:

```ts
const Recipe = z.object({
  id: z.string(),
  name: z.string(),
  ingredients: z.array(z.string()),
});
```

To only keep certain keys, use `.pick` .

```ts
const JustTheName = Recipe.pick({ name: true });
type JustTheName = z.infer<typeof JustTheName>;
// => { name: string }
```

To remove certain keys, use `.omit` .

```ts
const NoIDRecipe = Recipe.omit({ id: true });

type NoIDRecipe = z.infer<typeof NoIDRecipe>;
// => { name: string, ingredients: string[] }
```

### `.partial`

Inspired by the built-in TypeScript utility type [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype), the `.partial` method makes all properties optional.

Starting from this object:

```ts
const user = z.object({
  email: z.string(),
  username: z.string(),
});
// { email: string; username: string }
```

We can create a partial version:

```ts
const partialUser = user.partial();
// { email?: string | undefined; username?: string | undefined }
```

You can also specify which properties to make optional:

```ts
const optionalEmail = user.partial({
  email: true,
});
/*
{
  email?: string | undefined;
  username: string
}
*/
```

### `.deepPartial`

The `.partial` method is shallow — it only applies one level deep. There is also a "deep" version:

```ts
const user = z.object({
  username: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  strings: z.array(z.object({ value: z.string() })),
});

const deepPartialUser = user.deepPartial();

/*
{
  username?: string | undefined,
  location?: {
    latitude?: number | undefined;
    longitude?: number | undefined;
  } | undefined,
  strings?: { value?: string}[]
}
*/
```

> Important limitation: deep partials only work as expected in hierarchies of objects, arrays, and tuples.

### `.required`

Contrary to the `.partial` method, the `.required` method makes all properties required.

Starting from this object:

```ts
const user = z
  .object({
    email: z.string(),
    username: z.string(),
  })
  .partial();
// { email?: string | undefined; username?: string | undefined }
```

We can create a required version:

```ts
const requiredUser = user.required();
// { email: string; username: string }
```

You can also specify which properties to make required:

```ts
const requiredEmail = user.required({
  email: true,
});
/*
{
  email: string;
  username?: string | undefined;
}
*/
```

### `.passthrough`

By default Zod object schemas strip out unrecognized keys during parsing.

```ts
const person = z.object({
  name: z.string(),
});

person.parse({
  name: "bob dylan",
  extraKey: 61,
});
// => { name: "bob dylan" }
// extraKey has been stripped
```

Instead, if you want to pass through unknown keys, use `.passthrough()` .

```ts
person.passthrough().parse({
  name: "bob dylan",
  extraKey: 61,
});
// => { name: "bob dylan", extraKey: 61 }
```

### `.strict`

By default Zod object schemas strip out unrecognized keys during parsing. You can _disallow_ unknown keys with `.strict()` . If there are any unknown keys in the input, Zod will throw an error.

```ts
const person = z
  .object({
    name: z.string(),
  })
  .strict();

person.parse({
  name: "bob dylan",
  extraKey: 61,
});
// => throws ZodError
```

### `.strip`

You can use the `.strip` method to reset an object schema to the default behavior (stripping unrecognized keys).

### `.catchall`

You can pass a "catchall" schema into an object schema. All unknown keys will be validated against it.

```ts
const person = z
  .object({
    name: z.string(),
  })
  .catchall(z.number());

person.parse({
  name: "bob dylan",
  validExtraKey: 61, // works fine
});

person.parse({
  name: "bob dylan",
  validExtraKey: false, // fails
});
// => throws ZodError
```

Using `.catchall()` obviates `.passthrough()` , `.strip()` , or `.strict()`. All keys are now considered "known".

## Arrays

```ts
const stringArray = z.array(z.string());

// equivalent
const stringArray = z.string().array();
```

Be careful with the `.array()` method. It returns a new `ZodArray` instance. This means the _order_ in which you call methods matters. For instance:

```ts
z.string().optional().array(); // (string | undefined)[]
z.string().array().optional(); // string[] | undefined
```

### `.element`

Use `.element` to access the schema for an element of the array.

```ts
stringArray.element; // => string schema
```

### `.nonempty`

If you want to ensure that an array contains at least one element, use `.nonempty()`.

```ts
const nonEmptyStrings = z.string().array().nonempty();
// the inferred type is now
// [string, ...string[]]

nonEmptyStrings.parse([]); // throws: "Array cannot be empty"
nonEmptyStrings.parse(["Ariana Grande"]); // passes
```

You can optionally specify a custom error message:

```ts
// optional custom error message
const nonEmptyStrings = z.string().array().nonempty({
  message: "Can't be empty!",
});
```

### `.min/.max/.length`

```ts
z.string().array().min(5); // must contain 5 or more items
z.string().array().max(5); // must contain 5 or fewer items
z.string().array().length(5); // must contain 5 items exactly
```

Unlike `.nonempty()` these methods do not change the inferred type.

## Tuples

Unlike arrays, tuples have a fixed number of elements and each element can have a different type.

```ts
const athleteSchema = z.tuple([
  z.string(), // name
  z.number(), // jersey number
  z.object({
    pointsScored: z.number(),
  }), // statistics
]);

type Athlete = z.infer<typeof athleteSchema>;
// type Athlete = [string, number, { pointsScored: number }]
```

A variadic ("rest") argument can be added with the `.rest` method.

```ts
const variadicTuple = z.tuple([z.string()]).rest(z.number());
const result = variadicTuple.parse(["hello", 1, 2, 3]);
// => [string, ...number[]];
```

## Unions

Zod includes a built-in `z.union` method for composing "OR" types.

```ts
const stringOrNumber = z.union([z.string(), z.number()]);

stringOrNumber.parse("foo"); // passes
stringOrNumber.parse(14); // passes
```

Zod will test the input against each of the "options" in order and return the first value that validates successfully.

For convenience, you can also use the [`.or` method](#or):

```ts
const stringOrNumber = z.string().or(z.number());
```

**Optional string validation:**

To validate an optional form input, you can union the desired string validation with an empty string [literal](#literals).

This example validates an input that is optional but needs to contain a [valid URL](#strings):

```ts
const optionalUrl = z.union([z.string().url().nullish(), z.literal("")]);

console.log(optionalUrl.safeParse(undefined).success); // true
console.log(optionalUrl.safeParse(null).success); // true
console.log(optionalUrl.safeParse("").success); // true
console.log(optionalUrl.safeParse("https://zod.dev").success); // true
console.log(optionalUrl.safeParse("not a valid url").success); // false
```

## Discriminated unions

A discriminated union is a union of object schemas that all share a particular key.

```ts
type MyUnion =
  | { status: "success"; data: string }
  | { status: "failed"; error: Error };
```

Such unions can be represented with the `z.discriminatedUnion` method. This enables faster evaluation, because Zod can check the _discriminator key_ (`status` in the example above) to determine which schema should be used to parse the input. This makes parsing more efficient and lets Zod report friendlier errors.

With the basic union method, the input is tested against each of the provided "options", and in the case of invalidity, issues for all the "options" are shown in the zod error. On the other hand, the discriminated union allows for selecting just one of the "options", testing against it, and showing only the issues related to this "option".

```ts
const myUnion = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.string() }),
  z.object({ status: z.literal("failed"), error: z.instanceof(Error) }),
]);

myUnion.parse({ status: "success", data: "yippie ki yay" });
```

You can extract a reference to the array of schemas with the `.options` property.

```ts
myUnion.options; // [ZodObject<...>, ZodObject<...>]
```

To merge two or more discriminated unions, use `.options` with destructuring.

```ts
const A = z.discriminatedUnion("status", [
  /* options */
]);
const B = z.discriminatedUnion("status", [
  /* options */
]);

const AB = z.discriminatedUnion("status", [...A.options, ...B.options]);
```

## Records

Record schemas are used to validate types such as `Record<string, number>`. This is particularly useful for storing or caching items by ID.

<!-- If you want to validate the _values_ of an object against some schema but don't care about the keys, use `z.record(valueType)`:

```ts
const NumberCache = z.record(z.number());

type NumberCache = z.infer<typeof NumberCache>;
// => { [k: string]: number }
``` -->

```ts
const User = z.object({ name: z.string() });

const UserStore = z.record(z.string(), User);
type UserStore = z.infer<typeof UserStore>;
// => Record<string, { name: string }>
```

The schema and inferred type can be used like so:

```ts
const userStore: UserStore = {};

userStore["77d2586b-9e8e-4ecf-8b21-ea7e0530eadd"] = {
  name: "Carlotta",
}; // passes

userStore["77d2586b-9e8e-4ecf-8b21-ea7e0530eadd"] = {
  whatever: "Ice cream sundae",
}; // TypeError
```

**A note on numerical keys**

While `z.record(keyType, valueType)` is able to accept numerical key types and TypeScript's built-in Record type is `Record<KeyType, ValueType>`, it's hard to represent the TypeScript type `Record<number, any>` in Zod.

As it turns out, TypeScript's behavior surrounding `[k: number]` is a little unintuitive:

```ts
const testMap: { [k: number]: string } = {
  1: "one",
};

for (const key in testMap) {
  console.log(`${key}: ${typeof key}`);
}
// prints: `1: string`
```

As you can see, JavaScript automatically casts all object keys to strings under the hood. Since Zod is trying to bridge the gap between static and runtime types, it doesn't make sense to provide a way of creating a record schema with numerical keys, since there's no such thing as a numerical key in runtime JavaScript.

## Maps

```ts
const stringNumberMap = z.map(z.string(), z.number());

type StringNumberMap = z.infer<typeof stringNumberMap>;
// type StringNumberMap = Map<string, number>
```

## Sets

```ts
const numberSet = z.set(z.number());
type NumberSet = z.infer<typeof numberSet>;
// type NumberSet = Set<number>
```

Set schemas can be further constrained with the following utility methods.

```ts
z.set(z.string()).nonempty(); // must contain at least one item
z.set(z.string()).min(5); // must contain 5 or more items
z.set(z.string()).max(5); // must contain 5 or fewer items
z.set(z.string()).size(5); // must contain 5 items exactly
```

## Intersections

Intersections are useful for creating "logical AND" types. This is useful for intersecting two object types.

```ts
const Person = z.object({
  name: z.string(),
});

const Employee = z.object({
  role: z.string(),
});

const EmployedPerson = z.intersection(Person, Employee);

// equivalent to:
const EmployedPerson = Person.and(Employee);
```

Though in many cases, it is recommended to use `A.merge(B)` to merge two objects. The `.merge` method returns a new `ZodObject` instance, whereas `A.and(B)` returns a less useful `ZodIntersection` instance that lacks common object methods like `pick` and `omit`.

```ts
const a = z.union([z.number(), z.string()]);
const b = z.union([z.number(), z.boolean()]);
const c = z.intersection(a, b);

type c = z.infer<typeof c>; // => number
```

<!-- Intersections in Zod are not smart. Whatever data you pass into `.parse()` gets passed into the two intersected schemas. Because Zod object schemas don't allow any unknown keys by default, there are some unintuitive behavior surrounding intersections of object schemas. -->

<!--

``` ts
const A = z.object({
  a: z.string(),
});

const B = z.object({
  b: z.string(),
});

const AB = z.intersection(A, B);

type Teacher = z.infer<typeof Teacher>;
// { id:string; name:string };
```  -->

## Recursive types

You can define a recursive schema in Zod, but because of a limitation of TypeScript, their type can't be statically inferred. Instead you'll need to define the type definition manually, and provide it to Zod as a "type hint".

```ts
const baseCategorySchema = z.object({
  name: z.string(),
});

type Category = z.infer<typeof baseCategorySchema> & {
  subcategories: Category[];
};

const categorySchema: z.ZodType<Category> = baseCategorySchema.extend({
  subcategories: z.lazy(() => categorySchema.array()),
});

categorySchema.parse({
  name: "People",
  subcategories: [
    {
      name: "Politicians",
      subcategories: [
        {
          name: "Presidents",
          subcategories: [],
        },
      ],
    },
  ],
}); // passes
```

Thanks to [crasite](https://github.com/crasite) for this example.

### ZodType with ZodEffects

When using `z.ZodType` with `z.ZodEffects` (
[`.refine`](https://github.com/colinhacks/zod#refine),
[`.transform`](https://github.com/colinhacks/zod#transform),
[`preprocess`](https://github.com/colinhacks/zod#preprocess),
etc...
), you will need to define the input and output types of the schema. `z.ZodType<Output, z.ZodTypeDef, Input>`

```ts
const isValidId = (id: string): id is `${string}/${string}` =>
  id.split("/").length === 2;

const baseSchema = z.object({
  id: z.string().refine(isValidId),
});

type Input = z.input<typeof baseSchema> & {
  children: Input[];
};

type Output = z.output<typeof baseSchema> & {
  children: Output[];
};

const schema: z.ZodType<Output, z.ZodTypeDef, Input> = baseSchema.extend({
  children: z.lazy(() => schema.array()),
});
```

Thanks to [marcus13371337](https://github.com/marcus13371337) and [JoelBeeldi](https://github.com/JoelBeeldi) for this example.

### JSON type

If you want to validate any JSON value, you can use the snippet below.

```ts
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

jsonSchema.parse(data);
```

Thanks to [ggoodman](https://github.com/ggoodman) for suggesting this.

### Cyclical objects

Despite supporting recursive schemas, passing cyclical data into Zod will cause an infinite loop.

## Promises

```ts
const numberPromise = z.promise(z.number());
```

"Parsing" works a little differently with promise schemas. Validation happens in two parts:

1. Zod synchronously checks that the input is an instance of Promise (i.e. an object with `.then` and `.catch` methods.).
2. Zod uses `.then` to attach an additional validation step onto the existing Promise. You'll have to use `.catch` on the returned Promise to handle validation failures.

```ts
numberPromise.parse("tuna");
// ZodError: Non-Promise type: string

numberPromise.parse(Promise.resolve("tuna"));
// => Promise<number>

const test = async () => {
  await numberPromise.parse(Promise.resolve("tuna"));
  // ZodError: Non-number type: string

  await numberPromise.parse(Promise.resolve(3.14));
  // => 3.14
};
```

<!-- #### Non-native promise implementations

When "parsing" a promise, Zod checks that the passed value is an object with `.then` and `.catch` methods — that's it. So you should be able to pass non-native Promises (Bluebird, etc) into `z.promise(...).parse` with no trouble. One gotcha: the return type of the parse function will be a _native_ `Promise` , so if you have downstream logic that uses non-standard Promise methods, this won't work. -->

## Instanceof

You can use `z.instanceof` to check that the input is an instance of a class. This is useful to validate inputs against classes that are exported from third-party libraries.

```ts
class Test {
  name: string;
}

const TestSchema = z.instanceof(Test);

const blob: any = "whatever";
TestSchema.parse(new Test()); // passes
TestSchema.parse(blob); // throws
```

## Functions

Zod also lets you define "function schemas". This makes it easy to validate the inputs and outputs of a function without intermixing your validation code and "business logic".

You can create a function schema with `z.function(args, returnType)` .

```ts
const myFunction = z.function();

type myFunction = z.infer<typeof myFunction>;
// => ()=>unknown
```

Define inputs and outputs.

```ts
const myFunction = z
  .function()
  .args(z.string(), z.number()) // accepts an arbitrary number of arguments
  .returns(z.boolean());

type myFunction = z.infer<typeof myFunction>;
// => (arg0: string, arg1: number)=>boolean
```

<!--

``` ts
const args = z.tuple([z.string()]);

const returnType = z.number();

const myFunction = z.function(args, returnType);
type myFunction = z.infer<typeof myFunction>;
// => (arg0: string)=>number
``` -->

Function schemas have an `.implement()` method which accepts a function and returns a new function that automatically validates its inputs and outputs.

```ts
const trimmedLength = z
  .function()
  .args(z.string()) // accepts an arbitrary number of arguments
  .returns(z.number())
  .implement((x) => {
    // TypeScript knows x is a string!
    return x.trim().length;
  });

trimmedLength("sandwich"); // => 8
trimmedLength(" asdf "); // => 4
```

If you only care about validating inputs, just don't call the `.returns()` method. The output type will be inferred from the implementation.

> You can use the special `z.void()` option if your function doesn't return anything. This will let Zod properly infer the type of void-returning functions. (Void-returning functions actually return undefined.)

```ts
const myFunction = z
  .function()
  .args(z.string())
  .implement((arg) => {
    return [arg.length];
  });

myFunction; // (arg: string)=>number[]
```

Extract the input and output schemas from a function schema.

```ts
myFunction.parameters();
// => ZodTuple<[ZodString, ZodNumber]>

myFunction.returnType();
// => ZodBoolean
```

<!-- `z.function()` accepts two arguments:

* `args: ZodTuple` The first argument is a tuple (created with `z.tuple([...])` and defines the schema of the arguments to your function. If the function doesn't accept arguments, you can pass an empty tuple (`z.tuple([])`).
* `returnType: any Zod schema` The second argument is the function's return type. This can be any Zod schema. -->

## Preprocess

> Zod now supports primitive coercion without the need for `.preprocess()`. See the [coercion docs](#coercion-for-primitives) for more information.

Typically Zod operates under a "parse then transform" paradigm. Zod validates the input first, then passes it through a chain of transformation functions. (For more information about transforms, read the [.transform docs](#transform).)

But sometimes you want to apply some transform to the input _before_ parsing happens. A common use case: type coercion. Zod enables this with the `z.preprocess()`.

```ts
const castToString = z.preprocess((val) => String(val), z.string());
```

This returns a `ZodEffects` instance. `ZodEffects` is a wrapper class that contains all logic pertaining to preprocessing, refinements, and transforms.

## Custom schemas

You can create a Zod schema for any TypeScript type by using `z.custom()`. This is useful for creating schemas for types that are not supported by Zod out of the box, such as template string literals.

```ts
const px = z.custom<`${number}px`>((val) => {
  return typeof val === "string" ? /^\d+px$/.test(val) : false;
});

type px = z.infer<typeof px>; // `${number}px`

px.parse("42px"); // "42px"
px.parse("42vw"); // throws;
```

If you don't provide a validation function, Zod will allow any value. This can be dangerous!

```ts
z.custom<{ arg: string }>(); // performs no validation
```

You can customize the error message and other options by passing a second argument. This parameter works the same way as the params parameter of [`.refine`](#refine).

```ts
z.custom<...>((val) => ..., "custom error message");
```

## Schema methods

All Zod schemas contain certain methods.

### `.parse`

`.parse(data: unknown): T`

Given any Zod schema, you can call its `.parse` method to check `data` is valid. If it is, a value is returned with full type information! Otherwise, an error is thrown.

> IMPORTANT: The value returned by `.parse` is a _deep clone_ of the variable you passed in.

```ts
const stringSchema = z.string();

stringSchema.parse("fish"); // => returns "fish"
stringSchema.parse(12); // throws error
```

### `.parseAsync`

`.parseAsync(data:unknown): Promise<T>`

If you use asynchronous [refinements](#refine) or [transforms](#transform) (more on those later), you'll need to use `.parseAsync`.

```ts
const stringSchema = z.string().refine(async (val) => val.length <= 8);

await stringSchema.parseAsync("hello"); // => returns "hello"
await stringSchema.parseAsync("hello world"); // => throws error
```

### `.safeParse`

`.safeParse(data:unknown): { success: true; data: T; } | { success: false; error: ZodError; }`

If you don't want Zod to throw errors when validation fails, use `.safeParse`. This method returns an object containing either the successfully parsed data or a ZodError instance containing detailed information about the validation problems.

```ts
stringSchema.safeParse(12);
// => { success: false; error: ZodError }

stringSchema.safeParse("billie");
// => { success: true; data: 'billie' }
```

The result is a _discriminated union_, so you can handle errors very conveniently:

```ts
const result = stringSchema.safeParse("billie");
if (!result.success) {
  // handle error then return
  result.error;
} else {
  // do something
  result.data;
}
```

### `.safeParseAsync`

> Alias: `.spa`

An asynchronous version of `safeParse`.

```ts
await stringSchema.safeParseAsync("billie");
```

For convenience, this has been aliased to `.spa`:

```ts
await stringSchema.spa("billie");
```

### `.refine`

`.refine(validator: (data:T)=>any, params?: RefineParams)`

Zod lets you provide custom validation logic via _refinements_. (For advanced features like creating multiple issues and customizing error codes, see [`.superRefine`](#superrefine).)

Zod was designed to mirror TypeScript as closely as possible. But there are many so-called "refinement types" you may wish to check for that can't be represented in TypeScript's type system. For instance: checking that a number is an integer or that a string is a valid email address.

For example, you can define a custom validation check on _any_ Zod schema with `.refine` :

```ts
const myString = z.string().refine((val) => val.length <= 255, {
  message: "String can't be more than 255 characters",
});
```

> ⚠️ Refinement functions should not throw. Instead they should return a falsy value to signal failure.

#### Arguments

As you can see, `.refine` takes two arguments.

1. The first is the validation function. This function takes one input (of type `T` — the inferred type of the schema) and returns `any`. Any truthy value will pass validation. (Prior to zod@1.6.2 the validation function had to return a boolean.)
2. The second argument accepts some options. You can use this to customize certain error-handling behavior:

```ts
type RefineParams = {
  // override error message
  message?: string;

  // appended to error path
  path?: (string | number)[];

  // params object you can use to customize message
  // in error map
  params?: object;
};
```

For advanced cases, the second argument can also be a function that returns `RefineParams`.

```ts
const longString = z.string().refine(
  (val) => val.length > 10,
  (val) => ({ message: `${val} is not more than 10 characters` })
);
```

#### Customize error path

```ts
const passwordForm = z
  .object({
    password: z.string(),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"], // path of error
  });

passwordForm.parse({ password: "asdf", confirm: "qwer" });
```

Because you provided a `path` parameter, the resulting error will be:

```ts
ZodError {
  issues: [{
    "code": "custom",
    "path": [ "confirm" ],
    "message": "Passwords don't match"
  }]
}
```

#### Asynchronous refinements

Refinements can also be async:

```ts
const userId = z.string().refine(async (id) => {
  // verify that ID exists in database
  return true;
});
```

> ⚠️ If you use async refinements, you must use the `.parseAsync` method to parse data! Otherwise Zod will throw an error.

#### Relationship to transforms

Transforms and refinements can be interleaved:

```ts
z.string()
  .transform((val) => val.length)
  .refine((val) => val > 25);
```

<!-- Note that the `path` is set to `["confirm"]` , so you can easily display this error underneath the "Confirm password" textbox.

```ts
const allForms = z.object({ passwordForm }).parse({
  passwordForm: {
    password: "asdf",
    confirm: "qwer",
  },
});
```

would result in

```

ZodError {
  issues: [{
    "code": "custom",
    "path": [ "passwordForm", "confirm" ],
    "message": "Passwords don't match"
  }]
}
``` -->

### `.superRefine`

The `.refine` method is actually syntactic sugar atop a more versatile (and verbose) method called `superRefine`. Here's an example:

```ts
const Strings = z.array(z.string()).superRefine((val, ctx) => {
  if (val.length > 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: 3,
      type: "array",
      inclusive: true,
      message: "Too many items 😡",
    });
  }

  if (val.length !== new Set(val).size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No duplicates allowed.`,
    });
  }
});
```

You can add as many issues as you like. If `ctx.addIssue` is _not_ called during the execution of the function, validation passes.

Normally refinements always create issues with a `ZodIssueCode.custom` error code, but with `superRefine` it's possible to throw issues of any `ZodIssueCode`. Each issue code is described in detail in the Error Handling guide: [ERROR_HANDLING.md](ERROR_HANDLING.md).

#### Abort early

By default, parsing will continue even after a refinement check fails. For instance, if you chain together multiple refinements, they will all be executed. However, it may be desirable to _abort early_ to prevent later refinements from being executed. To achieve this, pass the `fatal` flag to `ctx.addIssue` and return `z.NEVER`.

```ts
const schema = z.number().superRefine((val, ctx) => {
  if (val < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "should be >= 10",
      fatal: true,
    });

    return z.NEVER;
  }

  if (val !== 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "should be twelve",
    });
  }
});
```

#### Type refinements

If you provide a [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) to `.refine()` or `.superRefine()`, the resulting type will be narrowed down to your predicate's type. This is useful if you are mixing multiple chained refinements and transformations:

```ts
const schema = z
  .object({
    first: z.string(),
    second: z.number(),
  })
  .nullable()
  .superRefine((arg, ctx): arg is { first: string; second: number } => {
    if (!arg) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom, // customize your issue
        message: "object should exist",
      });
    }

    return z.NEVER; // The return value is not used, but we need to return something to satisfy the typing
  })
  // here, TS knows that arg is not null
  .refine((arg) => arg.first === "bob", "`first` is not `bob`!");
```

> ⚠️ You **must** use `ctx.addIssue()` instead of returning a boolean value to indicate whether the validation passes. If `ctx.addIssue` is _not_ called during the execution of the function, validation passes.

### `.transform`

To transform data after parsing, use the `transform` method.

```ts
const stringToNumber = z.string().transform((val) => val.length);

stringToNumber.parse("string"); // => 6
```

#### Chaining order

Note that `stringToNumber` above is an instance of the `ZodEffects` subclass. It is NOT an instance of `ZodString`. If you want to use the built-in methods of `ZodString` (e.g. `.email()`) you must apply those methods _before_ any transforms.

```ts
const emailToDomain = z
  .string()
  .email()
  .transform((val) => val.split("@")[1]);

emailToDomain.parse("colinhacks@example.com"); // => example.com
```

#### Validating during transform

The `.transform` method can simultaneously validate and transform the value. This is often simpler and less duplicative than chaining `transform` and `refine`.

As with `.superRefine`, the transform function receives a `ctx` object with an `addIssue` method that can be used to register validation issues.

```ts
const numberInString = z.string().transform((val, ctx) => {
  const parsed = parseInt(val);
  if (isNaN(parsed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Not a number",
    });

    // This is a special symbol you can use to
    // return early from the transform function.
    // It has type `never` so it does not affect the
    // inferred return type.
    return z.NEVER;
  }
  return parsed;
});
```

#### Relationship to refinements

Transforms and refinements can be interleaved. These will be executed in the order they are declared.

```ts
const nameToGreeting = z
  .string()
  .transform((val) => val.toUpperCase())
  .refine((val) => val.length > 15)
  .transform((val) => `Hello ${val}`)
  .refine((val) => val.indexOf("!") === -1);
```

#### Async transforms

Transforms can also be async.

```ts
const IdToUser = z
  .string()
  .uuid()
  .transform(async (id) => {
    return await getUserById(id);
  });
```

> ⚠️ If your schema contains asynchronous transforms, you must use .parseAsync() or .safeParseAsync() to parse data. Otherwise Zod will throw an error.

### `.default`

You can use transforms to implement the concept of "default values" in Zod.

```ts
const stringWithDefault = z.string().default("tuna");

stringWithDefault.parse(undefined); // => "tuna"
```

Optionally, you can pass a function into `.default` that will be re-executed whenever a default value needs to be generated:

```ts
const numberWithRandomDefault = z.number().default(Math.random);

numberWithRandomDefault.parse(undefined); // => 0.4413456736055323
numberWithRandomDefault.parse(undefined); // => 0.1871840107401901
numberWithRandomDefault.parse(undefined); // => 0.7223408162401552
```

Conceptually, this is how Zod processes default values:

1. If the input is `undefined`, the default value is returned
2. Otherwise, the data is parsed using the base schema

### `.describe`

Use `.describe()` to add a `description` property to the resulting schema.

```ts
const documentedString = z
  .string()
  .describe("A useful bit of text, if you know what to do with it.");
documentedString.description; // A useful bit of text…
```

This can be useful for documenting a field, for example in a JSON Schema using a library like [`zod-to-json-schema`](https://github.com/StefanTerdell/zod-to-json-schema)).

### `.catch`

Use `.catch()` to provide a "catch value" to be returned in the event of a parsing error.

```ts
const numberWithCatch = z.number().catch(42);

numberWithCatch.parse(5); // => 5
numberWithCatch.parse("tuna"); // => 42
```

Optionally, you can pass a function into `.catch` that will be re-executed whenever a default value needs to be generated. A `ctx` object containing the caught error will be passed into this function.

```ts
const numberWithRandomCatch = z.number().catch((ctx) => {
  ctx.error; // the caught ZodError
  return Math.random();
});

numberWithRandomCatch.parse("sup"); // => 0.4413456736055323
numberWithRandomCatch.parse("sup"); // => 0.1871840107401901
numberWithRandomCatch.parse("sup"); // => 0.7223408162401552
```

Conceptually, this is how Zod processes "catch values":

1. The data is parsed using the base schema
2. If the parsing fails, the "catch value" is returned

### `.optional`

A convenience method that returns an optional version of a schema.

```ts
const optionalString = z.string().optional(); // string | undefined

// equivalent to
z.optional(z.string());
```

### `.nullable`

A convenience method that returns a nullable version of a schema.

```ts
const nullableString = z.string().nullable(); // string | null

// equivalent to
z.nullable(z.string());
```

### `.nullish`

A convenience method that returns a "nullish" version of a schema. Nullish schemas will accept both `undefined` and `null`. Read more about the concept of "nullish" [in the TypeScript 3.7 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing).

```ts
const nullishString = z.string().nullish(); // string | null | undefined

// equivalent to
z.string().nullable().optional();
```

### `.array`

A convenience method that returns an array schema for the given type:

```ts
const stringArray = z.string().array(); // string[]

// equivalent to
z.array(z.string());
```

### `.promise`

A convenience method for promise types:

```ts
const stringPromise = z.string().promise(); // Promise<string>

// equivalent to
z.promise(z.string());
```

### `.or`

A convenience method for [union types](#unions).

```ts
const stringOrNumber = z.string().or(z.number()); // string | number

// equivalent to
z.union([z.string(), z.number()]);
```

### `.and`

A convenience method for creating intersection types.

```ts
const nameAndAge = z
  .object({ name: z.string() })
  .and(z.object({ age: z.number() })); // { name: string } & { age: number }

// equivalent to
z.intersection(z.object({ name: z.string() }), z.object({ age: z.number() }));
```

### `.brand`

`.brand<T>() => ZodBranded<this, B>`

TypeScript's type system is structural, which means that any two types that are structurally equivalent are considered the same.

```ts
type Cat = { name: string };
type Dog = { name: string };

const petCat = (cat: Cat) => {};
const fido: Dog = { name: "fido" };
petCat(fido); // works fine
```

In some cases, its can be desirable to simulate _nominal typing_ inside TypeScript. For instance, you may wish to write a function that only accepts an input that has been validated by Zod. This can be achieved with _branded types_ (AKA _opaque types_).

```ts
const Cat = z.object({ name: z.string() }).brand<"Cat">();
type Cat = z.infer<typeof Cat>;

const petCat = (cat: Cat) => {};

// this works
const simba = Cat.parse({ name: "simba" });
petCat(simba);

// this doesn't
petCat({ name: "fido" });
```

Under the hood, this works by attaching a "brand" to the inferred type using an intersection type. This way, plain/unbranded data structures are no longer assignable to the inferred type of the schema.

```ts
const Cat = z.object({ name: z.string() }).brand<"Cat">();
type Cat = z.infer<typeof Cat>;
// {name: string} & {[symbol]: "Cat"}
```

Note that branded types do not affect the runtime result of `.parse`. It is a static-only construct.

### `.readonly`

`.readonly() => ZodReadonly<this>`

This method returns a `ZodReadonly` schema instance that parses the input using the base schema, then calls `Object.freeze()` on the result. The inferred type is also marked as `readonly`.

```ts
const schema = z.object({ name: string }).readonly();
type schema = z.infer<typeof schema>;
// Readonly<{name: string}>

const result = schema.parse({ name: "fido" });
result.name = "simba"; // error
```

The inferred type uses TypeScript's built-in readonly types when relevant.

```ts
z.array(z.string()).readonly();
// readonly string[]

z.tuple([z.string(), z.number()]).readonly();
// readonly [string, number]

z.map(z.string(), z.date()).readonly();
// ReadonlyMap<string, Date>

z.set(z.string()).readonly();
// ReadonlySet<Promise<string>>
```

### `.pipe`

Schemas can be chained into validation "pipelines". It's useful for easily validating the result after a `.transform()`:

```ts
z.string()
  .transform((val) => val.length)
  .pipe(z.number().min(5));
```

The `.pipe()` method returns a `ZodPipeline` instance.

#### You can use `.pipe()` to fix common issues with `z.coerce`.

You can constrain the input to types that work well with your chosen coercion. Then use `.pipe()` to apply the coercion.

without constrained input:

```ts
const toDate = z.coerce.date();

// works intuitively
console.log(toDate.safeParse("2023-01-01").success); // true

// might not be what you want
console.log(toDate.safeParse(null).success); // true
```

with constrained input:

```ts
const datelike = z.union([z.number(), z.string(), z.date()]);
const datelikeToDate = datelike.pipe(z.coerce.date());

// still works intuitively
console.log(datelikeToDate.safeParse("2023-01-01").success); // true

// more likely what you want
console.log(datelikeToDate.safeParse(null).success); // false
```

You can also use this technique to avoid coercions that throw uncaught errors.

without constrained input:

```ts
const toBigInt = z.coerce.bigint();

// works intuitively
console.log(toBigInt.safeParse("42")); // true

// probably not what you want
console.log(toBigInt.safeParse(null)); // throws uncaught error
```

with constrained input:

```ts
const toNumber = z.number().or(z.string()).pipe(z.coerce.number());
const toBigInt = z.bigint().or(toNumber).pipe(z.coerce.bigint());

// still works intuitively
console.log(toBigInt.safeParse("42").success); // true

// error handled by zod, more likely what you want
console.log(toBigInt.safeParse(null).success); // false
```

## Guides and concepts

### Type inference

You can extract the TypeScript type of any schema with `z.infer<typeof mySchema>` .

```ts
const A = z.string();
type A = z.infer<typeof A>; // string

const u: A = 12; // TypeError
const u: A = "asdf"; // compiles
```

**What about transforms?**

In reality each Zod schema internally tracks **two** types: an input and an output. For most schemas (e.g. `z.string()`) these two are the same. But once you add transforms into the mix, these two values can diverge. For instance `z.string().transform(val => val.length)` has an input of `string` and an output of `number`.

You can separately extract the input and output types like so:

```ts
const stringToNumber = z.string().transform((val) => val.length);

// ⚠️ Important: z.infer returns the OUTPUT type!
type input = z.input<typeof stringToNumber>; // string
type output = z.output<typeof stringToNumber>; // number

// equivalent to z.output!
type inferred = z.infer<typeof stringToNumber>; // number
```

### Writing generic functions

With TypeScript generics, you can write reusable functions that accept Zod schemas as parameters. This enables you to create custom validation logic, schema transformations, and more, while maintaining type safety and inference.

When attempting to write a function that accepts a Zod schema as an input, it's tempting to try something like this:

```ts
function inferSchema<T>(schema: z.ZodType<T>) {
  return schema;
}
```

This approach is incorrect, and limits TypeScript's ability to properly infer the argument. No matter what you pass in, the type of `schema` will be an instance of `ZodType`.

```ts
inferSchema(z.string());
// => ZodType<string>
```

This approach loses type information, namely _which subclass_ the input actually is (in this case, `ZodString`). That means you can't call any string-specific methods like `.min()` on the result of `inferSchema`.

A better approach is to infer _the schema as a whole_ instead of merely its inferred type. You can do this with a utility type called `z.ZodTypeAny`.

```ts
function inferSchema<T extends z.ZodTypeAny>(schema: T) {
  return schema;
}

inferSchema(z.string());
// => ZodString
```

> `ZodTypeAny` is just a shorthand for `ZodType<any, any, any>`, a type that is broad enough to match any Zod schema.

The Result is now fully and properly typed, and the type system can infer the specific subclass of the schema.

#### Inferring the inferred type

If you follow the best practice of using `z.ZodTypeAny` as the generic parameter for your schema, you may encounter issues with the parsed data being typed as `any` instead of the inferred type of the schema.

```ts
function parseData<T extends z.ZodTypeAny>(data: unknown, schema: T) {
  return schema.parse(data);
}

parseData("sup", z.string());
// => any
```

Due to how TypeScript inference works, it is treating `schema` like a `ZodTypeAny` instead of the inferred type. You can fix this with a type cast using `z.infer`.

```ts
function parseData<T extends z.ZodTypeAny>(data: unknown, schema: T) {
  return schema.parse(data) as z.infer<T>;
  //                        ^^^^^^^^^^^^^^ <- add this
}

parseData("sup", z.string());
// => string
```

#### Constraining allowable inputs

The `ZodType` class has three generic parameters.

```ts
class ZodType<
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
> { ... }
```

By constraining these in your generic input, you can limit what schemas are allowable as inputs to your function:

```ts
function makeSchemaOptional<T extends z.ZodType<string>>(schema: T) {
  return schema.optional();
}

makeSchemaOptional(z.string());
// works fine

makeSchemaOptional(z.number());
// Error: 'ZodNumber' is not assignable to parameter of type 'ZodType<string, ZodTypeDef, string>'
```

### Error handling

Zod provides a subclass of Error called `ZodError`. ZodErrors contain an `issues` array containing detailed information about the validation problems.

```ts
const result = z
  .object({
    name: z.string(),
  })
  .safeParse({ name: 12 });

if (!result.success) {
  result.error.issues;
  /* [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": [ "name" ],
        "message": "Expected string, received number"
      }
  ] */
}
```

> For detailed information about the possible error codes and how to customize error messages, check out the dedicated error handling guide: [ERROR_HANDLING.md](ERROR_HANDLING.md)

Zod's error reporting emphasizes _completeness_ and _correctness_. If you are looking to present a useful error message to the end user, you should either override Zod's error messages using an error map (described in detail in the Error Handling guide) or use a third-party library like [`zod-validation-error`](https://github.com/causaly/zod-validation-error)

### Error formatting

You can use the `.format()` method to convert this error into a nested object.

```ts
const result = z
  .object({
    name: z.string(),
  })
  .safeParse({ name: 12 });

if (!result.success) {
  const formatted = result.error.format();
  /* {
    name: { _errors: [ 'Expected string, received number' ] }
  } */

  formatted.name?._errors;
  // => ["Expected string, received number"]
}
```

## Comparison

There are a handful of other widely-used validation libraries, but all of them have certain design limitations that make for a non-ideal developer experience.

<!-- The table below summarizes the feature differences. Below the table there are more involved discussions of certain alternatives, where necessary. -->

<!-- | Feature                                                                                                                | [Zod](https://github.com/colinhacks) | [Joi](https://github.com/hapijs/joi) | [Yup](https://github.com/jquense/yup) | [io-ts](https://github.com/gcanti/io-ts) | [Runtypes](https://github.com/pelotom/runtypes) | [ow](https://github.com/sindresorhus/ow) | [class-validator](https://github.com/typestack/class-validator) |
| ---------------------------------------------------------------------------------------------------------------------- | :-----------------------------: | :----------------------------------: | :-----------------------------------: | :--------------------------------------: | :---------------------------------------------: | :--------------------------------------: | :-------------------------------------------------------------: |
| <abbr title='Any ability to extract a TypeScript type from a validator instance counts.'>Type inference</abbr>         |               🟢                |                  🔴                  |                  🟢                   |                    🟢                    |                       🟢                        |                    🟢                    |                               🟢                                |
| <abbr title="Yup's inferred types are incorrect in certain cases, see discussion below.">Correct type inference</abbr> |               🟢                |                  🔴                  |                  🔴                   |                    🟢                    |                       🟢                        |                    🟢                    |                               🟢                                |

<abbr title="number, string, boolean, null, undefined">Primitive Types</abbr>
<abbr title="Includes any checks beyond 'Is this a string?', e.g. min/max length, isEmail, isURL, case checking, etc.">String Validation</abbr>
<abbr title="Includes any checks beyond 'Is this a number?', e.g. min/max, isPositive, integer vs float, etc.">Number Validation</abbr>
Dates

Primitive Literals
Object Literals
Tuple Literals
Objects
Arrays
Non-empty arrays
Unions
Optionals
Nullable
Enums
Enum Autocomplete
Intersections
Object Merging
Tuples
Recursive Types
Function Schemas

<abbr title="For instance, Yup allows custom error messages with the syntax yup.number().min(5, 'Number must be more than 5!')">Validation Messages</abbr>
Immutable instances
Type Guards
Validity Checking
Casting
Default Values
Rich Errors
Branded -->

<!-- - Missing object methods: (pick, omit, partial, deepPartial, merge, extend)

* Missing nonempty arrays with proper typing (`[T, ...T[]]`)
* Missing lazy/recursive types
* Missing promise schemas
* Missing function schemas
* Missing union & intersection schemas
* Missing support for parsing cyclical data (maybe)
* Missing error customization -->

### Joi

[https://github.com/hapijs/joi](https://github.com/hapijs/joi)

Doesn't support static type inference 😕

### Yup

[https://github.com/jquense/yup](https://github.com/jquense/yup)

Yup is a full-featured library that was implemented first in vanilla JS, and later rewritten in TypeScript.

- Supports casting and transforms
- All object fields are optional by default
<!-- - Missing nonempty arrays with proper typing (`[T, ...T[]]`) -->
- Missing promise schemas
- Missing function schemas
- Missing union & intersection schemas

<!-- ¹Yup has a strange interpretation of the word `required`. Instead of meaning "not undefined", Yup uses it to mean "not empty". So `yup.string().required()` will not accept an empty string, and `yup.array(yup.string()).required()` will not accept an empty array. Instead, Yup us Zod arrays there is a dedicated `.nonempty()` method to indicate this, or you can implement it with a custom refinement. -->

### io-ts

[https://github.com/gcanti/io-ts](https://github.com/gcanti/io-ts)

io-ts is an excellent library by gcanti. The API of io-ts heavily inspired the design of Zod.

In our experience, io-ts prioritizes functional programming purity over developer experience in many cases. This is a valid and admirable design goal, but it makes io-ts particularly hard to integrate into an existing codebase with a more procedural or object-oriented bias. For instance, consider how to define an object with optional properties in io-ts:

```ts
import * as t from "io-ts";

const A = t.type({
  foo: t.string,
});

const B = t.partial({
  bar: t.number,
});

const C = t.intersection([A, B]);

type C = t.TypeOf<typeof C>;
// returns { foo: string; bar?: number | undefined }
```

You must define the required and optional props in separate object validators, pass the optionals through `t.partial` (which marks all properties as optional), then combine them with `t.intersection` .

Consider the equivalent in Zod:

```ts
const C = z.object({
  foo: z.string(),
  bar: z.number().optional(),
});

type C = z.infer<typeof C>;
// returns { foo: string; bar?: number | undefined }
```

This more declarative API makes schema definitions vastly more concise.

`io-ts` also requires the use of gcanti's functional programming library `fp-ts` to parse results and handle errors. This is another fantastic resource for developers looking to keep their codebase strictly functional. But depending on `fp-ts` necessarily comes with a lot of intellectual overhead; a developer has to be familiar with functional programming concepts and the `fp-ts` nomenclature to use the library.

- Supports codecs with serialization & deserialization transforms
- Supports branded types
- Supports advanced functional programming, higher-kinded types, `fp-ts` compatibility
- Missing object methods: (pick, omit, partial, deepPartial, merge, extend)
- Missing nonempty arrays with proper typing (`[T, ...T[]]`)
- Missing promise schemas
- Missing function schemas

### Runtypes

[https://github.com/pelotom/runtypes](https://github.com/pelotom/runtypes)

Good type inference support.

- Supports "pattern matching": computed properties that distribute over unions
- Missing object methods: (deepPartial, merge)
- Missing nonempty arrays with proper typing (`[T, ...T[]]`)
- Missing promise schemas
- Missing error customization

### Ow

[https://github.com/sindresorhus/ow](https://github.com/sindresorhus/ow)

Ow is focused on function input validation. It's a library that makes it easy to express complicated assert statements, but it doesn't let you parse untyped data. They support a much wider variety of types; Zod has a nearly one-to-one mapping with TypeScript's type system, whereas ow lets you validate several highly-specific types out of the box (e.g. `int32Array` , see full list in their README).

If you want to validate function inputs, use function schemas in Zod! It's a much simpler approach that lets you reuse a function type declaration without repeating yourself (namely, copy-pasting a bunch of ow assertions at the beginning of every function). Also Zod lets you validate your return types as well, so you can be sure there won't be any unexpected data passed downstream.

## Changelog

View the changelog at [CHANGELOG.md](CHANGELOG.md)
