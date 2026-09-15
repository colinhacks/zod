"use client";

import Image from "next/image";
import type { ReactNode } from "react";

interface ThemedImageProps {
  lightSrc: string;
  darkSrc: string;
  alt: string;
  caption?: ReactNode;
  className?: string;
}

export function ThemedImage({ lightSrc, darkSrc, alt, caption, className }: ThemedImageProps) {
  return (
    <figure className={`my-6 ${className || ""}`}>
      <div className="rounded-lg border border-fd-border p-1">
        <div className="relative overflow-hidden rounded-md border border-fd-border">
          {/* Light mode image */}
          <Image
            className="my-0 block dark:hidden"
            alt={alt}
            src={lightSrc}
            width={800}
            height={400}
            quality={100}
            style={{ height: "auto", width: "100%" }}
          />

          {/* Dark mode image */}
          <Image
            className="my-0 hidden dark:block"
            alt={alt}
            src={darkSrc}
            width={800}
            height={400}
            quality={100}
            style={{ height: "auto", width: "100%" }}
          />
        </div>
      </div>
      {caption ? (
        <figcaption className="mx-auto mt-2 max-w-[65%] text-center text-sm text-fd-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
