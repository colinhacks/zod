import { defineCollections, defineConfig, defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content",
  // posts belong to blogPosts only; here they would also prerender through the docs route, which has no Tab
  docs: { files: ["**/*", "!blog/**"] },
});

// Blog collection (for content under `content/blog`)
export const blogPosts = defineCollections({
  type: "doc",
  dir: "content/blog",
  // No schema to avoid zod version mismatch; frontmatter is optional
});

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
});
