import { baseOptions } from "@/app/layout.config";
import { Heading } from "@/components/heading";
import { Tabs } from "@/components/tabs";
import { blog, formatDate, readingMinutes } from "@/loaders/source";
import type { PageTree } from "fumadocs-core/server";
import { Callout } from "fumadocs-ui/components/callout";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsPage, DocsTitle } from "fumadocs-ui/page";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

const AUTHOR_URL = "https://x.com/colinhacks";

export interface PostConcept {
  label: string;
  blurb: string;
  Post: ComponentType<{ page: any; concept: string }>;
}

interface TocEntry {
  title: ReactNode;
  url: string;
  depth: number;
}

// the docs page's mdx setup, so headings, callouts and tabs render exactly as they do in the docs
function Body({ page, className = "" }: { page: any; className?: string }) {
  const Mdx = page.data.body as ComponentType<any>;
  return (
    <div className={`prose blog-prose min-w-0 ${className}`}>
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
  );
}

function meta(page: any) {
  const date = page.data?.date ? new Date(page.data.date) : undefined;
  return {
    title: (page.data?.title as string | undefined) ?? page.slugs.join("/"),
    author: (page.data?.author as string | undefined) ?? "Colin McDonnell",
    date,
    minutes: readingMinutes(page),
    toc: ((page.data?.toc ?? []) as TocEntry[]).filter((t) => t.depth <= 3),
  };
}

function MetaLine({ page }: { page: any }) {
  const { author, date, minutes } = meta(page);
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

function sortedPosts() {
  return (blog.getPages() as any[]).sort(
    (a, b) => new Date(b.data?.date ?? 0).getTime() - new Date(a.data?.date ?? 0).getTime()
  );
}

// 1. the post is a docs page: sidebar of posts, clerk-style toc on the right, docs body size
function DocsPost({ page, concept }: { page: any; concept: string }) {
  const { title, toc } = meta(page);
  const tree: PageTree.Root = {
    name: "Blog",
    children: sortedPosts().map((p) => ({
      type: "page",
      name: p.data.title ?? p.slugs.join("/"),
      url: `/blog-concepts/${concept}/${p.slugs[0]}`,
    })),
  };
  return (
    <DocsLayout {...baseOptions} tree={tree} sidebar={{ collapsible: false, prefetch: false, tabs: false }}>
      <DocsPage toc={toc} tableOfContent={{ style: "clerk", single: false }} full={false}>
        <div className="mb-6">
          <DocsTitle>{title}</DocsTitle>
          <div className="mt-3">
            <MetaLine page={page} />
          </div>
        </div>
        <DocsBody>
          <Body page={page} className="text-[17px] leading-7" />
        </DocsBody>
      </DocsPage>
    </DocsLayout>
  );
}

// 2. one reading column at docs width, an inline "on this page" box under the header
function ColumnPost({ page, concept }: { page: any; concept: string }) {
  const { title, toc } = meta(page);
  const sections = toc.filter((t) => t.depth === 2);
  return (
    <HomeLayout {...baseOptions}>
      <main className="grow container px-4">
        <div className="mx-auto max-w-3xl py-10 md:py-14">
          <Link href={`/blog-concepts/${concept}`} className="text-sm text-fd-muted-foreground hover:text-fd-foreground">
            ← Blog
          </Link>
          <h1 className="mt-6 text-4xl md:text-[44px] font-bold tracking-tight leading-[1.15]">{title}</h1>
          <div className="mt-4">
            <MetaLine page={page} />
          </div>
          {sections.length ? (
            <nav className="mt-8 rounded-lg border border-fd-border bg-fd-secondary/40 px-5 py-4 text-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-fd-muted-foreground">On this page</p>
              <ol className="mt-2 columns-1 sm:columns-2 gap-x-8">
                {sections.map((t) => (
                  <li key={t.url} className="py-0.5 break-inside-avoid">
                    <a href={t.url} className="text-fd-muted-foreground hover:text-fd-foreground">
                      {t.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <Body page={page} className="mt-10 text-[17px] leading-[1.8]" />
          <footer className="mt-12 pt-6 border-t border-fd-border">
            <MetaLine page={page} />
          </footer>
        </div>
      </main>
    </HomeLayout>
  );
}

// 3. article on the left at docs width, sticky right gutter with the meta and toc, prose-lg body
function MarginPost({ page, concept }: { page: any; concept: string }) {
  const { title, author, date, minutes, toc } = meta(page);
  const sections = toc.filter((t) => t.depth === 2);
  const label = "text-[11px] font-medium uppercase tracking-[0.16em] text-fd-muted-foreground";
  return (
    <HomeLayout {...baseOptions}>
      <main className="grow container px-4 py-12 md:py-20">
        <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12">
          <article className="min-w-0 max-w-3xl">
            <p className="text-sm text-fd-muted-foreground lg:hidden">
              <Link href={`/blog-concepts/${concept}`} className="hover:text-[var(--ui-color)]">
                ← Blog
              </Link>
            </p>
            <h1 className="mt-4 lg:mt-0 text-4xl md:text-[52px] font-semibold tracking-[-0.03em] leading-[1.05]">{title}</h1>
            <div className="mt-4 lg:hidden">
              <MetaLine page={page} />
            </div>
            <Body page={page} className="prose-lg mt-8" />
            <footer className="mt-12 pt-6 border-t border-fd-border">
              <MetaLine page={page} />
            </footer>
          </article>
          <aside className="hidden lg:block lg:sticky lg:top-24 self-start text-sm">
            <Link href={`/blog-concepts/${concept}`} className="text-fd-muted-foreground hover:text-[var(--ui-color)]">
              ← Blog
            </Link>
            <dl className="mt-8 grid gap-y-5">
              {date ? (
                <div>
                  <dt className={label}>Published</dt>
                  <dd className="mt-1">
                    <time dateTime={date.toISOString()}>{formatDate(date, "long")}</time>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className={label}>Author</dt>
                <dd className="mt-1">
                  <a href={AUTHOR_URL} className="hover:text-[var(--ui-color)]">
                    {author}
                  </a>
                </dd>
              </div>
              <div>
                <dt className={label}>Reading time</dt>
                <dd className="mt-1">{minutes} min</dd>
              </div>
            </dl>
            {sections.length ? (
              <nav className="mt-8">
                <p className={label}>On this page</p>
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
    </HomeLayout>
  );
}

export const postConcepts: Record<string, PostConcept> = {
  docs: {
    label: "Docs page",
    blurb: "The post is a docs page: sidebar of posts, table of contents on the right, docs body size (17px).",
    Post: DocsPost,
  },
  column: {
    label: "Reading column",
    blurb: "One centered column at docs width, an inline “on this page” box under the header, 17px body with looser leading.",
    Post: ColumnPost,
  },
  margin: {
    label: "Margin",
    blurb: "Article at docs width, sticky right gutter with date, author, reading time and table of contents; 18px body.",
    Post: MarginPost,
  },
};
