import { blogPosts, docs } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";

// `loader()` also assign a URL to your pages
// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
});

// Blog content loader
export const blog = loader({
  baseUrl: "/blog",
  source: createMDXSource(blogPosts),
});
