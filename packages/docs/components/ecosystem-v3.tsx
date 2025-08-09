import { fetchStars } from "@/loaders/stars";
import type React from "react";

interface ZodResource {
  name: string;
  url: string;
  description: React.ReactNode;
  slug: string;
  stars?: number;
  /** Whether the library has confirmed support for Zod 4 */
  v4?: boolean;
}

const apiLibraries: ZodResource[] = [
  {
    name: "tRPC",
    url: "https://github.com/trpc/trpc",
    description: "Build end-to-end typesafe APIs without GraphQL.",
    slug: "trpc/trpc",
    v4: true,
  },
  {
    name: "@anatine/zod-nestjs",
    url: "https://github.com/anatine/zod-plugins/tree/main/packages/zod-nestjs",
    description: "Helper methods for using Zod in a NestJS project.",
    slug: "anatine/zod-plugins",
  },
  {
    name: "zod-endpoints",
    url: "https://github.com/flock-community/zod-endpoints",
    description: "Contract-first strictly typed endpoints with Zod. OpenAPI compatible.",
    slug: "flock-community/zod-endpoints",
  },
  {
    name: "zhttp",
    url: "https://github.com/evertdespiegeleer/zhttp",
    description: "An OpenAPI compatible, strictly typed http library with Zod input and response validation.",
    slug: "evertdespiegeleer/zhttp",
  },
  {
    name: "domain-functions",
    url: "https://github.com/SeasonedSoftware/domain-functions/",
    description:
      "Decouple your business logic from your framework using composable functions. With first-class type inference from end to end powered by Zod schemas.",
    slug: "SeasonedSoftware/domain-functions",
  },
  {
    name: "@zodios/core",
    url: "https://github.com/ecyrbe/zodios",
    description: "A typescript API client with runtime and compile time validation backed by axios and zod.",
    slug: "ecyrbe/zodios",
  },
  {
    name: "express-zod-api",
    url: "https://github.com/RobinTail/express-zod-api",
    description: "Build Express-based APIs with I/O schema validation and custom middlewares.",
    slug: "RobinTail/express-zod-api",
  },
  {
    name: "tapiduck",
    url: "https://github.com/sumukhbarve/monoduck/blob/main/src/tapiduck/README.md",
    description: "End-to-end typesafe JSON APIs with Zod and Express; a bit like tRPC, but simpler.",
    slug: "sumukhbarve/monoduck",
  },
  {
    name: "koa-zod-router",
    url: "https://github.com/JakeFenley/koa-zod-router",
    description: "Create typesafe routes in Koa with I/O validation using Zod.",
    slug: "JakeFenley/koa-zod-router",
  },
  {
    name: "zod-sockets",
    url: "https://github.com/RobinTail/zod-sockets",
    description: "Zod-powered Socket.IO microframework with I/O validation and built-in AsyncAPI specs",
    slug: "RobinTail/zod-sockets",
  },
  {
    name: "oas-tszod-gen",
    url: "https://github.com/inkognitro/oas-tszod-gen",
    description:
      "Client SDK code generator to convert OpenApi v3 specifications into TS endpoint caller functions with Zod types.",
    slug: "inkognitro/oas-tszod-gen",
  },
  {
    name: "GQLoom",
    url: "https://github.com/modevol-com/gqloom",
    description: "Weave GraphQL schema and resolvers using Zod.",
    slug: "modevol-com/gqloom",
    v4: true,
  },
];

