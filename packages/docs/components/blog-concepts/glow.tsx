import Image from "next/image";
import Link from "next/link";
import { AUTHOR_URL, AVATAR, type IndexProps, type PostProps, formatDate } from "./shared";

// the site's hero glow, reused as a wash behind the header: blue from the logo, magenta from the accent
const GLOW =
  "radial-gradient(42% 55% at 30% 0%, color-mix(in oklab, #4f8ef7 22%, transparent), transparent 70%), radial-gradient(38% 50% at 72% 8%, color-mix(in oklab, var(--ui-color) 16%, transparent), transparent 70%)";

// cards are links themselves, so the byline inside them must not nest another anchor
function Byline({ author, date, link = true }: { author: string; date?: Date; link?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Image src={AVATAR} alt="" width={28} height={28} className="rounded-full size-7" />
      {link ? (
        <a href={AUTHOR_URL} className="font-medium hover:text-[var(--ui-color)]">
          {author}
        </a>
      ) : (
        <span className="font-medium">{author}</span>
      )}
      {date ? (
        <>
          <span className="text-fd-muted-foreground/60">·</span>
          <time dateTime={date.toISOString()} className="text-fd-muted-foreground">
            {formatDate(date)}
          </time>
        </>
      ) : null}
    </div>
  );
}

export function Index({ posts }: IndexProps) {
  const [featured, ...rest] = posts;
  return (
    <main className="grow">
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10" style={{ background: GLOW }} />
        <div className="container px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">Blog</h1>
            <p className="mt-4 text-lg text-fd-muted-foreground max-w-[44ch]">
              Release announcements, design notes, and deep dives from the Zod project.
            </p>
          </div>
        </div>
      </section>

      <div className="container px-4 pb-20">
        <div className="mx-auto max-w-4xl">
          {featured ? (
            <Link
              href={featured.url}
              className="group relative block rounded-3xl border border-fd-border overflow-hidden p-8 md:p-12 transition-shadow hover:shadow-[0_0_0_4px_color-mix(in_oklab,var(--ui-color)_18%,transparent)]"
            >
              <div
                aria-hidden
                className="absolute inset-0 -z-10 opacity-80 group-hover:opacity-100 transition-opacity"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in oklab, #4f8ef7 12%, transparent), transparent 50%, color-mix(in oklab, var(--ui-color) 12%, transparent))",
                }}
              />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ui-color)]/30 bg-fd-background/60 px-2.5 py-0.5 text-xs font-medium text-[var(--ui-color)]">
                Latest
              </span>
              <h2 className="mt-5 text-3xl md:text-[40px] font-bold tracking-tight leading-[1.1] max-w-[22ch]">{featured.title}</h2>
              <p className="mt-4 text-fd-muted-foreground text-lg leading-relaxed max-w-[52ch]">{featured.description}</p>
              <div className="mt-8">
                <Byline author={featured.author} date={featured.date} link={false} />
              </div>
            </Link>
          ) : null}

          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {rest.map((post) => (
              <li key={post.slug}>
                <Link
                  href={post.url}
                  className="group flex h-full flex-col rounded-2xl border border-fd-border bg-fd-card p-6 md:p-7 transition-all hover:border-[var(--ui-color)]/50 hover:shadow-[0_0_0_4px_color-mix(in_oklab,var(--ui-color)_12%,transparent)]"
                >
                  <time dateTime={post.date.toISOString()} className="text-xs font-medium text-fd-muted-foreground">
                    {formatDate(post.date)}
                  </time>
                  <h3 className="mt-3 text-xl md:text-[22px] font-semibold tracking-tight leading-snug group-hover:text-[var(--ui-color)] transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-fd-muted-foreground leading-relaxed grow">{post.description}</p>
                  <p className="mt-5 text-sm font-medium text-fd-muted-foreground group-hover:text-[var(--ui-color)] transition-colors">
                    Read post →
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

export function Post({ title, description, date, author, backHref, Mdx, components }: PostProps) {
  return (
    <main className="grow">
      <header className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10" style={{ background: GLOW }} />
        <div className="container px-4 pt-14 pb-12 md:pt-20 md:pb-16">
          <div className="mx-auto max-w-3xl">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-fd-border bg-fd-background/70 backdrop-blur px-3 py-1 text-xs font-medium text-fd-muted-foreground hover:text-fd-foreground hover:border-[var(--ui-color)]/50"
            >
              ← Blog
            </Link>
            <h1 className="mt-6 text-4xl md:text-[56px] font-extrabold tracking-tight leading-[1.05]">{title}</h1>
            {description ? <p className="mt-5 text-lg md:text-xl text-fd-muted-foreground leading-relaxed max-w-[56ch]">{description}</p> : null}
            <div className="mt-8">
              <Byline author={author} date={date} />
            </div>
          </div>
        </div>
      </header>

      <article className="container px-4 py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="prose prose-lg min-w-0">
            <Mdx components={components} />
          </div>
          <footer className="mt-16 rounded-2xl border border-fd-border p-6 md:p-8 flex flex-wrap items-center justify-between gap-6">
            <Byline author={author} date={date} />
            <Link
              href={backHref}
              className="rounded-full bg-[var(--ui-color)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:text-fd-background"
            >
              More posts
            </Link>
          </footer>
        </div>
      </article>
    </main>
  );
}
