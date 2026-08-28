"use client";

import { Tab as FumaTab, Tabs as FumaTabs, type TabProps, type TabsProps } from "fumadocs-ui/components/tabs";
import React from "react";

// the stock tabs need `items` up front; here each tab carries its own `title`, so a post writes `<Tab title="Zod">` with no list to keep in sync
const Tabs = ({ children, items, ...rest }: TabsProps) => {
  const titles =
    items ??
    React.Children.toArray(children)
      .filter(React.isValidElement)
      .map(
        (child) =>
          (child.props as { title?: string; value?: string }).title ?? (child.props as { value?: string }).value
      )
      .filter((title): title is string => Boolean(title));

  return (
    <FumaTabs items={titles} {...rest}>
      {children}
    </FumaTabs>
  );
};

const Tab = ({ title, value, ...props }: TabProps & { title?: string }) => (
  <FumaTab value={value ?? title} {...props} />
);

export { Tabs, Tab };
