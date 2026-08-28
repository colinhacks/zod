import { baseOptions } from "@/app/layout.config";
import { postConcepts } from "@/components/blog-concepts/post";
import { blog } from "@/loaders/source";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import Link from "next/link";

// review-only chooser for the blog post concepts
export default function ConceptChooserPage() {
  const sample = (blog.getPages() as any[]).find((p) => p.slugs[0] === "zod-4-5")?.slugs[0] ?? blog.getPages()[0]?.slugs[0];
  return (
    <HomeLayout {...baseOptions}>
      <main className="grow container px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">Blog post concepts</h1>
          <p className="mt-2 text-fd-muted-foreground">
            Each renders the real posts with the docs' heading, callout and tab components. The index at <Link href="/blog" className="underline underline-offset-4">/blog</Link> is already the chosen list layout.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {Object.entries(postConcepts).map(([name, c]) => (
              <li key={name} className="rounded-xl border border-fd-border p-5">
                <h2 className="font-semibold">{c.label}</h2>
                <p className="mt-1 text-sm text-fd-muted-foreground">{c.blurb}</p>
                <p className="mt-4 flex gap-4 text-sm">
                  {sample ? (
                    <Link href={`/blog-concepts/${name}/${sample}`} className="underline underline-offset-4 hover:text-[var(--ui-color)]">
                      Open
                    </Link>
                  ) : null}
                  <Link href={`/blog-concepts/${name}`} className="underline underline-offset-4 hover:text-[var(--ui-color)]">
                    All posts
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </HomeLayout>
  );
}
