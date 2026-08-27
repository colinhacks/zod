"use client";

import type * as PageTree from "fumadocs-core/page-tree";
import { SidebarSeparator as InternalSidebarSeparator } from "fumadocs-ui/components/sidebar/base";

export const SidebarSeparator = ({
  item,
}: {
  item: PageTree.Separator;
}) => {
  return (
    <InternalSidebarSeparator
      className={"inline-flex items-center gap-2 mb-2 px-2 mt-8 text-lg tracking-wide dark:text-white"}
      style={{ fontVariant: "all-petite-caps" }}
    >
      {item.icon}
      {item.name}
    </InternalSidebarSeparator>
  );
};
