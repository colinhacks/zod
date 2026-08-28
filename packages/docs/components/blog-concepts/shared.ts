import type { ComponentType, ReactNode } from "react";

export interface PostItem {
  slug: string;
  title: string;
  description: string;
  date: Date;
  author: string;
  url: string;
  minutes: number;
  // review-only placeholder rows so the index has enough entries to judge
  sample?: boolean;
}

export interface TocEntry {
  title: ReactNode;
  url: string;
  depth: number;
}

export interface IndexProps {
  posts: PostItem[];
}

export interface PostProps {
  title: string;
  description?: string;
  date?: Date;
  author: string;
  minutes: number;
  toc: TocEntry[];
  backHref: string;
  Mdx: ComponentType<any>;
  components: Record<string, ComponentType<any>>;
}

export interface Concept {
  label: string;
  blurb: string;
  className: string;
  Index: ComponentType<IndexProps>;
  Post: ComponentType<PostProps>;
}

export const AUTHOR_URL = "https://x.com/colinhacks";
export const AVATAR = "/logo/profile_circle.png";

export const samplePosts: Omit<PostItem, "url">[] = [
  {
    slug: "zod-4-stable",
    title: "Zod 4 is stable",
    description:
      "A ground-up rewrite: faster parsing, far fewer type instantiations, a 2 kB core, and a Zod Mini variant for bundle-conscious apps.",
    date: new Date("2025-05-19"),
    author: "Colin McDonnell",
    minutes: 9,
    sample: true,
  },
  {
    slug: "codecs",
    title: "Codecs: bidirectional transforms",
    description:
      "Encode and decode with one schema. How codecs fit alongside pipes, and what changes for library authors.",
    date: new Date("2025-08-14"),
    author: "Colin McDonnell",
    minutes: 5,
    sample: true,
  },
  {
    slug: "aot",
    title: "Ahead-of-time compilation",
    description:
      "Compiling schemas to specialized parse functions at construction time, and where the speedup comes from.",
    date: new Date("2026-03-02"),
    author: "Colin McDonnell",
    minutes: 7,
    sample: true,
  },
];

export function formatDate(date: Date, style: "short" | "long" | "iso" = "short"): string {
  if (style === "iso") return date.toISOString().slice(0, 10);
  return date.toLocaleDateString("en-US", {
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function groupByYear(posts: PostItem[]): [number, PostItem[]][] {
  const groups = new Map<number, PostItem[]>();
  for (const post of posts) {
    const year = post.date.getUTCFullYear();
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(post);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]);
}

export function minutesFor(page: any): number {
  const contents: { content?: string }[] = page.data?.structuredData?.contents ?? [];
  const words = contents.reduce((n, c) => n + (c.content?.split(/\s+/).length ?? 0), 0);
  return Math.max(1, Math.round(words / 220));
}
