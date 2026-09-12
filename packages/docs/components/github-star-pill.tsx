import { fetchStars } from "@/loaders/stars";

// official invertocat mark
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

// github's outline `star-16` octicon; hollow reads as "not starred yet"
function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z" />
    </svg>
  );
}

// github-style abbreviation: 41400 → "41.4k", 2000 → "2k", under 1k exact
function formatStars(count: number): string {
  if (count < 1000) return String(count);
  return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

// the navbar's github entry as a star-button pill in its unstarred state; only the border takes the accent on hover
export async function GitHubStarPill({ repo }: { repo: string }) {
  const resource: { slug: string; stars?: number } = { slug: repo };
  await fetchStars([resource]);
  const stars = resource.stars;

  return (
    <a
      href={`https://github.com/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        stars === undefined ? `Star ${repo} on GitHub` : `Star ${repo} on GitHub — ${formatStars(stars)} stars`
      }
      className="group inline-flex items-center gap-2 h-9 rounded-full border border-fd-border bg-fd-card/60 ps-1.75 pe-2.5 text-sm font-medium text-fd-muted-foreground shadow-sm transition-colors hover:border-fd-primary hover:text-fd-foreground"
    >
      <GitHubMark className="size-5 text-fd-foreground" />
      <span className="flex items-center gap-1">
        <StarIcon className="size-3.5 shrink-0 transition-colors group-hover:text-fd-foreground" />
        {stars !== undefined && <span className="leading-none">{formatStars(stars)}</span>}
      </span>
    </a>
  );
}