const formIntegrations: ZodResource[] = [
  {
    name: "react-hook-form",
    url: "https://github.com/react-hook-form/resolvers#zod",
    description: "A first-party Zod resolver for React Hook Form.",
    slug: "react-hook-form/react-hook-form",
  },
  {
    name: "zod-validation-error",
    url: "https://github.com/causaly/zod-validation-error",
    description: "Generate user-friendly error messages from ZodError instances.",
    slug: "causaly/zod-validation-error",
  },
  {
    name: "zod-formik-adapter",
    url: "https://github.com/robertLichtnow/zod-formik-adapter",
    description: "A community-maintained Formik adapter for Zod.",
    slug: "robertLichtnow/zod-formik-adapter",
  },
  {
    name: "react-zorm",
    url: "https://github.com/esamattis/react-zorm",
    description: "Standalone `<form>` generation and validation for React using Zod.",
    slug: "esamattis/react-zorm",
  },
  {
    name: "zodix",
    url: "https://github.com/rileytomasek/zodix",
    description: "Zod utilities for FormData and URLSearchParams in Remix loaders and actions.",
    slug: "rileytomasek/zodix",
  },
  {
    name: "conform",
    url: "https://conform.guide/api/zod/parseWithZod",
    description:
      "A typesafe form validation library for progressive enhancement of HTML forms. Works with Remix and Next.js.",
    slug: "edmundhung/conform",
  },
  {
    name: "remix-params-helper",
    url: "https://github.com/kiliman/remix-params-helper",
    description: "Simplify integration of Zod with standard URLSearchParams and FormData for Remix apps.",
    slug: "kiliman/remix-params-helper",
  },
  {
    name: "formik-validator-zod",
    url: "https://github.com/glazy/formik-validator-zod",
    description: "Formik-compliant validator library that simplifies using Zod with Formik.",
    slug: "glazy/formik-validator-zod",
  },
  {
    name: "zod-i18n-map",
    url: "https://github.com/aiji42/zod-i18n",
    description: "Useful for translating Zod error messages.",
    slug: "aiji42/zod-i18n",
  },
  {
    name: "@modular-forms/solid",
    url: "https://github.com/fabian-hiller/modular-forms",
    description: "Modular form library for SolidJS that supports Zod for validation.",
    slug: "fabian-hiller/modular-forms",
  },
  {
    name: "houseform",
    url: "https://github.com/crutchcorn/houseform/",
    description: "A React form library that uses Zod for validation.",
    slug: "crutchcorn/houseform",
  },
  {
    name: "sveltekit-superforms",
    url: "https://github.com/ciscoheat/sveltekit-superforms",
    description: "Supercharged form library for SvelteKit with Zod validation.",
    slug: "ciscoheat/sveltekit-superforms",
  },
  {
    name: "mobx-zod-form",
    url: "https://github.com/MonoidDev/mobx-zod-form",
    description: "Data-first form builder based on MobX & Zod.",
    slug: "MonoidDev/mobx-zod-form",
  },
  {
    name: "@vee-validate/zod",
    url: "https://github.com/logaretm/vee-validate/tree/main/packages/zod",
    description: "Form library for Vue.js with Zod schema validation.",
    slug: "logaretm/vee-validate",
  },
  {
    name: "zod-form-renderer",
    url: "https://github.com/thepeaklab/zod-form-renderer",
    description: "Auto-infer form fields from zod schema and render them with react-hook-form with E2E type safety.",
    slug: "thepeaklab/zod-form-renderer",
  },
  {
    name: "antd-zod",
    url: "https://github.com/MrBr/antd-zod",
    description: "Zod adapter for Ant Design form fields validation.",
    slug: "MrBr/antd-zod",
  },
  {
    name: "frrm",
    url: "https://github.com/schalkventer/frrm",
    description: "Tiny 0.5kb Zod-based, HTML form abstraction that goes brr.",
    slug: "schalkventer/frrm",
  },
  {
    name: "regle",
    url: "https://github.com/victorgarciaesgi/regle",
    description: "Headless form validation library for Vue.js.",
    slug: "victorgarciaesgi/regle",
    v4: true,
  },
];

