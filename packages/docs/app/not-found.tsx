import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1
        className="text-8xl font-bold tracking-tight"
        style={{ color: "var(--color-fd-primary)" }}
      >
        404
      </h1>
      <p
        className="mt-4 text-xl"
        style={{ color: "var(--color-fd-foreground)" }}
      >
        This page could not be found.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        style={{
          backgroundColor: "var(--color-fd-muted)",
          color: "var(--color-fd-foreground)",
        }}
      >
        ← Back to home
      </Link>
    </div>
  );
}
