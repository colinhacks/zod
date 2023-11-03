---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

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
      link: /getting-started/installation
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
