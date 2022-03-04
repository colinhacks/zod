---
layout: doc-home-page
title: What is Zod?
nav_order: 0
permalink: /
next:
    title: Installation
    path: /docs/installation
---

Zod is a TypeScript-first schema declaration and validation library. The term 'schema' broadly refers to any data type, from a simple `string` to a complex nested object.

Zod is designed to be as developer-friendly as possible. The goal is to eliminate duplicative type declarations. With Zod, you declare a validator _once_ and Zod will automatically infer the static TypeScript type. It's easy to compose simpler types into complex data structures.

Some other great aspects:

- Zero dependencies
- Works in Node.js and browsers (including IE 11)
- Tiny: 8kb minified + zipped
- Immutable: methods return a new instance (i.e. [`.optional()`](docs/schema-methods/optional))
- Concise, chainable interface
- Functional approach: [parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/){:target="_blank"}
- Works with plain JavaScript too! You don't need to use TypeScript.