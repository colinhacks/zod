import * as fs from "node:fs/promises";
import type { source } from "@/loaders/source";
import type { InferPageType } from "fumadocs-core/source";
import { remarkInclude } from "fumadocs-mdx/config";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";

const processor = remark().use(remarkMdx).use(remarkInclude).use(remarkGfm).use(remarkStringify);

export async function getLLMText(page: InferPageType<typeof source>): Promise<string> {
  const filePath = page.data._file.absolutePath;
  const fileContent = await fs.readFile(filePath);
  const { content } = matter(fileContent.toString());

  const processed = await processor.process({
    path: filePath,
    value: content,
  });

  return `# ${page.data.title}

${processed}`;
}
