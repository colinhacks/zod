I'm thrilled to announce that Zod is the inaugural recipient of the [Clerk](https://clerk.com/) OSS Fellowship! This fellowship is kind of like a "summer internship"—Clerk will provide me with a reasonable wage as I work on Zod full-time throughout summer 2024.

In the context of both my own career path and Zod's development, this is a perfect arrangement and I'm beyond grateful that Clerk was willing to experiment with some alternative funding arrangements for OSS.

Let's look at some of the context here.

## Zod's next major

The current major version of Zod (v3) was released in 2021. In terms of structure and implementation, I got a lot of things right with Zod 3; it's been capable of supporting 23(!) minor releases, each with new features and enhancements, with no breaking changes to the public API.

But there are a couple structural issues that need to be addressed and will require breaking changes. (It's worth noting that the vast majority of Zod users will not be affected, but a lot of the libraries in Zod's ecosystem depend on Zod internals and will need to be updated.)

- To simplify the codebase and enable easier code generation tooling, some subclasses of `ZodType` will be split or consolidated.
- To improve performance, the signature of the (quasi-)internal `_parse` method will be changed. Any user-defined subclasses of `ZodType` will need to be updated accordingly.
- To clean up autocompletion, some internal methods and properties will be made `protected`. Some current APIs will be deprecated; some deprecated APIs will be removed.
- To enable `exactOptionalPropertyTypes` semantics, the logic used to determine key optionality in `ZodObject` will change. Depending on the value of `exactOptionalPropertyTypes` in your `tsconfig.json`, some inferred types may change (RFC forthcoming).
- To improve TypeScript server performance, some generic class signatures (e.g. `ZodUnion`) will be changed or simplified. Other type utilities will be re-implemented for efficiency, but may result in marginally different behavior in some contexts.

All told, Zod 4 will be a ground-up rewrite of the library with virtually no breaking changes for typical users, dramatic speed improvements, a simpler internal structure, and a big slate of new features.

## Zod's current funding story

Zod's has _many_ generous donors and is likely one of the most well-sponsored TypeScript utility libraries of its kind. Right now, that works out to just over $2600/mo. With much love and appreciation to my sponsors, that's far from replacing a full-time salary in the US.

Building Zod 4 is a big undertaking, and requires full-time attention to get right. I've already spent around 6 weeks merging or closing over a hundred pull requests that had accumulated, culminating in the release of Zod 3.23. For the last month or so I've been speccing out Zod 4, finalizing the roadmap, writing RFCs, and restructuring the codebase. In my estimation, it'll take three months to complete the rewrite, build a new docs site, and roll out the new release responsibly to Zod's now-massive base of users and third-party ecosystem libraries.

## The Clerk fellowship

So I reached out to a few companies with an experimental proposal: an "OSS internship" where the company would sponsor the development of Zod for 12 weeks (my timeline for the release of Zod 4). During this window I'd get some reasonable wage—think entry-level software engineer. It's effectively a summer internship for me, and a fixed cost for the company.

Much to my delight, [Colin](https://twitter.com/tweetsbycolin) from Clerk (AKA "other Colin") was enthusiastically on board. I've admired Clerk for a long time for their product, eye for developer experience, and commitment to open source. They've already been sponsoring [Auth.js](https://authjs.dev/) (formerly NextAuth) for some time and were open to other novel ideas relating to OSS sustainability.

In exchange for the support, Clerk is getting a super-charged version of the perks that Zod's other sponsors already get:

1. Diamond-tier placement in the README and the docs 💎 Big logo. Big. Huge.
2. Mentions in the forthcoming Zod 4 RFCs (Requests for Comment). Historically Zod's RFCs have attracted a lot of attention and feedback from the TypeScript community (or at least TypeScript Twitter). This is a perfect place to shout out the company that is (effectively) paying me to implement these new features.
3. A small ad at the bottom of the sidebar of Zod's new docs site (under construction now). You can see what this might look like in the [Auth.js](https://authjs.dev/getting-started) docs.
4. For continuity after the release of Zod 4, Zod will offer an ongoing "diamond level" sponsorship tier. This would be an exclusive slot, so only one company can hold the title at a time. The perks of this tier include the big README logo and the sidebar ad placement. The pricing details of this tier are up to me to decide. Once I do decide, Clerk gets "first dibs" (righ of first refusal) on this slot for a year, if they so choose.
5. This announcement post! Yes, you've been reading marketing material this whole time. Gotcha.

## OSS and funding models

This is an interesting middle ground between the traditional sponsorship model and the "maintainer-in-residence" approach that companies like Vercel have taken with Rich Harris and Svelte.

Zod doesn't need a full-time maintainer in perpetuity, but it does need full-time attention to get this major version out the door. This fellowship is a way to bridge that gap. All-in-all, I'm beyond excited to have found a partner in Clerk that is interested in trying something like this.

So if you're building an app sometime soon, be smart—validate your `Request` bodies and don't roll your own auth.
