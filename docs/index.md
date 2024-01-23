---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

title: Zod
titleTemplate: TypeScript-first schema validation with static type inference

hero:
  name: "Zod"
  text: "Schema Validator"
  tagline: TypeScript-first schema validation with static type inference.
  image:
    src: /logo.svg
    alt: Zod
  actions:
    - theme: brand
      text: Getting Started
      link: /guide/installation
    - theme: alt
      text: GitHub
      link: https://github.com/colinhacks/zod

features:
  - title: Zero dependencies
    details: Lorem ipsum dolor sit amet, consectetur
  - title: Works in Node.js and all modern browsers
  - title: Tiny
    details: 8kb minified + zipped
  - title: Immutable
    details: methods (e.g. `.optional()`) return a new instance
  - title: Concise, chainable interface
  - title: Functional approach
    details: parse, don't validate
    link: https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/
  - title: Works with plain JavaScript too! You don't need to use TypeScript.
---

<script setup>
import { VPHomeSponsors } from "vitepress/theme";

const sponsors = [
  {
    tier: "Gold",
    size: "big",
    items: [
      {
        name: "Speakeasy",
        img: "https://avatars.githubusercontent.com/u/91446104?s=200&v=4",
        url: "https://speakeasyapi.dev/",
        desc: "SDKs, Terraform, Docs.<br />Your API made enterprise-ready.",
      },
      {
        name: "Glow Wallet",
        img: "https://i.imgur.com/R0R43S2.jpg",
        url: "https://glow.app/",
        desc: "Your new favorite<br />Solana wallet.",
      },
      {
        name: "Deletype",
        img: "https://avatars0.githubusercontent.com/u/15068039?s=200&v=4",
        url: "https://deletype.com",
        desc: "Effortless automation for developers.",
      },
      {
        name: "Transloadit",
        img: "https://avatars.githubusercontent.com/u/125754?s=200&v=4",
        url: "https://transloadit.com/?utm_source=zod&utm_medium=referral&utm_campaign=sponsorship&utm_content=github",
        desc: "Simple file processing for developers.",
      },
      {
        name: "Infisical",
        img: "https://avatars.githubusercontent.com/u/107880645?s=200&v=4",
        url: "https://infisical.com",
        desc: "Open-source platform for secret<br /> management: sync secrets across your<br />team/infrastructure and prevent secret leaks.",
      },
      {
        name: "Whop",
        img: "https://avatars.githubusercontent.com/u/91036480?s=200&v=4",
        url: "https://whop.com/",
        desc: "A marketplace for really cool internet products.",
      },
    ],
  },
  {
    tier: "Silver",
    size: "medium",
    items: [
      {
        name: "Numeric",
        img: "https://i.imgur.com/kTiLtZt.png",
        url: "https://www.numeric.io",
      },
      {
        name: "Marcato Partners",
        img: "https://avatars.githubusercontent.com/u/84106192?s=200&v=4",
        url: "https://marcatopartners.com/",
      },
      {
        name: "Interval",
        img: "https://avatars.githubusercontent.com/u/67802063?s=200&v=4",
        url: "https://interval.com",
      },
      {
        name: "Seasoned Software",
        img: "https://avatars.githubusercontent.com/u/33913103?s=200&v=4",
        url: "https://seasoned.cc",
      },
      {
        name: "Bamboo Creative",
        img: "https://avatars.githubusercontent.com/u/41406870?v=4",
        url: "https://www.bamboocreative.nz",
      },
    ],
  },
  {
    tier: "Bronze",
    size: "small",
    items: [
      {
        name: "Brandon Bayer",
        img: "https://avatars2.githubusercontent.com/u/8813276?s=460&u=4ff8beb9a67b173015c4b426a92d89cab960af1b&v=4",
        url: "https://twitter.com/flybayer",
        desc: 'creator of <a href="https://blitzjs.com">Blitz.js</a>',
      },
      {
        name: "Jiří Brabec",
        img: "https://avatars.githubusercontent.com/u/2237954?v=4",
        url: "https://github.com/brabeji",
      },
      {
        name: "Alex Johansson",
        img: "https://avatars.githubusercontent.com/u/459267?v=4",
        url: "https://twitter.com/alexdotjs",
      },
      {
        name: "Fungible Systems",
        img: "https://avatars.githubusercontent.com/u/80220121?s=200&v=4",
        url: "https://fungible.systems/",
      },
      {
        name: "Adaptable",
        img: "https://avatars.githubusercontent.com/u/60378268?s=200&v=4",
        url: "https://adaptable.io/",
      },
      {
        name: "Avana Wallet",
        img: "https://avatars.githubusercontent.com/u/105452197?s=200&v=4",
        url: "https://www.avanawallet.com/",
        desc: "Solana non-custodial wallet",
      },
      {
        name: "Jason Lengstorf",
        img: "https://avatars.githubusercontent.com/u/66575486?s=200&v=4",
        url: "https://learnwithjason.dev/",
      },
      {
        name: "Global Illumination, Inc",
        img: "https://avatars.githubusercontent.com/u/89107581?s=200&v=4",
        url: "https://ill.inc/",
      },
      {
        name: "MasterBorn",
        img: "https://avatars.githubusercontent.com/u/48984031?s=200&v=4",
        url: "https://www.masterborn.com/career?utm_source=github&utm_medium=referral&utm_campaign=zodsponsoring",
      },
    ],
  },
];
</script>

<VPHomeSponsors action-text='Cup of Coffee tier' action-link='https://github.com/sponsors/colinhacks' message="Sponsors" :data="sponsors" />
