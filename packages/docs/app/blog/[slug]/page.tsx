import { BlogToc, type TocEntry } from "@/components/blog-toc";
import { Heading } from "@/components/heading";
import { InlineCodeTitle, stripBackticks } from "@/components/inline-code-title";
import { Tab, Tabs } from "@/components/tabs";
import { blog, formatDate } from "@/loaders/source";
import { Callout } from "fumadocs-ui/components/callout";
import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";

export const revalidate = false;

const AUTHOR_URL = "https://x.com/colinhacks";

// a `draft: true` post stays reachable on the dev server but never ships
const isHidden = (page: any) => Boolean(page.data?.draft) && process.env.NODE_ENV === "production";
const LABEL = "text-[11px] font-medium uppercase tracking-[0.16em] text-fd-muted-foreground";

function MetaLine({ author, date }: { author: string; date?: Date }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-sm text-fd-muted-foreground">
      <a href={AUTHOR_URL} className="font-medium text-fd-foreground hover:text-[var(--ui-color)]">
        {author}
      </a>
      {date ? (
        <>
          <span className="opacity-50">·</span>
          <time dateTime={date.toISOString()}>{formatDate(date, "long")}</time>
        </>
      ) : null}
    </p>
  );
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const page = blog.getPage([params.slug]) as any;

  if (!page || isHidden(page)) notFound();
  const Mdx = page.data.body as ComponentType<any>;
  const title: string = page.data?.title ?? params.slug;
  const author: string = page.data?.author ?? "Colin McDonnell";
  const date = page.data?.date ? new Date(page.data.date) : undefined;
  // h2s plus their h3s, except under Bug fixes where the h3s are long and numerous
  let section = "";
  const sections = ((page.data?.toc ?? []) as TocEntry[]).filter((t) => {
    if (t.depth === 2) section = t.url;
    return t.depth === 2 || (t.depth === 3 && section !== "#bug-fixes");
  });

  return (
    <main className="grow container px-4 py-12 md:py-20">
      <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12">
        <article className="min-w-0 max-w-3xl">
          <nav aria-label="Breadcrumb" className={LABEL}>
            <Link href="/blog" className="hover:text-[var(--ui-color)]">
              Blog
            </Link>
          </nav>
          <h1 className="mt-4 text-4xl md:text-[52px] font-semibold tracking-[-0.03em] leading-[1.05]">
            <InlineCodeTitle text={title} />
          </h1>
          <div className="mt-4 lg:hidden">
            <MetaLine author={author} date={date} />
          </div>
          {/* the docs page's mdx setup, so headings, callouts and tabs render as they do in the docs */}
          <div className="prose prose-lg blog-prose min-w-0 mt-8">
            <Mdx
              components={{
                ...defaultMdxComponents,
                a: createRelativeLink(blog, page),
                blockquote: Callout,
                Tab,
                Tabs,
                h1: (props: any) => <Heading as="h1" {...props} />,
                h2: (props: any) => <Heading as="h2" {...props} />,
                h3: (props: any) => <Heading as="h3" {...props} />,
                h4: (props: any) => <Heading as="h4" {...props} />,
                h5: (props: any) => <Heading as="h5" {...props} />,
                h6: (props: any) => <Heading as="h6" {...props} />,
              }}
            />
          </div>
          <footer className="mt-12 pt-6 border-t border-fd-border">
            <MetaLine author={author} date={date} />
          </footer>
        </article>
        <aside className="hidden lg:block lg:sticky lg:top-[calc(var(--fd-banner-height)+6rem)] self-start text-sm">
          <dl className="grid gap-y-5">
            {date ? (
              <div>
                <dt className={LABEL}>Published</dt>
                <dd className="mt-1">
                  <time dateTime={date.toISOString()}>{formatDate(date, "long")}</time>
                </dd>
              </div>
            ) : null}
            <div>
              <dt className={LABEL}>Author</dt>
              <dd className="mt-1">
                <a href={AUTHOR_URL} className="hover:text-[var(--ui-color)]">
                  {author}
                </a>
              </dd>
            </div>
          </dl>
          <BlogToc sections={sections} labelClassName={LABEL} />
        </aside>
      </div>
    </main>
  );
}

export function generateStaticParams(): { slug: string }[] {
  return blog
    .getPages()
    .filter((page) => !isHidden(page))
    .map((page) => ({
      slug: page.slugs[0],
    }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const page = blog.getPage([params.slug]) as any;

  if (!page || isHidden(page)) notFound();

  const title = stripBackticks((page.data?.title as string | undefined) ?? params.slug);
  const description = (page.data?.description as string | undefined) ?? undefined;
  const url = `https://zod.dev/blog/${params.slug}`;
  // same generated card the docs pages use
  const image = {
    url: `/og.png?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description ?? "")}&path=${encodeURIComponent(`zod.dev/blog/${params.slug}`)}`,
    width: 1200,
    height: 630,
    alt: title,
  };

  return {
    title,
    description,
    openGraph: { type: "article", title, description, siteName: "Zod", url, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image], creator: "@colinhacks", site: "@colinhacks" },
  };
}