const zodToXConverters: ZodResource[] = [
  {
    name: "zod-to-ts",
    url: "https://github.com/sachinraja/zod-to-ts",
    description: "Generate TypeScript definitions from Zod schemas.",
    slug: "sachinraja/zod-to-ts",
  },
  {
    name: "zod-to-json-schema",
    url: "https://github.com/StefanTerdell/zod-to-json-schema",
    description: "Convert your Zod schemas into JSON Schemas.",
    slug: "StefanTerdell/zod-to-json-schema",
  },
  {
    name: "@anatine/zod-openapi",
    url: "https://github.com/anatine/zod-plugins/tree/main/packages/zod-openapi",
    description: "Converts a Zod schema to an OpenAPI v3.x `SchemaObject`.",
    slug: "anatine/zod-plugins",
  },
  {
    name: "zod-fast-check",
    url: "https://github.com/DavidTimms/zod-fast-check",
    description: "Generate `fast-check` arbitraries from Zod schemas.",
    slug: "DavidTimms/zod-fast-check",
  },
  {
    name: "zod-dto",
    url: "https://github.com/kbkk/abitia/tree/master/packages/zod-dto",
    description: "Generate Nest.js DTOs from a Zod schema.",
    slug: "kbkk/abitia",
  },
  {
    name: "fastify-type-provider-zod",
    url: "https://github.com/turkerdev/fastify-type-provider-zod",
    description: "Create Fastify type providers from Zod schemas.",
    slug: "turkerdev/fastify-type-provider-zod",
  },
  {
    name: "zod-to-openapi",
    url: "https://github.com/asteasolutions/zod-to-openapi",
    description: "Generate full OpenAPI (Swagger) docs from Zod, including schemas, endpoints & parameters.",
    slug: "asteasolutions/zod-to-openapi",
  },
  {
    name: "nestjs-graphql-zod",
    url: "https://github.com/incetarik/nestjs-graphql-zod",
    description:
      "Generates NestJS GraphQL model classes from Zod schemas. Provides GraphQL method decorators working with Zod schemas.",
    slug: "incetarik/nestjs-graphql-zod",
  },
  {
    name: "zod-openapi",
    url: "https://github.com/samchungy/zod-openapi",
    description: "Create full OpenAPI v3.x documentation from Zod schemas.",
    slug: "samchungy/zod-openapi",
  },
  {
    name: "fastify-zod-openapi",
    url: "https://github.com/samchungy/fastify-zod-openapi",
    description: "Fastify type provider, validation, serialization and @fastify/swagger support for Zod schemas.",
    slug: "samchungy/fastify-zod-openapi",
  },
  {
    name: "typeschema",
    url: "https://typeschema.com/",
    description: "Universal adapter for schema validation.",
    slug: "decs/typeschema",
  },
  {
    name: "zodex",
    url: "https://github.com/commonbaseapp/zodex",
    description: "(De)serialization for zod schemas",
    slug: "commonbaseapp/zodex",
  },
  {
    name: "zod2md",
    url: "https://github.com/matejchalk/zod2md",
    description: "Generate Markdown docs from Zod schemas",
    slug: "matejchalk/zod2md",
  },
];

const xToZodConverters: ZodResource[] = [
  {
    name: "ts-to-zod",
    url: "https://github.com/fabien0102/ts-to-zod",
    description: "Convert TypeScript definitions into Zod schemas.",
    slug: "fabien0102/ts-to-zod",
  },
  {
    name: "@runtyping/zod",
    url: "https://github.com/johngeorgewright/runtyping",
    description: "Generate Zod from static types & JSON schema.",
    slug: "johngeorgewright/runtyping",
  },
  {
    name: "json-schema-to-zod",
    url: "https://github.com/StefanTerdell/json-schema-to-zod",
    description: "Convert your JSON Schemas into Zod schemas.",
    slug: "StefanTerdell/json-schema-to-zod",
  },
  {
    name: "json-to-zod",
    url: "https://github.com/rsinohara/json-to-zod",
    description: "Convert JSON objects into Zod schemas.",
    slug: "rsinohara/json-to-zod",
  },
  {
    name: "GraphQL schema gen",
    url: "https://github.com/Code-Hex/graphql-codegen-typescript-validation-schema",
    description: "GraphQL Code Generator plugin to generate form validation schema from your GraphQL schema.",
    slug: "Code-Hex/graphql-codegen-typescript-validation-schema",
  },
  {
    name: "zod-prisma",
    url: "https://github.com/CarterGrimmeisen/zod-prisma",
    description: "Generate Zod schemas from your Prisma schema.",
    slug: "CarterGrimmeisen/zod-prisma",
  },
  {
    name: "Supervillain",
    url: "https://github.com/Southclaws/supervillain",
    description: "Generate Zod schemas from your Go structs.",
    slug: "Southclaws/supervillain",
  },
  {
    name: "prisma-zod-generator",
    url: "https://github.com/omar-dulaimi/prisma-zod-generator",
    description: "Emit Zod schemas from your Prisma schema.",
    slug: "omar-dulaimi/prisma-zod-generator",
  },
  {
    name: "drizzle-zod",
    url: "https://orm.drizzle.team/docs/zod",
    description: "Emit Zod schemas from your Drizzle schema.",
    slug: "drizzle-team/drizzle-orm",
  },
  {
    name: "prisma-trpc-generator",
    url: "https://github.com/omar-dulaimi/prisma-trpc-generator",
    description: "Emit fully implemented tRPC routers and their validation schemas using Zod.",
    slug: "omar-dulaimi/prisma-trpc-generator",
  },
  {
    name: "zod-prisma-types",
    url: "https://github.com/chrishoermann/zod-prisma-types",
    description: "Create Zod types from your Prisma models.",
    slug: "chrishoermann/zod-prisma-types",
  },
  {
    name: "quicktype",
    url: "https://app.quicktype.io/",
    description: "Convert JSON objects and JSON schemas into Zod schemas.",
    slug: "glideapps/quicktype",
  },
  {
    name: "@sanity-typed/zod",
    url: "https://github.com/saiichihashimoto/sanity-typed/tree/main/packages/zod",
    description: "Generate Zod Schemas from Sanity Schemas.",
    slug: "saiichihashimoto/sanity-typed",
  },
  {
    name: "java-to-zod",
    url: "https://github.com/ivangreene/java-to-zod",
    description: "Convert POJOs to Zod schemas",
    slug: "ivangreene/java-to-zod",
  },
  {
    name: "Orval",
    url: "https://github.com/anymaniax/orval",
    description: "Generate Zod schemas from OpenAPI schemas",
    slug: "anymaniax/orval",
    v4: true,
  },
  {
    name: "Kubb",
    url: "https://github.com/kubb-labs/kubb",
    description: "Generate SDKs and Zod schemas from your OpenAPI schemas",
    slug: "kubb-labs/kubb",
    v4: true,
  },
  {
    name: "Hey API",
    url: "https://heyapi.dev/openapi-ts/plugins/zod/v3",
    description: "The OpenAPI to TypeScript codegen. Generate clients, SDKs, validators, and more.",
    slug: "hey-api/openapi-ts",
    v4: true,
  },
];

