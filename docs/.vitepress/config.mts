import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "en-US",
  title: "Zod",
  description: "TypeScript-first schema validation with static type inference",

  lastUpdated: true,
  cleanUrls: true,

  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    [
      "meta",
      {
        name: "twitter:title",
        content:
          "TypeScript-first schema validation with static type inference",
      },
    ],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:site", content: "@colinhacks" }],
    [
      "meta",
      {
        name: "twitter:image:src",
        content:
          "https://opengraph.githubassets.com/1cac1150838995e1f7d1643c00eee51a5d884f2054f995c9d3225b07b0eddb39/colinhacks/zod",
      },
    ],
    [
      "meta",
      {
        property: "og:image",
        content:
          "https://opengraph.githubassets.com/1cac1150838995e1f7d1643c00eee51a5d884f2054f995c9d3225b07b0eddb39/colinhacks/zod",
      },
    ],
    [
      "meta",
      {
        property: "og:image:alt",
        content:
          "TypeScript-first schema validation with static type inference",
      },
    ],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "600" }],
    ["meta", { property: "og:site_name", content: "GitHub" }],
    ["meta", { property: "og:type", content: "object" }],
    [
      "meta",
      {
        property: "og:title",
        content:
          "TypeScript-first schema validation with static type inference",
      },
    ],
    [
      "meta",
      { property: "og:url", content: "https://github.com/colinhacks/zod" },
    ],
    [
      "meta",
      {
        property: "og:description",
        content:
          "TypeScript-first schema validation with static type inference",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
    ],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
    [
      "link",
      { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
    ],
    ["link", { rel: "shortcut icon", href: "/favicon.ico" }],
    ["meta", { name: "msapplication-TileColor", content: "#da532c" }],
    ["meta", { name: "msapplication-config", content: "/browserconfig.xml" }],
    ["meta", { name: "theme-color", content: "#ffffff" }],
    [
      "script",
      {
        async: "",
        src: "https://www.googletagmanager.com/gtag/js?id=G-FG8DDV0GBR",
      },
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-FG8DDV0GBR');`,
    ],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: { src: "/logo.svg", width: 24, height: 24 },
    search: {
      provider: "local",
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
    editLink: {
      pattern: "https://github.com/colinhacks/zod/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/colinhacks/zod" },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2020-present Colin McDonnell",
    },
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
