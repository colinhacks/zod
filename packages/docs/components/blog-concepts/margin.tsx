import Image from "next/image";
import Link from "next/link";
import { AUTHOR_URL, AVATAR, type IndexProps, type PostProps, formatDate } from "./shared";

function Label({ children }: { children: React.ReactNode }) {
  return <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-fd-muted-foreground">{children}</dt>;
}

export function Index({ posts }: IndexProps) {
  return (
    <main className="grow container px-4 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-baseline justify-between">
          <h1 className="text-[11px] font-medium uppercase tracking-[0.18em] text-fd-muted-foreground">Blog</h1>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-fd-muted-foreground tabular-nums">
            {posts.length} posts
          </p>
        </div>
        <ul className="mt-8 border-t border-fd-border">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-fd-border">
              <Link href={post.url} className="group grid gap-x-10 gap-y-3 py-9 md:grid-cols-[minmax(0,1fr)_9rem] md:py-11 items-baseline">
                <div>
                  <h2 className="text-3xl md:text-[42px] font-semibold tracking-[-0.03em] leading-[1.05] group-hover:text-[var(--ui-color)] transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-4 text-fd-muted-foreground text-[17px] leading-relaxed max-w-[54ch]">{post.description}</p>
                </div>
                <time
                  dateTime={post.date.toISOString()}
                  className="text-sm text-fd-muted-foreground tabular-nums md:text-right md:pt-2 order-first md:order-none"
                >
                  {formatDate(post.date)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export function Post({ title, description, date, author, minutes, toc, backHref, Mdx, components }: PostProps) {
  const headings = toc.filter((h) => h.depth <= 2);
  return (
    <main className="grow container px-4 py-12 md:py-20">
      <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-20">
        <aside className="lg:sticky lg:top-24 self-start text-sm mb-10 lg:mb-0">
          <Link href={backHref} className="text-fd-muted-foreground hover:text-[var(--ui-color)]">
            ← Blog
          </Link>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-1">
            {date ? (
              <div>
                <Label>Published</Label>
                <dd className="mt-1">
                  <time dateTime={date.toISOString()}>{formatDate(date, "long")}</time>
                </dd>
              </div>
            ) : null}
            <div>
              <Label>Author</Label>
              <dd className="mt-1.5 flex items-center gap-2">
                <Image src={AVATAR} alt="" width={20} height={20} className="rounded-full size-5" />
                <a href={AUTHOR_URL} className="hover:text-[var(--ui-color)]">
                  {author}
                </a>
              </dd>
            </div>
            <div>
              <Label>Reading time</Label>
              <dd className="mt-1">{minutes} min</dd>
            </div>
          </dl>
          {headings.length ? (
            <nav className="mt-8 hidden lg:block">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-fd-muted-foreground">On this page</p>
              <ol className="mt-2 border-l border-fd-border">
                {headings.map((h) => (
                  <li key={h.url}>
                    <a
                      href={h.url}
                      className="block -ml-px border-l border-transparent pl-4 py-1 text-fd-muted-foreground hover:text-fd-foreground hover:border-[var(--ui-color)]"
                    >
                      {h.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
        </aside>

        <article className="min-w-0">
          <h1 className="text-4xl md:text-[60px] font-semibold tracking-[-0.035em] leading-[1.02] max-w-[18ch]">{title}</h1>
          {description ? <p className="mt-6 text-xl text-fd-muted-foreground leading-relaxed max-w-[50ch]">{description}</p> : null}
          <div className="prose prose-lg min-w-0 mt-10 max-w-[68ch]">
            <Mdx components={components} />
          </div>
          <footer className="mt-16 pt-6 border-t border-fd-border text-sm text-fd-muted-foreground max-w-[68ch]">
            <Link href={backHref} className="hover:text-[var(--ui-color)]">
              ← All posts
            </Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
