import { baseOptions } from "@/app/layout.config";
import { mono, serif } from "@/components/blog-concepts/fonts";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import "./concepts.css";

export default function BlogConceptsLayout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions}>
      <div className={`blog-concept flex grow flex-col ${serif.variable} ${mono.variable}`}>{children}</div>
    </HomeLayout>
  );
}
