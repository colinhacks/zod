import { baseOptions } from "@/app/layout.config";
import { source } from "@/loaders/source";
import { DocsLayout, type DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

import { SidebarItem, SidebarSeparator } from "@/components/sidebar-item";
import { SidebarLogo } from "@/components/sidebar-logo";

export const dynamic = "force-static";

export const layoutProps: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,

  sidebar: {
    hideSearch: false,
    collapsible: false,
    prefetch: false, // Disable prefetching to prevent all pages from being fetched on every page load
    components: {
      Item: SidebarItem,
      Separator: SidebarSeparator,
    },
    tabs: [
      {
        title: "Zod 4",
        description: "The latest version of Zod",
        url: "/",
        icon: <SidebarLogo src="/logo/logo.png" alt="Zod 4" width={24} height={20} className="h-5" />,
      },
      {
        title: "Zod 3",
        description: "In maintenance mode",
        url: "https://v3.zod.dev",
        icon: (
          <SidebarLogo
            src="https://raw.githubusercontent.com/colinhacks/zod/3782fe29920c311984004c350b9fefaf0ae4c54a/logo.svg"
            alt="Zod 3"
            width={24}
            height={24}
            className="h-6"
          />
        ),
      },
    ],
  },

  nav: {
    ...baseOptions.nav,
    transparentMode: "top",
    enabled: true,
    enableSearch: true,
  },
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout {...layoutProps} containerProps={{}}>
      {children}
    </DocsLayout>
  );
}
