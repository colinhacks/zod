import { InlineCodeTitle } from "@/components/inline-code-title";
import { latestPosts } from "@/loaders/source";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// pill above the hero logo, always pointing at the newest post
export function BlogPill() {
  const [latest] = latestPosts(1);
  return (
    <Link
      href={latest.url}
      className="not-prose group self-center mb-8 inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-background py-1 pl-1.5 pr-3 text-sm text-fd-foreground no-underline hover:border-[var(--ui-color)] transition-colors"
    >
      <span className="rounded-full bg-[var(--ui-color)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white dark:text-black">
        New
      </span>
      <span>
        <InlineCodeTitle text={latest.title} />
      </span>
      <ArrowRight className="size-3.5 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
