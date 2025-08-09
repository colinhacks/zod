import { Heading } from "@/components/heading";
import { Tabs } from "@/components/tabs";
import { source } from "@/loaders/source";
import { Callout } from "fumadocs-ui/components/callout";
import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { Github } from "lucide-react";

export const revalidate = 86400;

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const title = page.data.title;
  const description = page.data.description;

  const MDXContent = page.data.body;
  const toc = page.data.toc
    .filter((item) => item.depth <= 3)
    .map((item) => {
      return item;
    });

  const editOnGithub = (
    <h3 className="border-[var(--color-fd-border)] pb-0 mb-0 inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground">
      <a
        href={`https://github.com/colinhacks/zod/blob/main/packages/docs/content/${page.file.path}`}
        rel="noreferrer noopener"
        target="_blank"
        className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 text-sm no-underline"
      >
        <Github className="w-4 h-4 inline mr-[1px]" /> Edit this page
      </a>
    </h3>
  )

  return (
    <DocsPage
      toc={toc}
      tableOfContent={{ style: "clerk", single: false, header: editOnGithub }}
      full={false}
    
    >
      {title && title !== "Intro" ? <DocsTitle>{title}</DocsTitle> : null}
      {/* <DocsDescription>{description}</DocsDescription> */}
      <DocsBody {...{}}>
      <MDXContent
        components={{
          ...defaultMdxComponents,
          // this allows you to link to other pages with relative file paths
          a: createRelativeLink(source, page),
          // you can add other MDX components here
          blockquote: Callout,
          Tabs,
          h1: (props) => <Heading as="h1" {...props} />,
          h2: (props) => <Heading as="h2" {...props} />,
          h3: (props) => <Heading as="h3" {...props} />,
          h4: (props) => <Heading as="h4" {...props} />,
          h5: (props) => <Heading as="h5" {...props} />,
          h6: (props) => <Heading as="h6" {...props} />,
        }}
        
      />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const rootTitle = page.data.title ?? "Home";
  const title = rootTitle + " | Zod";
  const description = page.data.description;
  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      siteName: "Zod",
      url: `https://zod.dev/${page.slugs.join("/")}`,
      images: [
        {
          url: `/og.png?title=${encodeURIComponent(rootTitle)}&description=${encodeURIComponent(description ?? "")}&path=${encodeURIComponent(`${["zod.dev", ...page.slugs].join("/")}`)}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@colinhacks",
      site: "@colinhacks",
    },
    keywords: ["zod", "typescript", "validation", "schema"],
  };
}
