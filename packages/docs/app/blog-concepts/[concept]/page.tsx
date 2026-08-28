import { baseOptions } from "@/app/layout.config";
import { postConcepts } from "@/components/blog-concepts/post";
import { blog, formatDate } from "@/loaders/source";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import Link from "next/link";
import { notFound } from "next/navigation";

// review-only: lists every post under one post concept so the concept can be browsed end to end
export default async function ConceptIndexPage(props: { params: Promise<{ concept: string }> }) {
  const { concept } = await props.params;
  const c = postConcepts[concept];
  if (!c) notFound();
  const posts = (blog.getPages() as any[]).sort(
    (a, b) => new Date(b.data?.date ?? 0).getTime() - new Date(a.data?.date ?? 0).getTime()
  );
  return (
    <HomeLayout {...baseOptions}>
      <main className="grow container px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-fd-muted-foreground">
            <Link href="/blog-concepts" className="hover:text-fd-foreground">
              ← All post concepts
            </Link>
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{c.label}</h1>
          <p className="mt-2 text-fd-muted-foreground">{c.blurb}</p>
          <ul className="mt-8 divide-y divide-fd-border border-y border-fd-border">
            {posts.map((post) => (
              <li key={post.url}>
                <Link href={`/blog-concepts/${concept}/${post.slugs[0]}`} className="flex justify-between gap-6 py-4 hover:text-[var(--ui-color)]">
                  <span className="font-medium">{post.data.title}</span>
                  {post.data.date ? <span className="text-sm text-fd-muted-foreground tabular-nums shrink-0">{formatDate(post.data.date)}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </HomeLayout>
  );
}

export function generateStaticParams(): { concept: string }[] {
  return Object.keys(postConcepts).map((concept) => ({ concept }));
}
