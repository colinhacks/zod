"use client";

import { Tab as PrimitiveTab, Tabs as PrimitiveTabs, type TabProps, type TabsProps } from "fumadocs-ui/components/tabs";

export const Tabs = (props: TabsProps) => <PrimitiveTabs {...props} />;
export const Tab = (props: TabProps) => <PrimitiveTab {...props} className="data-[state=inactive]:hidden" forceMount />;
