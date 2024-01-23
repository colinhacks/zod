# Ecosystem

There are a growing number of tools that are built atop or support Zod natively! If you've built a tool or library on top of Zod, tell me about it [on Twitter](https://twitter.com/colinhacks) or [start a Discussion](https://github.com/colinhacks/zod/discussions). I'll add it below and tweet it out.

## Resources

- [Total TypeScript Zod Tutorial](https://www.totaltypescript.com/tutorials/zod) by [@mattpocockuk](https://twitter.com/mattpocockuk)
- [Fixing TypeScript's Blindspot: Runtime Typechecking](https://www.youtube.com/watch?v=rY_XqfSHock) by [@jherr](https://twitter.com/jherr)

## API libraries

- [`tRPC`](https://github.com/trpc/trpc): Build end-to-end typesafe APIs without GraphQL.
- [`@anatine/zod-nestjs`](https://github.com/anatine/zod-plugins/tree/main/packages/zod-nestjs): Helper methods for using Zod in a NestJS project.
- [`zod-endpoints`](https://github.com/flock-community/zod-endpoints): Contract-first strictly typed endpoints with Zod. OpenAPI compatible.
- [`domain-functions`](https://github.com/SeasonedSoftware/domain-functions/): Decouple your business logic from your framework using composable functions. With first-class type inference from end to end powered by Zod schemas.
- [`@zodios/core`](https://github.com/ecyrbe/zodios): A typescript API client with runtime and compile time validation backed by axios and zod.
- [`express-zod-api`](https://github.com/RobinTail/express-zod-api): Build Express-based APIs with I/O schema validation and custom middlewares.
- [`tapiduck`](https://github.com/sumukhbarve/monoduck/blob/main/src/tapiduck/README.md): End-to-end typesafe JSON APIs with Zod and Express; a bit like tRPC, but simpler.
- [`koa-zod-router`](https://github.com/JakeFenley/koa-zod-router): Create typesafe routes in Koa with I/O validation using Zod.

## Form integrations

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

## Zod to X

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

## X to Zod

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

## Mocking

- [`@anatine/zod-mock`](https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock): Generate mock data from a Zod schema. Powered by [faker.js](https://github.com/faker-js/faker).
- [`zod-mocking`](https://github.com/dipasqualew/zod-mocking): Generate mock data from your Zod schemas.
- [`zod-fixture`](https://github.com/timdeschryver/zod-fixture): Use your zod schemas to automate the generation of non-relevant test fixtures in a deterministic way.
- [`zocker`](https://zocker.sigrist.dev): Generate plausible mock-data from your schemas.
- [`zodock`](https://github.com/ItMaga/zodock) Generate mock data based on Zod schemas.

## Powered by Zod

- [`freerstore`](https://github.com/JacobWeisenburger/freerstore): Firestore cost optimizer.
- [`slonik`](https://github.com/gajus/slonik/tree/gajus/add-zod-validation-backwards-compatible#runtime-validation-and-static-type-inference): Node.js Postgres client with strong Zod integration.
- [`soly`](https://github.com/mdbetancourt/soly): Create CLI applications with zod.
- [`zod-xlsx`](https://github.com/sidwebworks/zod-xlsx): A xlsx based resource validator using Zod schemas.
- [`znv`](https://github.com/lostfictions/znv): Type-safe environment parsing and validation for Node.js with Zod schemas.

## Utilities for Zod

- [`zod_utilz`](https://github.com/JacobWeisenburger/zod_utilz): Framework agnostic utilities for Zod.
- [`zod-sandbox`](https://github.com/nereumelo/zod-sandbox): Controlled environment for testing zod schemas. [Live demo](https://zod-sandbox.vercel.app/).
