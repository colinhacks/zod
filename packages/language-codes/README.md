# @zod/language-codes

ISO 639-1 language codes, regenerated weekly from the IANA language subtag registry by a job in the [zod](https://github.com/colinhacks/zod) repository. The two-letter language subtags of BCP 47 are the ISO 639-1 codes, and deprecated subtags are left out.

```sh
npm install @zod/language-codes
```

```ts
import { type LanguageCode, codes, languages } from "@zod/language-codes";

codes; // ["aa", "ab", ...] as const
languages.find((l) => l.code === "en"); // { code: "en", name: "English" }
```

The `codes` tuple carries the literal union `LanguageCode`. A minor release means the set of codes changed; a patch release means only names did. The registry keeps `sh` (Serbo-Croatian) as a macrolanguage, so it is included although ISO 639-1 withdrew it.
