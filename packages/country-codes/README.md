# @zod/country-codes

ISO 3166-1 country codes, regenerated weekly from the IANA language subtag registry and the CLDR code mappings by a job in the [zod](https://github.com/colinhacks/zod) repository. The registry carries every assigned alpha-2 code; CLDR supplies the alpha-3 and numeric codes.

```sh
npm install @zod/country-codes
```

```ts
import {
  type CountryCode,
  codes,
  countries,
  reserved,
} from "@zod/country-codes";

codes; // ["AD", "AE", ...] as const, every assigned alpha-2 code
countries.find((c) => c.code === "US"); // { code: "US", alpha3: "USA", numeric: "840", name: "United States" }
reserved; // ["AC", "CP", "CQ", "DG", "EA", "EU", "EZ", "IC", "TA", "UN"], exceptionally reserved and assigned to no country
```

The `codes` tuple carries the literal union `CountryCode`. A minor release means the set of assigned codes changed; a patch release means only names or mappings did. Every generation is cross-checked against Debian's `iso-codes` and fails when the two disagree.
