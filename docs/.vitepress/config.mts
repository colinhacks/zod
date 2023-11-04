import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Zod",
  description: "TypeScript-first schema validation with static type inference",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local',
    },
    nav: [
      { text: "Guide", link: "/guide/introduction", activeMatch: "/guide" },
      {
        text: "Changelog",
        link: "https://github.com/colinhacks/zod/blob/master/CHANGELOG.md",
      },
    ],
    sidebar: {
      "/guide": {
        base: "/guide",
        items: [
          {
            text: "Getting Started",
            items: [
              { text: "Introduction", link: "/introduction" },
              { text: "Installation", link: "/installation" },
              { text: "Basic usage", link: "/basic-usage" },
              { text: "Comparison", link: "/comparison" },
              { text: "Ecosystem", link: "/ecosystem" },
            ],
          },
          {
            items: [
              { text: "Primitives", link: "/primitives" },
              {
                text: "Coercion for primitives",
                link: "/coercion-for-primitives",
              },
              { text: "Literals", link: "/literals" },
              { text: "Strings", link: "/strings" },
              { text: "Numbers", link: "/numbers" },
              { text: "BigInts", link: "/bigints" },
              { text: "NaNs", link: "/nans" },
              { text: "Booleans", link: "/booleans" },
              { text: "Dates", link: "/dates" },
              { text: "Zod enums", link: "/zod-enums" },
              { text: "Native enums", link: "/native-enums" },
              { text: "Optionals", link: "/optionals" },
              { text: "Nullables", link: "/nullables" },
              { text: "Objects", link: "/objects" },
              { text: "Arrays", link: "/arrays" },
              { text: "Tuples", link: "/tuples" },
              { text: "Unions", link: "/unions" },
              { text: "Discriminated unions", link: "/discriminated-unions" },
              { text: "Records", link: "/records" },
              { text: "Maps", link: "/maps" },
              { text: "Sets", link: "/sets" },
              { text: "Intersections", link: "/intersections" },
              { text: "Recursive types", link: "/recursive-types" },
              { text: "Promises", link: "/promises" },
              { text: "Instanceof", link: "/instanceof" },
              { text: "Functions", link: "/functions" },
              { text: "Preprocess", link: "/preprocess" },
              { text: "Custom schemas", link: "/custom-schemas" },
              { text: "Schema methods", link: "/schema-methods" },
              { text: "Guides and concepts", link: "/guides-and-concepts" },
            ],
          },
        ],
      },
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/colinhacks/zod" },
    ],
  },
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPSponsorsGrid\.vue$/,
          replacement: fileURLToPath(
            new URL("./components/VPSponsorsGrid.vue", import.meta.url)
          ),
        },
      ],
    },
  },
});
