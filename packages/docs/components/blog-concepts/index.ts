import * as editorial from "./editorial";
import * as glow from "./glow";
import * as margin from "./margin";
import type { Concept } from "./shared";
import * as timeline from "./timeline";

export const concepts: Record<string, Concept> = {
  editorial: {
    label: "Editorial",
    blurb: "Serif display type, italic deks, year labels in the gutter, a gem divider.",
    className: "concept-editorial",
    ...editorial,
  },
  timeline: {
    label: "Timeline",
    blurb: "Sticky intro column, dated rail with diamond markers, monospace metadata.",
    className: "concept-timeline",
    ...timeline,
  },
  glow: {
    label: "Glow",
    blurb: "Brand gradient wash behind the header, featured latest post, card grid.",
    className: "concept-glow",
    ...glow,
  },
  margin: {
    label: "Margin",
    blurb: "Big-type list with right-aligned dates; post page with a sticky margin column and TOC.",
    className: "concept-margin",
    ...margin,
  },
};