const mockingLibraries: ZodResource[] = [
  {
    name: "@anatine/zod-mock",
    url: "https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock",
    description: "Generate mock data from a Zod schema. Powered by faker.js.",
    slug: "anatine/zod-plugins",
  },
  {
    name: "zod-mocking",
    url: "https://github.com/dipasqualew/zod-mocking",
    description: "Generate mock data from your Zod schemas.",
    slug: "dipasqualew/zod-mocking",
  },
  {
    name: "zod-fixture",
    url: "https://github.com/timdeschryver/zod-fixture",
    description:
      "Use your zod schemas to automate the generation of non-relevant test fixtures in a deterministic way.",
    slug: "timdeschryver/zod-fixture",
  },
  {
    name: "zocker",
    url: "https://zocker.sigrist.dev",
    description: "Generate plausible mock-data from your schemas.",
    slug: "LorisSigrist/zocker",
  },
  {
    name: "zodock",
    url: "https://github.com/ItMaga/zodock",
    description: "Generate mock data based on Zod schemas.",
    slug: "ItMaga/zodock",
  },
  {
    name: "zod-schema-faker",
    url: "https://github.com/soc221b/zod-schema-faker",
    description: "Generates mock data from Zod schemas. Powered by @faker-js/faker and randexp.js",
    slug: "soc221b/zod-schema-faker",
    v4: true,
  },
];

