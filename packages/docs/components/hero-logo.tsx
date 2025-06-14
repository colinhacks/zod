"use client";

import Image from "next/image";
import { useState } from "react";

interface HeroLogoProps {
  className?: string;
}

export function HeroLogo({ className }: HeroLogoProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative ${className || ""}`} style={{ height: "170px" }}>
      {/* Skeleton/placeholder with the same dimensions */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center"
          style={{ height: "170px" }}
        >
          <div className="size-20 bg-gray-300 dark:bg-gray-600 rounded-lg opacity-50" />
        </div>
      )}

      {/* Actual logo images */}
      <Image
        className={`block dark:hidden mx-auto transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        alt="Zod logo"
        src="/logo/logo-glow.png"
        width={200}
        height={170}
        priority
        quality={100}
        onLoad={() => setIsLoaded(true)}
        style={{ height: "170px", width: "auto" }}
      />
      <Image
        className={`hidden dark:block mx-auto transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        alt="Zod logo"
        src="/logo/logo-glow.png"
        width={200}
        height={170}
        priority
        quality={100}
        onLoad={() => setIsLoaded(true)}
        style={{ height: "170px", width: "auto" }}
      />
    </div>
  );
}
