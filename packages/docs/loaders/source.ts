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

export function formatDate(value: string | Date, style: "short" | "long" = "short"): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// reading time from the mdx structured data, at a conservative 220 wpm
export function readingMinutes(page: any): number {
  const contents: { content?: string }[] = page.data?.structuredData?.contents ?? [];
  const words = contents.reduce((n, c) => n + (c.content?.split(/\s+/).length ?? 0), 0);
  return Math.max(1, Math.round(words / 220));
}
