import { blogPosts, docs } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { icons } from "lucide-react";
import { createElement } from "react";

// `loader()` also assign a URL to your pages
// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
  icon(icon) {
    if (!icon) {
      // You may set a default icon
      return;
    }

    if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
  },
});

// Blog content loader
export const blog = loader({
  baseUrl: "/blog",
  source: createMDXSource(blogPosts),
});

export type PostSummary = { url: string; title: string; description: string; date: Date };

export function latestPosts(count: number): PostSummary[] {
  return (blog.getPages() as any[])
    .filter((post) => !post.data?.draft)
    .sort((a, b) => new Date(b.data?.date ?? 0).getTime() - new Date(a.data?.date ?? 0).getTime())
    .slice(0, count)
    .map((post) => ({
      url: post.url,
      title: post.data?.title ?? post.slugs.join("/"),
      description: post.data?.description ?? "",
      date: new Date(post.data?.date ?? 0),
    }));
}

export function formatDate(value: string | Date, style: "short" | "long" = "short"): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
