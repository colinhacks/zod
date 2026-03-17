import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | Zod",
};

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
      <h1 className="mb-2 text-4xl font-bold">404</h1>
      <p className="mb-6 text-fd-muted-foreground">
        This page could not be found.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-fd-primary underline underline-offset-4"
      >
        Go back home
      </Link>
    </div>
  );
}
