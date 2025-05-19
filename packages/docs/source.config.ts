import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content",
});

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
});
