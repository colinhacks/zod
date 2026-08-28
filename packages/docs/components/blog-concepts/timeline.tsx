import Link from "next/link";
import { AUTHOR_URL, type IndexProps, type PostProps, formatDate } from "./shared";

function Diamond({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block size-2.5 rotate-45 border-[1.5px] border-[var(--ui-color)] bg-fd-background ${className}`}
    />
  );
}

export function Index({ posts }: IndexProps) {
  const years = new Set(posts.map((p) => p.date.getUTCFullYear()));
  const since = Math.min(...years);
  let lastYear: number | undefined;

  return (
    <main className="grow container px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl grid gap-12 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-20">
        <aside className="lg:sticky lg:top-24 self-start">
          <p className="font-mono text-xs text-[var(--ui-color)]">~/zod/blog</p>
          <h1 className="text-4xl font-semibold tracking-tight mt-3">Blog</h1>
          <p className="mt-4 text-fd-muted-foreground leading-relaxed">
            Release write-ups, design notes, and announcements from the project.
          </p>
          <dl className="mt-8 font-mono text-xs text-fd-muted-foreground grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            <dt>posts</dt>
            <dd className="text-fd-foreground tabular-nums">{posts.length}</dd>
            <dt>since</dt>
            <dd className="text-fd-foreground tabular-nums">{since}</dd>
            <dt>author</dt>
            <dd>
              <a href={AUTHOR_URL} className="text-fd-foreground hover:text-[var(--ui-color)]">
                @colinhacks
              </a>
            </dd>
          </dl>
        </aside>

        <ol className="relative ml-1.5 border-l border-fd-border">
          {posts.map((post) => {
            const year = post.date.getUTCFullYear();
            const showYear = year !== lastYear;
            lastYear = year;
            return (
              <li key={post.slug} className="relative pl-8 md:pl-10 pb-12 last:pb-0">
                {showYear ? (
                  <p className="font-mono text-xs text-fd-muted-foreground mb-4 -mt-1">
                    <span className="inline-block w-4 border-t border-fd-border align-middle -ml-8 md:-ml-10 mr-4" />
                    {year}
                  </p>
                ) : null}
                <div className="relative">
                  <Diamond className="absolute -left-[calc(2rem+6px)] md:-left-[calc(2.5rem+6px)] top-[0.45rem]" />
                  <p className="font-mono text-xs text-fd-muted-foreground tabular-nums">
                    {formatDate(post.date, "iso")}
                    <span className="mx-2 opacity-40">·</span>
                    {post.minutes} min
                  </p>
                  <Link href={post.url} className="group block mt-2">
                    <h2 className="text-2xl md:text-[26px] font-semibold tracking-tight leading-snug group-hover:text-[var(--ui-color)] transition-colors">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-fd-muted-foreground leading-relaxed max-w-[56ch]">{post.description}</p>
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}

export function Post({ title, description, date, author, minutes, backHref, Mdx, components }: PostProps) {
  return (
    <main className="grow container px-4">
      <header className="mx-auto max-w-3xl pt-14 md:pt-20">
        <p className="font-mono text-xs text-fd-muted-foreground">
          <Link href={backHref} className="text-[var(--ui-color)] hover:underline underline-offset-4">
            ~/zod/blog
          </Link>
          {date ? (
            <>
              <span className="mx-2 opacity-40">/</span>
              <time dateTime={date.toISOString()}>{formatDate(date, "iso")}</time>
            </>
          ) : null}
          <span className="mx-2 opacity-40">·</span>
          {minutes} min
        </p>
        <h1 className="text-4xl md:text-[52px] font-semibold tracking-tight leading-[1.08] mt-5">{title}</h1>
        {description ? <p className="mt-4 text-lg md:text-xl text-fd-muted-foreground leading-relaxed max-w-[56ch]">{description}</p> : null}
        <div className="mt-8 flex items-center gap-3 text-sm">
          <Diamond />
          <a href={AUTHOR_URL} className="font-medium hover:text-[var(--ui-color)]">
            {author}
          </a>
        </div>
      </header>

      <article className="mx-auto max-w-3xl py-12 md:py-16">
        <div className="prose prose-lg min-w-0">
          <Mdx components={components} />
        </div>
        <footer className="mt-16 pt-6 border-t border-fd-border font-mono text-xs text-fd-muted-foreground flex justify-between">
          <Link href={backHref} className="hover:text-[var(--ui-color)]">
            ← all posts
          </Link>
          {date ? <span className="tabular-nums">{formatDate(date, "iso")}</span> : null}
        </footer>
      </article>
    </main>
  );
}
