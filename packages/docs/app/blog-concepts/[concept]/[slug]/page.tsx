import { postConcepts } from "@/components/blog-concepts/post";
import { blog } from "@/loaders/source";
import { notFound } from "next/navigation";

export default async function ConceptPostPage(props: { params: Promise<{ concept: string; slug: string }> }) {
  const { concept, slug } = await props.params;
  const c = postConcepts[concept];
  const page = blog.getPage([slug]) as any;
  if (!c || !page) notFound();
  return <c.Post page={page} concept={concept} />;
}

export function generateStaticParams(): { concept: string; slug: string }[] {
  return Object.keys(postConcepts).flatMap((concept) => blog.getPages().map((page) => ({ concept, slug: page.slugs[0] })));
}
