import { InkeepBubble } from "@/components/inkeep-bubble";
import InkeepSearchBox from "@/components/inkeep-search";

import "./global.css";
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
        <InkeepBubble />
        <RootProvider
          search={{
            enabled: true,
            SearchDialog: InkeepSearchBox,
          }}
          theme={{}}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
