import Link from "next/link";
import { AUTHOR_URL, type IndexProps, type PostProps, formatDate, groupByYear } from "./shared";

function Gem() {
  return (
    <span aria-hidden className="inline-block size-2 rotate-45 bg-[var(--ui-color)]" style={{ verticalAlign: "0.1em" }} />
  );
}

function Meta({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-fd-muted-foreground">{children}</p>;
}

export function Index({ posts }: IndexProps) {
  return (
    <main className="grow container px-4 py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <header className="mb-16 md:mb-24">
          <Meta>The Zod blog</Meta>
          <h1 className="font-serif text-6xl md:text-[88px] leading-[0.95] tracking-[-0.01em] mt-4">
            Notes from <em className="text-[var(--ui-color)]">the project</em>
          </h1>
          <p className="font-serif italic text-2xl md:text-[28px] leading-snug text-fd-muted-foreground mt-6 max-w-[28ch]">
            Announcements, design decisions, and the occasional funding story.
          </p>
        </header>

        <ol>
          {groupByYear(posts).map(([year, group]) => (
            <li key={year} className="grid md:grid-cols-[6rem_1fr] border-t border-fd-border">
              <p className="font-serif text-3xl text-fd-muted-foreground pt-7 md:pt-8">{year}</p>
              <ol>
                {group.map((post, i) => (
                  <li key={post.slug} className={i > 0 ? "border-t border-fd-border" : ""}>
                    <Link href={post.url} className="group block py-7 md:py-8">
                      <h2 className="font-serif text-3xl md:text-[40px] leading-[1.08] group-hover:text-[var(--ui-color)] transition-colors">
                        {post.title}
                      </h2>
                      <p className="mt-3 text-fd-muted-foreground text-[17px] leading-relaxed max-w-[52ch]">{post.description}</p>
                      <div className="mt-4">
                        <Meta>
                          {formatDate(post.date, "long")} <span className="mx-1.5 opacity-50">/</span> {post.minutes} min
                        </Meta>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
        <div className="border-t border-fd-border" />
      </div>
    </main>
  );
}

export function Post({ title, description, date, author, minutes, backHref, Mdx, components }: PostProps) {
  return (
    <main className="grow container px-4">
      <header className="mx-auto max-w-3xl pt-14 md:pt-20">
        <Link href={backHref} className="inline-block hover:text-[var(--ui-color)]">
          <Meta>
            <Gem /> <span className="ml-2">Blog</span>
          </Meta>
        </Link>
        <h1 className="font-serif text-5xl md:text-[68px] leading-[1.02] tracking-[-0.01em] mt-6">{title}</h1>
        {description ? (
          <p className="font-serif italic text-2xl md:text-[27px] leading-snug text-fd-muted-foreground mt-5 max-w-[34ch]">
            {description}
          </p>
        ) : null}
        <div className="mt-8 flex items-center gap-3">
          <Meta>
            <a href={AUTHOR_URL} className="text-fd-foreground hover:text-[var(--ui-color)]">
              {author}
            </a>
            {date ? (
              <>
                <span className="mx-1.5 opacity-50">/</span>
                <time dateTime={date.toISOString()}>{formatDate(date, "long")}</time>
                <span className="mx-1.5 opacity-50">/</span>
                {minutes} min
              </>
            ) : null}
          </Meta>
        </div>
      </header>

      <div className="mx-auto max-w-3xl my-12 md:my-16 flex items-center gap-4 text-fd-border">
        <span className="h-px grow bg-current" />
        <Gem />
        <span className="h-px grow bg-current" />
      </div>

      <article className="mx-auto max-w-3xl pb-20">
        <div className="prose prose-lg min-w-0">
          <Mdx components={components} />
        </div>
        <footer className="mt-16 pt-8 border-t border-fd-border flex flex-wrap items-baseline justify-between gap-4">
          <p className="font-serif italic text-xl text-fd-muted-foreground">
            Written by{" "}
            <a href={AUTHOR_URL} className="text-fd-foreground hover:text-[var(--ui-color)]">
              {author}
            </a>
            {date ? <> on {formatDate(date, "long")}</> : null}
          </p>
          <Link href={backHref} className="hover:text-[var(--ui-color)]">
            <Meta>All posts →</Meta>
          </Link>
        </footer>
      </article>
    </main>
  );
}
