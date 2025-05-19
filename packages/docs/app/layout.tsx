import { InkeepBubble } from "@/components/inkeep-bubble";
import InkeepSearchBox from "@/components/inkeep-search";

import "./global.css";
import Scroller from "@/components/scroller";
import { Analytics } from "@vercel/analytics/react";
import { Banner } from "fumadocs-ui/components/banner";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import { type ReactNode, Suspense } from "react";

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
        <Suspense fallback={null}>
          <Scroller />
        </Suspense>
      </body>
    </html>
  );
}
