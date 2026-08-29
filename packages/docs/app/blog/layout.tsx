import { baseOptions } from "@/app/layout.config";
import { GitHubStarPill } from "@/components/github-star-pill";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";

// the star pill takes the navbar's top-right slot; `on: "nav"` keeps it in the bar itself on mobile rather than in the collapsed menu
export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions}
      links={[
        {
          type: "custom",
          secondary: true,
          on: "nav",
          children: (
            <li className="ms-1.5">
              <GitHubStarPill repo="colinhacks/zod" />
            </li>
          ),
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
