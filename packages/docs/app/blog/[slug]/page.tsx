import { Heading } from "@/components/heading";
import { Tabs } from "@/components/tabs";
import { blog, formatDate, readingMinutes } from "@/loaders/source";
import { Callout } from "fumadocs-ui/components/callout";
import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType, ReactNode } from "react";

export const revalidate = false;

const AUTHOR_URL = "https://x.com/colinhacks";
const LABEL = "text-[11px] font-medium uppercase tracking-[0.16em] text-fd-muted-foreground";

interface TocEntry {
  title: ReactNode;
  url: string;
  depth: number;
}

function MetaLine({ author, date, minutes }: { author: string; date?: Date; minutes: number }) {
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
      <span className="opacity-50">·</span>
      <span>{minutes} min read</span>
    </p>
  );
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const page = blog.getPage([params.slug]) as any;

  if (!page) notFound();
  const Mdx = page.data.body as ComponentType<any>;
  const title: string = page.data?.title ?? params.slug;
  const author: string = page.data?.author ?? "Colin McDonnell";
  const date = page.data?.date ? new Date(page.data.date) : undefined;
  const minutes = readingMinutes(page);
  const sections = ((page.data?.toc ?? []) as TocEntry[]).filter((t) => t.depth === 2);

  return (
    <main className="grow container px-4 py-12 md:py-20">
      <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12">
        <article className="min-w-0 max-w-3xl">
          <p className="text-sm text-fd-muted-foreground lg:hidden">
            <Link href="/blog" className="hover:text-[var(--ui-color)]">
              ← Blog
            </Link>
          </p>
          <h1 className="mt-4 lg:mt-0 text-4xl md:text-[52px] font-semibold tracking-[-0.03em] leading-[1.05]">
            {title}
          </h1>
          <div className="mt-4 lg:hidden">
            <MetaLine author={author} date={date} minutes={minutes} />
          </div>
          {/* the docs page's mdx setup, so headings, callouts and tabs render as they do in the docs */}
          <div className="prose prose-lg blog-prose min-w-0 mt-8">
            <Mdx
              components={{
                ...defaultMdxComponents,
                a: createRelativeLink(blog, page),
                blockquote: Callout,
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
            <MetaLine author={author} date={date} minutes={minutes} />
          </footer>
        </article>
        <aside className="hidden lg:block lg:sticky lg:top-24 self-start text-sm">
          <Link href="/blog" className="text-fd-muted-foreground hover:text-[var(--ui-color)]">
            ← Blog
          </Link>
          <dl className="mt-8 grid gap-y-5">
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
            <div>
              <dt className={LABEL}>Reading time</dt>
              <dd className="mt-1">{minutes} min</dd>
            </div>
          </dl>
          {sections.length ? (
            <nav className="mt-8">
              <p className={LABEL}>On this page</p>
              <ol className="mt-2 border-l border-fd-border">
                {sections.map((t) => (
                  <li key={t.url}>
                    <a
                      href={t.url}
                      className="block -ml-px border-l border-transparent pl-4 py-1 text-fd-muted-foreground hover:text-fd-foreground hover:border-[var(--ui-color)]"
                    >
                      {t.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
        </aside>
      </div>
    </main>
  );
}

export function generateStaticParams(): { slug: string }[] {
  return blog.getPages().map((page) => ({
    slug: page.slugs[0],
  }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const page = blog.getPage([params.slug]) as any;

  if (!page) notFound();

  return {
    title: (page.data?.title as string | undefined) ?? params.slug,
    description: (page.data?.description as string | undefined) ?? undefined,
  };
}
