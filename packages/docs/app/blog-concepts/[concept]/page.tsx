import { concepts } from "@/components/blog-concepts";
import { type PostItem, minutesFor, samplePosts } from "@/components/blog-concepts/shared";
import { blog } from "@/loaders/source";
import { notFound } from "next/navigation";

export default async function ConceptIndexPage(props: { params: Promise<{ concept: string }> }) {
  const { concept } = await props.params;
  const c = concepts[concept];
  if (!c) notFound();

  const pages = blog.getPages() as any[];
  const real: PostItem[] = pages.map((page) => ({
    slug: page.slugs[0],
    title: page.data.title ?? page.slugs.join("/"),
    description: page.data.description ?? "",
    date: new Date(page.data.date),
    author: page.data.author ?? "Colin McDonnell",
    url: `/blog-concepts/${concept}/${page.slugs[0]}`,
    minutes: minutesFor(page),
  }));
  // placeholder rows link to the real post so every row opens something
  const samples: PostItem[] = samplePosts.map((s) => ({ ...s, url: real[0]?.url ?? `/blog-concepts/${concept}` }));
  const posts = [...real, ...samples].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className={`${c.className} flex grow flex-col`}>
      <c.Index posts={posts} />
    </div>
  );
}

export function generateStaticParams(): { concept: string }[] {
  return Object.keys(concepts).map((concept) => ({ concept }));
}
