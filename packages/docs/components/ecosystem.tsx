import { fetchStars } from "@/loaders/stars";
import type React from "react";

interface ZodResource {
  name: string;
  url: string;
  description: React.ReactNode;
  slug: string;
  stars?: number;
}

const apiLibraries: ZodResource[] = [
  {
    name: "tRPC",
    url: "https://github.com/trpc/trpc",
    description: "Build end-to-end typesafe APIs without GraphQL.",
    slug: "trpc/trpc",
  },
  {
    name: "GQLoom",
    url: "https://gqloom.dev/",
    description: "Weave GraphQL schema and resolvers using Zod.",
    slug: "modevol-com/gqloom",
  },
  {
    name: "oRPC",
    url: "https://orpc.unnoq.com/",
    description: "Typesafe APIs Made Simple",
    slug: "unnoq/orpc",
  },
  {
    name: "Express Zod API",
    url: "https://github.com/RobinTail/express-zod-api",
    description: "Build Express-based API with I/O validation and middlewares, OpenAPI docs and type-safe client.",
    slug: "RobinTail/express-zod-api",
  },
  {
    name: "Zod Sockets",
    url: "https://github.com/RobinTail/zod-sockets",
    description: "Socket.IO solution with I/O validation, an AsyncAPI generator, and a type-safe events map.",
    slug: "RobinTail/zod-sockets",
  },
  {
    name: "Zod JSON-RPC",
    url: "https://github.com/danscan/zod-jsonrpc",
    description: "Type-safe JSON-RPC 2.0 client/server library using Zod.",
    slug: "danscan/zod-jsonrpc",
  },

  // https://github.com/honojs/middleware/tree/main/packages/zod-validator
  // {
  //   name: "@hono/zod-validator",
  //   url: "https://github.com/honojs/middleware/tree/main/packages/zod-validator",
  //   description: "Zod validator middleware for Hono",
  //   slug: "honojs/middleware",
  // },
];

const formIntegrations: ZodResource[] = [
  {
    name: "regle",
    url: "https://github.com/victorgarciaesgi/regle",
    description: "Headless form validation library for Vue.js.",
    slug: "victorgarciaesgi/regle",
  },
  {
    name: "conform",
    url: "https://conform.guide/api/zod/parseWithZod",
    description:
      "A type-safe form validation library utilizing web fundamentals to progressively enhance HTML Forms with full support for server frameworks like Remix and Next.js.",
    slug: "edmundhung/conform",
  },
  {
    name: "Superforms",
    url: "https://superforms.rocks",
    description: "Making SvelteKit forms a pleasure to use!",
    slug: "ciscoheat/sveltekit-superforms",
  },
  {
    name: "zod-validation-error",
    url: "https://github.com/causaly/zod-validation-error",
    description: "Generate user-friendly error messages from ZodError instances.",
    slug: "causaly/zod-validation-error",
  },
  {
    name: "svelte-jsonschema-form",
    url: "https://x0k.dev/svelte-jsonschema-form/validators/zod4/",
    description: "Svelte 5 library for creating forms based on JSON schema.",
    slug: "x0k/svelte-jsonschema-form",
  },
];

const zodToXConverters: ZodResource[] = [
  {
    name: "zod-openapi",
    url: "https://github.com/samchungy/zod-openapi",
    description: "Use Zod Schemas to create OpenAPI v3.x documentation",
    slug: "samchungy/zod-openapi",
  },
  {
    name: "fastify-zod-openapi",
    url: "https://github.com/samchungy/fastify-zod-openapi",
    description: "Fastify type provider, validation, serialization and @fastify/swagger support for Zod schemas",
    slug: "samchungy/fastify-zod-openapi",
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
    name: "orval",
    url: "https://github.com/orval-labs/orval",
    description: "Generate Zod schemas from OpenAPI schemas",
    slug: "orval-labs/orval",
  },
  {
    name: "kubb",
    url: "https://github.com/kubb-labs/kubb",
    description: "The ultimate toolkit for working with APIs.",
    slug: "kubb-labs/kubb",
  },
];

const mockingLibraries: ZodResource[] = [
  {
    name: "zod-schema-faker",
    url: "https://github.com/soc221b/zod-schema-faker",
    description: "Generate mock data from zod schemas. Powered by @faker-js/faker and randexp.js.",
    slug: "soc221b/zod-schema-faker",
  },
  {
    name: "zocker",
    url: "https://zocker.sigrist.dev",
    description: "Generates valid, semantically meaningful data for your Zod schemas.",
    slug: "LorisSigrist/zocker",
  },
];

const poweredByZodProjects: ZodResource[] = [
  {
    name: "zod-config",
    url: "https://github.com/alexmarqs/zod-config",
    description: "Load configurations across multiple sources with flexible adapters, ensuring type safety with Zod.",
    slug: "alexmarqs/zod-config",
  },
  {
    name: "Composable Functions",
    url: "https://github.com/seasonedcc/composable-functions",
    description: "Types and functions to make composition easy and safe.",
    slug: "seasonedcc/composable-functions",
  },
  {
    name: "zod-xlsx",
    url: "https://github.com/sidwebworks/zod-xlsx",
    description: "A xlsx based resource validator using Zod schemas for data imports and more",
    slug: "sidwebworks/zod-xlsx",
  },
];

const zodUtilities: ZodResource[] = [];

export {
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
          {/* <th>Zod 4 support</th> */}
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
            {/* <td className="whitespace-nowrap">{`⭐️ ${resource.v4 ? "✅" : ""}`}</td> */}
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

  return (
    <>
      <Table resources={resources} />
    </>
  );
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
