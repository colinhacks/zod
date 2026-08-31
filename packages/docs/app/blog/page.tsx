import { InlineCodeTitle } from "@/components/inline-code-title";
import { blog, formatDate } from "@/loaders/source";
import Link from "next/link";

export const revalidate = false;

export default function BlogIndexPage() {
  const posts = (blog.getPages() as any[])
    .filter((post) => !post.data?.draft)
    .sort((a, b) => new Date(b.data?.date ?? 0).getTime() - new Date(a.data?.date ?? 0).getTime());

  return (
    <main className="grow container px-4 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <h1 className="flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-fd-muted-foreground">
          Blog
          <span className="flex items-baseline gap-4">
            <a href="/blog/rss.xml" className="hover:text-[var(--ui-color)] transition-colors">
              RSS
            </a>
            <span className="tabular-nums">{posts.length} posts</span>
          </span>
        </h1>
        <ul>
          {posts.map((post) => {
            const title = post.data.title ?? post.slugs.join("/") ?? "Untitled";
            const description = post.data.description ?? "";
            const dateValue = post.data?.date as string | Date | undefined;
            return (
              <li key={post.url} className="border-b border-fd-border">
                <Link
                  href={post.url}
                  className="group grid gap-x-10 gap-y-3 py-9 md:grid-cols-[minmax(0,1fr)_9rem] md:py-11 items-baseline"
                >
                  <div>
                    <h2 className="text-3xl md:text-[42px] font-semibold tracking-[-0.03em] leading-[1.05] group-hover:text-[var(--ui-color)] transition-colors">
                      <InlineCodeTitle text={title} />
                    </h2>
                    {description ? (
                      <p className="mt-4 text-fd-muted-foreground text-[17px] leading-relaxed max-w-[54ch]">
                        {description}
                      </p>
                    ) : null}
                  </div>
                  {dateValue ? (
                    <time
                      dateTime={new Date(dateValue).toISOString()}
                      className="text-sm text-fd-muted-foreground tabular-nums md:text-right md:pt-2 order-first md:order-none"
                    >
                      {formatDate(dateValue)}
                    </time>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
