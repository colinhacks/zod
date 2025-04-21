import { fetchStars } from "@/loaders/stars";
import type React from "react";

interface ZodResource {
  name: string;
  url: string;
  description: React.ReactNode;
  slug: string;
  stars?: number;
  // author?: string;
}

const apiLibraries: ZodResource[] = [
  {
    name: "tRPC",
    url: "https://github.com/trpc/trpc",
    description: "Build end-to-end typesafe APIs without GraphQL.",
    slug: "trpc/trpc",
  },
];

const formIntegrations: ZodResource[] = [];

const zodToXConverters: ZodResource[] = [];

const xToZodConverters: ZodResource[] = [];

const mockingLibraries: ZodResource[] = [
  {
    name: "zod-schema-faker",
    url: "https://github.com/soc221b/zod-schema-faker",
    description: "Generate mock data from zod schemas. Powered by @faker-js/faker and randexp.js.",
    slug: "soc221b/zod-schema-faker",
  },
];

const poweredByZodProjects: ZodResource[] = [];

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
