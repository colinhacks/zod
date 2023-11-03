import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Zod",
  description: "TypeScript-first schema validation with static type inference",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Guide", link: "/guide/installation", activeMatch: "/guide" },
      {
        text: "Ecosystem",
        link: "/ecosystem",
        activeMatch: "/ecosystem",
      },
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
              { text: "installation", link: "/installation" },
            ],
          },
        ],
      },
      "/ecosystem": {
        base: "/ecosystem",
        items: [
          {
            text: "Ecosystem",
            items: [
              { text: "Resources", link: "/resources" },
              { text: "API libraries", link: "/api-libraries" },
              { text: "Form integrations", link: "/form-integrations" },
              { text: "Zod to X", link: "/zod-to-x" },
              { text: "X to Zod", link: "/x-to-zod" },
              { text: "Mocking", link: "/mocking" },
              { text: "Powered by Zod", link: "/powered-by-zod" },
              { text: "Utilities for Zod", link: "/utilities-for-zod" },
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
