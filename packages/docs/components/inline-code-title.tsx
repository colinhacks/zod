import { Fragment } from "react";

// renders `code` spans in a frontmatter title as <code>; stripBackticks() is the plain-text form for <title> metadata
export function InlineCodeTitle({ text }: { text: string }) {
  const parts = text.split("`");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <code key={i}>{part}</code> : <Fragment key={i}>{part}</Fragment>
      )}
    </>
  );
}

export const stripBackticks = (text: string) => text.replaceAll("`", "");
