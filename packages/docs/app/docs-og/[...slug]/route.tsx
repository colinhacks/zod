import { generateOGImage } from "fumadocs-ui/og";
import { metadataImage } from "../../../loaders/metadata";

export const GET = metadataImage.createAPI((page) => {
  return generateOGImage({
    title: page.data.title,
    description: page.data.description ?? "Parsers and utilities that power Zod and @zod/mini",
    site: "zod.dev",
    primaryColor: "#0B0B0C",
    primaryTextColor: "#F9F9F9",
  });
});

export function generateStaticParams() {
  return metadataImage.generateParams();
}
