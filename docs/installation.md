---
layout: doc-page
title: Installation
nav_order: 2
previous:
    title: What is Zod?
    path: /
next:
    title: Basic usage
    path: ../basic-usage
---

## Node
To install Zod v3:

```sh
npm install zod
```

---

## TypeScript
⚠️ IMPORTANT: You must enable `strict` mode in your `tsconfig.json`. This is a best practice for all TypeScript projects.

```ts
// tsconfig.json
{
    "compilerOptions": {
        "strict": true
    }
}
```

| Zod Version | Required TypeScript Version |
| :--: | :--: |
| 3.x | 4.1+ |
| 2.x | 3.7+ |
| 1.x | 3.3+ |