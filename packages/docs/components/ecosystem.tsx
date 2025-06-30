import { fetchStars } from "@/loaders/stars";
import type React from "react";

interface ZodResource {
  name: string;
  url: string;
  description: React.ReactNode;
  slug: string;
  stars?: number;
  v4?: boolean;
  // author?: string;
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
    name: "@regle/schemas",
    url: "https://github.com/victorgarciaesgi/regle/tree/main/packages/schemas",
    description: "Headless form validation library for Vue.js.",
    slug: "victorgarciaesgi/regle",
  },
];

const zodToXConverters: ZodResource[] = [];

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
    name: "Zod JSON-RPC",
    url: "https://github.com/danscan/zod-jsonrpc",
    description: "Type-safe JSON-RPC client/server library using Zod schemas.",
    slug: "danscan/zod-jsonrpc",
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
            <td className="whitespace-nowrap">{`⭐️ ${resource.v4 ? "✅" : ""}`}</td>
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
