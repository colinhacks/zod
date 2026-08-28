import { concepts } from "@/components/blog-concepts";
import { minutesFor } from "@/components/blog-concepts/shared";
import { blog } from "@/loaders/source";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";

export default async function ConceptPostPage(props: { params: Promise<{ concept: string; slug: string }> }) {
  const { concept, slug } = await props.params;
  const c = concepts[concept];
  const page = blog.getPage([slug]) as any;
  if (!c || !page) notFound();

  const dateValue = page.data?.date as string | Date | undefined;
  return (
    <div className={`${c.className} flex grow flex-col`}>
      <c.Post
        title={page.data.title ?? slug}
        description={page.data.description}
        date={dateValue ? new Date(dateValue) : undefined}
        author={page.data.author ?? "Colin McDonnell"}
        minutes={minutesFor(page)}
        toc={page.data.toc ?? []}
        backHref={`/blog-concepts/${concept}`}
        Mdx={page.data.body as ComponentType<any>}
        components={defaultMdxComponents}
      />
    </div>
  );
}

export function generateStaticParams(): { concept: string; slug: string }[] {
  return Object.keys(concepts).flatMap((concept) => blog.getPages().map((page) => ({ concept, slug: page.slugs[0] })));
}
