# Introduction

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

## Sponsors

Sponsorship at any level is appreciated and encouraged. For individual developers, consider the [Cup of Coffee tier](https://github.com/sponsors/colinhacks). If you built a paid product using Zod, consider one of the [podium tiers](https://github.com/sponsors/colinhacks).

### Gold

<table>
  <tr>
    <td align="center">
      <a href="https://speakeasyapi.dev/">
        <img src="https://avatars.githubusercontent.com/u/91446104?s=200&v=4" width="200px;" alt="Speakeasy API" />
      </a>
      <br />
      <b>Speakeasy</b>
      <br />
      <a href="https://speakeasyapi.dev/">speakeasyapi.dev</a>
      <br />
      <p width="200px">SDKs, Terraform, Docs.<br />Your API made enterprise-ready.</p>
    </td>
    <td align="center">
      <a href="https://glow.app/">
        <img src="https://i.imgur.com/R0R43S2.jpg" width="200px;" alt="Glow Wallet" />
      </a>
      <br />
      <b>Glow Wallet</b>
      <br />
      <a href="https://glow.app/">glow.app</a>
      <br />
      <p width="200px">Your new favorite
        <br />
        Solana wallet.
      </p>
    </td>
  </tr>
    <tr>
    <td align="center">
      <a href="https://deletype.com/">
        <img src="https://avatars0.githubusercontent.com/u/15068039?s=200&v=4" width="200px;" alt="Deletype logo" />
      </a>
      <br />
      <b>Deletype</b>
      <br />
      <a href="https://deletype.com">deletype.com</a>
    </td>
    <td align="center">
      <a href="https://trigger.dev/">
        <img src="https://avatars.githubusercontent.com/u/95297378?s=200&v=4" width="200px;" alt="Trigger.dev logo" />
      </a>
      <br />
      <b>Trigger.dev</b>
      <br />
      <a href="https://trigger.dev">trigger.dev</a>
      <br />
      <p>Effortless automation for developers.</p>
    </td>
  </tr>
    <tr>
    <td align="center">
      <a href="https://transloadit.com/?utm_source=zod&utm_medium=referral&utm_campaign=sponsorship&utm_content=github">
        <img src="https://avatars.githubusercontent.com/u/125754?s=200&v=4" width="200px;" alt="Transloadit logo" />
      </a>
      <br />
      <b>Transloadit</b>
      <br />
      <a
        href="https://transloadit.com/?utm_source=zod&utm_medium=referral&utm_campaign=sponsorship&utm_content=github">transloadit.com</a>
      <br />
      <p>Simple file processing for developers.</p>
    </td>
    <td align="center">
      <a href="https://infisical.com">
        <img src="https://avatars.githubusercontent.com/u/107880645?s=200&v=4" width="200px;" alt="Infisical logo" />
      </a>
      <br />
      <b>Infisical</b>
      <br />
      <a href="https://infisical.com">infisical.com</a>
      <br />
      <p>Open-source platform for secret<br /> management: sync secrets across your<br />team/infrastructure and prevent
        secret leaks.</p>
    </td>
  </tr>
    <tr>
    <td align="center">
      <a href="https://whop.com/">
        <img src="https://avatars.githubusercontent.com/u/91036480?s=200&v=4" width="200px;" alt="Whop logo" />
      </a>
      <br />
      <b>Whop</b>
      <br />
      <a href="https://whop.com/">whop.com</a>
      <br />
      <p width="200px">A marketplace for really cool internet products.</p>
    </td>
  </tr>
</table>

#### Silver

<table>
  <tr>
    <td align="center" colspan="2">
      <a href="https://www.numeric.io">
        <img src="https://i.imgur.com/kTiLtZt.png" width="250px;" alt="Numeric logo" />
      </a>
      <br />
      <b>Numeric</b>
      <br />
      <a href="https://www.numeric.io">numeric.io</a>
    </td>
    <td align="center">
      <a href="https://marcatopartners.com/">
        <img src="https://avatars.githubusercontent.com/u/84106192?s=200&v=4" width="150px;" alt="Marcato Partners" />
      </a>
      <br />
      <b>Marcato Partners</b>
      <br />
      <a href="https://marcatopartners.com/">marcatopartners.com</a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://interval.com">
        <img src="https://avatars.githubusercontent.com/u/67802063?s=200&v=4" width="150px;" alt="" />
      </a>
      <br />
      <b>Interval</b>
      <br />
      <a href="https://interval.com">interval.com</a>
    </td>
    <td align="center">
      <a href="https://seasoned.cc">
        <img src="https://avatars.githubusercontent.com/u/33913103?s=200&v=4" width="150px;" alt="" />
      </a>
      <br />
      <b>Seasoned Software</b>
      <br />
      <a href="https://seasoned.cc">seasoned.cc</a>
    </td>
    <td align="center">
      <a href="https://www.bamboocreative.nz/">
        <img src="https://avatars.githubusercontent.com/u/41406870?v=4" width="150px;" alt="Bamboo Creative logo" />
      </a>
      <br />
      <b>Bamboo Creative</b>
      <br />
      <a href="https://www.bamboocreative.nz">bamboocreative.nz</a>
    </td>
  </tr>
</table>

#### Bronze

<table>
  <tr>
    <td align="center">
      <a href="https://twitter.com/flybayer">
        <img src="https://avatars2.githubusercontent.com/u/8813276?s=460&u=4ff8beb9a67b173015c4b426a92d89cab960af1b&v=4" width="100px;" alt=""/>
      </a>
      <br />
      <b>Brandon Bayer</b>
      <br/>
      <a href="https://twitter.com/flybayer">@flybayer</a>,
      <span>creator of <a href="https://blitzjs.com">Blitz.js</a></span>
      <br />
    </td>
    <td align="center">
      <a href="https://github.com/brabeji">
        <img src="https://avatars.githubusercontent.com/u/2237954?v=4" width="100px;" alt=""/>
      </a>
      <br />
      <b>Jiří Brabec</b>
      <br/>
      <a href="https://github.com/brabeji">@brabeji</a>
      <br />
    </td>
     <td align="center">
      <a href="https://twitter.com/alexdotjs">
        <img src="https://avatars.githubusercontent.com/u/459267?v=4" width="100px;" alt="" />
      </a>
      <br />
      <b>Alex Johansson</b>
      <br />
      <a href="https://twitter.com/alexdotjs">@alexdotjs</a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://fungible.systems/">
        <img src="https://avatars.githubusercontent.com/u/80220121?s=200&v=4" width="100px;" alt="Fungible Systems logo"/>
      </a>
      <br />
      <b>Fungible Systems</b>
      <br/>
      <a href="https://fungible.systems/">fungible.systems</a>
      <br />
    </td>
    <td align="center">
      <a href="https://adaptable.io/">
        <img src="https://avatars.githubusercontent.com/u/60378268?s=200&v=4" width="100px;" alt=""/>
      </a>
      <br />
      <b>Adaptable</b>
      <br/>
      <a href="https://adaptable.io/">adaptable.io</a>
      <br />
    </td>
    <td align="center">
      <a href="https://www.avanawallet.com/">
        <img src="https://avatars.githubusercontent.com/u/105452197?s=200&v=4" width="100px;" alt="Avana Wallet logo"/>
      </a>
      <br />
      <b>Avana Wallet</b>
      <br/>
      <a href="https://www.avanawallet.com/">avanawallet.com</a><br/>
      <span>Solana non-custodial wallet</span>
      <br />
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://learnwithjason.dev">
        <img src="https://avatars.githubusercontent.com/u/66575486?s=200&v=4" width="100px;" alt="Learn with Jason logo"/>
      </a>
      <br />
      <b>Jason Lengstorf</b>
      <br/>
      <a href="https://learnwithjason.dev/">learnwithjason.dev</a>
      <br />
    </td>
    <td align="center">
      <a href="https://ill.inc/">
        <img src="https://avatars.githubusercontent.com/u/89107581?s=200&v=4" width="100px;" alt="Global Illumination"/>
      </a>
      <br />
      <b>Global Illumination, Inc.</b>
      <br/>
      <a href="https://ill.inc/">ill.inc</a>
      <br />
    </td>
     <td align="center">
      <a href="https://www.masterborn.com/career?utm_source=github&utm_medium=referral&utm_campaign=zodsponsoring">
        <img src="https://avatars.githubusercontent.com/u/48984031?s=200&v=4" width="100px;" alt="MasterBorn logo"/>
      </a>
      <br />
      <b>MasterBorn</b>
      <br/>
      <a href="https://www.masterborn.com/career?utm_source=github&utm_medium=referral&utm_campaign=zodsponsoring">masterborn.com</a>
      <br />
    </td>
  </tr>
</table>

## Ecosystem

There are a growing number of tools that are built atop or support Zod natively! If you've built a tool or library on top of Zod, tell me about it [on Twitter](https://twitter.com/colinhacks) or [start a Discussion](https://github.com/colinhacks/zod/discussions). I'll add it below and tweet it out.

### Resources

- [Total TypeScript Zod Tutorial](https://www.totaltypescript.com/tutorials/zod) by [@mattpocockuk](https://twitter.com/mattpocockuk)
- [Fixing TypeScript's Blindspot: Runtime Typechecking](https://www.youtube.com/watch?v=rY_XqfSHock) by [@jherr](https://twitter.com/jherr)

### API libraries

- [`tRPC`](https://github.com/trpc/trpc): Build end-to-end typesafe APIs without GraphQL.
- [`@anatine/zod-nestjs`](https://github.com/anatine/zod-plugins/tree/main/packages/zod-nestjs): Helper methods for using Zod in a NestJS project.
- [`zod-endpoints`](https://github.com/flock-community/zod-endpoints): Contract-first strictly typed endpoints with Zod. OpenAPI compatible.
- [`domain-functions`](https://github.com/SeasonedSoftware/domain-functions/): Decouple your business logic from your framework using composable functions. With first-class type inference from end to end powered by Zod schemas.
- [`@zodios/core`](https://github.com/ecyrbe/zodios): A typescript API client with runtime and compile time validation backed by axios and zod.
- [`express-zod-api`](https://github.com/RobinTail/express-zod-api): Build Express-based APIs with I/O schema validation and custom middlewares.
- [`tapiduck`](https://github.com/sumukhbarve/monoduck/blob/main/src/tapiduck/README.md): End-to-end typesafe JSON APIs with Zod and Express; a bit like tRPC, but simpler.
- [`koa-zod-router`](https://github.com/JakeFenley/koa-zod-router): Create typesafe routes in Koa with I/O validation using Zod.

### Form integrations

- [`conform`](https://conform.guide/api/zod): A progressive enhancement first form validation library for Remix and React Router
- [`react-hook-form`](https://github.com/react-hook-form/resolvers#zod): A first-party Zod resolver for React Hook Form.
- [`zod-validation-error`](https://github.com/causaly/zod-validation-error): Generate user-friendly error messages from `ZodError`s.
- [`zod-formik-adapter`](https://github.com/robertLichtnow/zod-formik-adapter): A community-maintained Formik adapter for Zod.
- [`react-zorm`](https://github.com/esamattis/react-zorm): Standalone `<form>` generation and validation for React using Zod.
- [`zodix`](https://github.com/rileytomasek/zodix): Zod utilities for FormData and URLSearchParams in Remix loaders and actions.
- [`remix-params-helper`](https://github.com/kiliman/remix-params-helper): Simplify integration of Zod with standard URLSearchParams and FormData for Remix apps.
- [`formik-validator-zod`](https://github.com/glazy/formik-validator-zod): Formik-compliant validator library that simplifies using Zod with Formik.
- [`zod-i18n-map`](https://github.com/aiji42/zod-i18n): Useful for translating Zod error messages.
- [`@modular-forms/solid`](https://github.com/fabian-hiller/modular-forms): Modular form library for SolidJS that supports Zod for validation.
- [`houseform`](https://github.com/crutchcorn/houseform/): A React form library that uses Zod for validation.
- [`sveltekit-superforms`](https://github.com/ciscoheat/sveltekit-superforms): Supercharged form library for SvelteKit with Zod validation.
- [`mobx-zod-form`](https://github.com/MonoidDev/mobx-zod-form): Data-first form builder based on MobX & Zod.
- [`@vee-validate/zod`](https://github.com/logaretm/vee-validate/tree/main/packages/zod): Form library for Vue.js with Zod schema validation.

### Zod to X

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

### X to Zod

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

### Mocking

- [`@anatine/zod-mock`](https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock): Generate mock data from a Zod schema. Powered by [faker.js](https://github.com/faker-js/faker).
- [`zod-mocking`](https://github.com/dipasqualew/zod-mocking): Generate mock data from your Zod schemas.
- [`zod-fixture`](https://github.com/timdeschryver/zod-fixture): Use your zod schemas to automate the generation of non-relevant test fixtures in a deterministic way.
- [`zocker`](https://zocker.sigrist.dev): Generate plausible mock-data from your schemas.
- [`zodock`](https://github.com/ItMaga/zodock) Generate mock data based on Zod schemas.

### Powered by Zod

- [`freerstore`](https://github.com/JacobWeisenburger/freerstore): Firestore cost optimizer.
- [`slonik`](https://github.com/gajus/slonik/tree/gajus/add-zod-validation-backwards-compatible#runtime-validation-and-static-type-inference): Node.js Postgres client with strong Zod integration.
- [`soly`](https://github.com/mdbetancourt/soly): Create CLI applications with zod.
- [`zod-xlsx`](https://github.com/sidwebworks/zod-xlsx): A xlsx based resource validator using Zod schemas.
- [`znv`](https://github.com/lostfictions/znv): Type-safe environment parsing and validation for Node.js with Zod schemas.

### Utilities for Zod

- [`zod_utilz`](https://github.com/JacobWeisenburger/zod_utilz): Framework agnostic utilities for Zod.
- [`zod-sandbox`](https://github.com/nereumelo/zod-sandbox): Controlled environment for testing zod schemas. [Live demo](https://zod-sandbox.vercel.app/).
