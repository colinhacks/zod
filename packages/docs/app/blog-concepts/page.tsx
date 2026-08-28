import { concepts } from "@/components/blog-concepts";
import { blog } from "@/loaders/source";
import Link from "next/link";

export default function ConceptChooserPage() {
  const firstSlug = blog.getPages()[0]?.slugs[0];
  return (
    <main className="grow container px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Blog concepts</h1>
        <p className="mt-2 text-fd-muted-foreground">Review-only. Each concept renders the real post plus placeholder index rows.</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {Object.entries(concepts).map(([name, c]) => (
            <li key={name} className="rounded-xl border border-fd-border p-5">
              <h2 className="font-semibold">{c.label}</h2>
              <p className="mt-1 text-sm text-fd-muted-foreground">{c.blurb}</p>
              <p className="mt-4 flex gap-4 text-sm">
                <Link href={`/blog-concepts/${name}`} className="underline underline-offset-4 hover:text-[var(--ui-color)]">
                  Index
                </Link>
                {firstSlug ? (
                  <Link href={`/blog-concepts/${name}/${firstSlug}`} className="underline underline-offset-4 hover:text-[var(--ui-color)]">
                    Post
                  </Link>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
