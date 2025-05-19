import { InkeepBubble } from "@/components/inkeep-bubble";
import InkeepSearchBox from "@/components/inkeep-search";

import "./global.css";
import { Analytics } from "@vercel/analytics/react";
import { Banner } from "fumadocs-ui/components/banner";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Banner id="zod4">
          These are the docs for Zod 4, which is currently in beta.<span>&nbsp;</span>
          <a className="underline" href="https://zod.dev">
            Go to Zod 3 docs 👉
          </a>
        </Banner>
        <InkeepBubble />
        <Analytics />
        <RootProvider
          search={{
            enabled: true,
            SearchDialog: InkeepSearchBox,
          }}
          theme={{}}
        >
          {children}
        </RootProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          console.log("initial")
          window.addEventListener("popstate", ()=>{ console.log("popstate") });
          window.addEventListener("load", ()=>{ console.log("load") });
          window.addEventListener("DOMContentLoaded", ()=>{ console.log("DOMContentLoaded") });
          window.addEventListener("pageshow", ()=>{ console.log("pageshow") });
          window.addEventListener("beforeunload", ()=>{ console.log("beforeunload") });
          window.addEventListener("unload", ()=>{ console.log("unload") });
          window.addEventListener("visibilitychange", ()=>{ console.log("visibilitychange") });
          // window.addEventListener("scroll", ()=>{ console.log("scroll") });

          function __handleScroll(){
            // if id query parameter is present, scroll to the element with that id
            const params = new URLSearchParams(window.location.search);
            console.dir(params, {depth: null});
            const id = params.get("id");
            console.dir(params, {depth: null});
            if (id) {
              console.dir(document.getElementById(id), {depth: null});
              document.getElementById(id)?.scrollIntoView();
            }
          }
          
          // window.addEventListener("popstate",__handleScroll);
          // window.addEventListener("load", __handleScroll);
          // __handleScroll();
        `,
          }}
        />
      </body>
    </html>
  );
}
