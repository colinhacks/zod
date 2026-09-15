import { stripBackticks } from "@/components/inline-code-title";
import { blog } from "@/loaders/source";

// cached forever
export const revalidate = false;

const escapeXml = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export function GET() {
  const posts = (blog.getPages() as any[])
    .filter((post) => !post.data?.draft)
    .sort((a, b) => new Date(b.data?.date ?? 0).getTime() - new Date(a.data?.date ?? 0).getTime());

  const items = posts.map((post) => {
    const url = `https://zod.dev${post.url}`;
    const title = stripBackticks((post.data?.title as string | undefined) ?? post.slugs.join("/"));
    const description = (post.data?.description as string | undefined) ?? "";
    const pubDate = new Date(post.data?.date ?? 0).toUTCString();
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Zod Blog</title>
    <link>https://zod.dev/blog</link>
    <description>Release announcements and engineering deep dives from Zod.</description>
    <language>en-us</language>
    <atom:link href="https://zod.dev/blog/rss.xml" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
