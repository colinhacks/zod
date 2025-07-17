"use client";
import Script from "next/script";

export function SponsorButton() {
  return (
    <>
      <Script src="https://buttons.github.io/buttons.js" strategy="lazyOnload" />
      <a
        className="github-button"
        href="https://github.com/sponsors/colinhacks"
        data-icon="octicon-heart"
        data-color-scheme="no-preference: light; light: light; dark: dark;"
        aria-label="Sponsor colinhacks on GitHub"
      >
        Sponsor
      </a>
    </>
  );
}
