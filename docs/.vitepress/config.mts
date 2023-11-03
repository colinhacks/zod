import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Zod",
  description: "TypeScript-first schema validation with static type inference",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Getting Started', link: '/getting-started/installation' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/getting-started/introduction' },
          { text: 'Installation', link: '/getting-started/installation' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/colinhacks/zod' }
    ]
  }
})
