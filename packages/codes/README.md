# @zod/codes

The code lists behind zod's format validators, regenerated weekly from the maintaining agencies by a job in the [zod](https://github.com/colinhacks/zod) repository: ISO 4217 currency codes from SIX Group's lists, ISO 3166-1 country codes and ISO 639-1 language codes from the IANA language subtag registry, with alpha-3 and numeric country codes from CLDR.

```sh
npm install @zod/codes
```

Each list is its own entry point. It exports `codes` as a readonly tuple, so the literal union falls out of the type, and a records array with the fields the source carries.

```ts
import {
  type CurrencyCode,
  codes,
  currencies,
  withdrawn,
} from "@zod/codes/currencies";
import { type CountryCode, countries, reserved } from "@zod/codes/countries";
import { type LanguageCode, languages } from "@zod/codes/languages";

codes; // ["AED", "AFN", ...] as const, every active ISO 4217 code
currencies.find((c) => c.code === "JPY"); // { code: "JPY", numeric: "392", name: "Yen", minorUnits: 0, fund: false }
withdrawn.find((c) => c.code === "ANG"); // { code: "ANG", numeric: "532", name: "Netherlands Antillean Guilder", withdrawn: "2025-..." }
countries.find((c) => c.code === "US"); // { code: "US", alpha3: "USA", numeric: "840", name: "United States" }
reserved; // ["AC", "CP", "CQ", "DG", "EA", "EU", "EZ", "IC", "TA", "UN"], exceptionally reserved and assigned to no country
languages.find((l) => l.code === "en"); // { code: "en", name: "English" }
```

The root entry re-exports each list as a namespace: `import { currency } from "@zod/codes"` gives `currency.codes`, `currency.currencies` and `currency.withdrawn`.

A minor release means a set of codes changed; a patch release means only names, numbers or minor units did. Each module exports `published`, the publication date of the source list its data comes from. Deprecated language subtags are left out, except `sh` (Serbo-Croatian), which the registry keeps as a macrolanguage although ISO 639-1 withdrew it. Every generation is cross-checked against Debian's `iso-codes` and fails when the two disagree.
