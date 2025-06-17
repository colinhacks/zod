"use client";

import {
  Tabs as PrimitiveTabs,
  Tab as PrimitiveTab,
  type TabProps,
  type TabsProps,
} from "fumadocs-ui/components/tabs";

export const Tabs = (props: TabsProps) => <PrimitiveTabs {...props} />;
export const Tab = (props: TabProps) => <PrimitiveTab {...props} className="data-[state=inactive]:hidden" forceMount />;
