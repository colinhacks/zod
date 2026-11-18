import { blog, source } from "@/loaders/source";
import type { MetadataRoute } from "next";

export const revalidate = false;

const url = (path: string) => `https://zod.dev${path === "/" ? "" : path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const docs = source.getPages().map((page) => ({ url: url(page.url) }));
  const posts = (blog.getPages() as any[])
    .filter((post) => !post.data?.draft)
    .map((post) => ({ url: url(post.url), lastModified: post.data?.date ? new Date(post.data.date) : undefined }));
  return [...docs, { url: url("/blog") }, ...posts];
}