const poweredByZodProjects: ZodResource[] = [
  {
    name: "freerstore",
    url: "https://github.com/JacobWeisenburger/freerstore",
    description: "Firestore cost optimizer.",
    slug: "JacobWeisenburger/freerstore",
  },
  {
    name: "slonik",
    url: "https://github.com/gajus/slonik/tree/gajus/add-zod-validation-backwards-compatible#runtime-validation-and-static-type-inference",
    description: "Node.js Postgres client with strong Zod integration.",
    slug: "gajus/slonik",
  },
  {
    name: "schemql",
    url: "https://github.com/a2lix/schemql",
    description: "Enhances your SQL workflow by combining raw SQL with targeted type safety and schema validation.",
    slug: "a2lix/schemql",
  },
  {
    name: "soly",
    url: "https://github.com/mdbetancourt/soly",
    description: "Create CLI applications with zod.",
    slug: "mdbetancourt/soly",
  },
  {
    name: "pastel",
    url: "reesericci/zod-struct",
    description: "Create CLI applications with react, zod, and ink.",
    slug: "vadimdemedes/pastel",
  },
  {
    name: "zod-xlsx",
    url: "https://github.com/sidwebworks/zod-xlsx",
    description: "A xlsx based resource validator using Zod schemas.",
    slug: "sidwebworks/zod-xlsx",
  },
  {
    name: "znv",
    url: "https://github.com/lostfictions/znv",
    description: "Type-safe environment parsing and validation for Node.js with Zod schemas.",
    slug: "lostfictions/znv",
  },
  {
    name: "zod-config",
    url: "https://github.com/alexmarqs/zod-config",
    description: "Load configurations across multiple sources with flexible adapters, ensuring type safety with Zod.",
    slug: "alexmarqs/zod-config",
    v4: true,
  },
  {
    name: "unplugin-environment",
    url: "https://github.com/r17x/js/tree/main/packages/unplugin-environment#readme",
    description:
      "A plugin for loading environment variables safely with schema validation, simple with virtual module, type-safe with intellisense, and better DX 🔥 🚀 👷. Powered by Zod.",
    slug: "r17x/js",
  },
  {
    name: "zod-struct",
    url: "https://codeberg.org/reesericci/zod-struct",
    description: "Create runtime-checked structs with Zod.",
    slug: "reesericci/zod-struct",
    stars: 0,
  },
  {
    name: "Composable Functions",
    url: "https://github.com/seasonedcc/composable-functions",
    description: "Types and functions to make composition easy and safe.",
    slug: "seasonedcc/composable-functions",
    v4: true,
  },
];

const zodUtilities: ZodResource[] = [
  {
    name: "zod_utilz",
    url: "https://github.com/JacobWeisenburger/zod_utilz",
    description: "Framework agnostic utilities for Zod.",
    slug: "JacobWeisenburger/zod_utilz",
  },
  {
    name: "zod-playground",
    url: "https://github.com/marilari88/zod-playground",
    description: "A tool for learning and testing Zod schema validation functionalities.",
    slug: "marilari88/zod-playground",
  },
  {
    name: "zod-sandbox",
    url: "https://github.com/nereumelo/zod-sandbox",
    description: "Controlled environment for testing zod schemas.",
    slug: "nereumelo/zod-sandbox",
  },
  {
    name: "zod-dev",
    url: "https://github.com/schalkventer/zod-dev",
    description: "Conditionally disables Zod runtime parsing in production.",
    slug: "schalkventer/zod-dev",
  },
  {
    name: "zod-accelerator",
    url: "https://github.com/duplojs/duplojs-zod-accelerator",
    description: "Accelerates Zod's throughput up to ~100x.",
    slug: "duplojs/duplojs-zod-accelerator",
  },
];

export {
  // resources,
  apiLibraries,
  formIntegrations,
  zodToXConverters,
  xToZodConverters,
  mockingLibraries,
  poweredByZodProjects,
  zodUtilities,
};

export function Table(props: { resources: ZodResource[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Stars</th>
          <th>Zod 4 support</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {props.resources.map((resource) => (
          <tr key={resource.slug}>
            <td>
              <a href={resource.url}>
                <code className="whitespace-nowrap">{resource.name}</code>
              </a>
            </td>
            <td className="whitespace-nowrap">{`⭐️ ${resource.stars ?? "ERR"}`}</td>
            <td className="whitespace-nowrap">{`${resource.v4 ? "✅" : ""}`}</td>
            <td>{resource.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type ResourceTableProps = {
  resources: ZodResource[];
};

async function ResourceTable({ resources }: ResourceTableProps) {
  await fetchStars(resources);

  return <Table resources={resources} />;
}

export async function ApiLibraries() {
  return <ResourceTable resources={apiLibraries} />;
}

export async function FormIntegrations() {
  return <ResourceTable resources={formIntegrations} />;
}

export async function ZodToX() {
  return <ResourceTable resources={zodToXConverters} />;
}

export async function XToZod() {
  return <ResourceTable resources={xToZodConverters} />;
}

export async function MockingLibraries() {
  return <ResourceTable resources={mockingLibraries} />;
}

export async function PoweredByZod() {
  return <ResourceTable resources={poweredByZodProjects} />;
}

export async function ZodUtilities() {
  return <ResourceTable resources={zodUtilities} />;
}
