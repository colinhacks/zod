"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

export interface TocEntry {
  title: ReactNode;
  url: string;
  depth: number;
}

interface Indicator {
  top: number;
  height: number;
}

// a heading becomes current once it reaches this fraction of the viewport
const MARKER = 0.5;

// a band reaching one viewport above the marker line, so a fast scroll still crosses an observed edge
const ROOT_MARGIN = `100% 0px -${(1 - MARKER) * 100}% 0px`;

// how close to the end of the document counts as "the bottom"
const BOTTOM_SLACK = 8;

export function BlogToc({ sections, labelClassName }: { sections: TocEntry[]; labelClassName?: string }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef(new Map<string, HTMLAnchorElement>());

  const ids = sections.map((t) => t.url.replace(/^#/, ""));
  // a stable key so the observer only re-subscribes when the headings themselves change
  const idKey = ids.join("\n");

  useEffect(() => {
    const headingIds = idKey ? idKey.split("\n") : [];
    if (!headingIds.length) return;
    let observed: HTMLElement[] = [];

    // the observer is just a trigger, so every callback re-reads positions
    function sync() {
      // looked up fresh each time, because a hot reload of the post swaps in new heading elements
      const headings = headingIds.map((id) => document.getElementById(id)).filter((el) => el !== null);
      if (!headings.length) return;
      if (headings.length !== observed.length || headings.some((el, i) => el !== observed[i])) {
        for (const el of observed) observer.unobserve(el);
        for (const el of headings) observer.observe(el);
        observed = headings;
      }
      // a short last section never reaches the marker, so the page end hands it the highlight
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - BOTTOM_SLACK) {
        setActiveId(headings[headings.length - 1].id);
        return;
      }
      const marker = window.innerHeight * MARKER;
      let current = headings[0];
      for (const el of headings) {
        if (el.getBoundingClientRect().top > marker) break;
        current = el;
      }
      setActiveId(current.id);
    }

    const observer = new IntersectionObserver(sync, { rootMargin: ROOT_MARGIN });

    // nothing crosses the marker in the last stretch, so the document end gets its own trigger
    const end = document.body.appendChild(document.createElement("div"));
    end.style.height = "1px";
    const endObserver = new IntersectionObserver(sync, { rootMargin: `0px 0px ${BOTTOM_SLACK}px 0px` });
    endObserver.observe(end);
    sync();

    return () => {
      observer.disconnect();
      endObserver.disconnect();
      end.remove();
    };
  }, [idKey]);

  const measure = useCallback(() => {
    const link = activeId ? linksRef.current.get(activeId) : undefined;
    setIndicator(link ? { top: link.offsetTop, height: link.offsetHeight } : null);
  }, [activeId]);

  useEffect(() => {
    measure();
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [measure]);

  if (!sections.length) return null;

  return (
    <nav className="mt-8">
      <p className={labelClassName}>On this page</p>
      <div ref={railRef} className="relative mt-2">
        {indicator ? (
          <span
            aria-hidden
            className="absolute left-0 -ml-px w-0.5 bg-[var(--ui-color)] transition-[transform,height] duration-200 ease-out motion-reduce:transition-none"
            style={{ height: indicator.height, transform: `translateY(${indicator.top}px)` }}
          />
        ) : null}
        <ol className="border-l border-fd-border">
          {sections.map((t, i) => {
            const id = ids[i];
            const active = id === activeId;
            return (
              <li key={t.url}>
                <a
                  ref={(el) => {
                    if (el) linksRef.current.set(id, el);
                    else linksRef.current.delete(id);
                  }}
                  href={t.url}
                  aria-current={active ? "location" : undefined}
                  onClick={() => setActiveId(id)}
                  className={`block -ml-0.5 border-l-2 border-transparent py-1.5 ${t.depth === 3 ? "pl-8 text-[0.95em]" : "pl-4"} hover:text-fd-foreground hover:border-[var(--ui-color)] [&_code]:rounded-[5px] [&_code]:bg-fd-muted [&_code]:px-[0.3em] [&_code]:py-[0.1em] [&_code]:text-[0.9em] ${
                    active ? "text-fd-foreground" : "text-fd-muted-foreground"
                  }`}
                >
                  {t.title}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
