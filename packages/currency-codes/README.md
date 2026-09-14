# @zod/currency-codes

ISO 4217 currency codes, regenerated from the SIX Group lists by a weekly job in the [zod](https://github.com/colinhacks/zod) repository. SIX Group is the ISO 4217 maintenance agency and publishes the lists free of charge.

```sh
npm install @zod/currency-codes
```

```ts
import {
  type CurrencyCode,
  codes,
  currencies,
  withdrawn,
} from "@zod/currency-codes";

codes; // ["AED", "AFN", ...] as const, every active code
currencies.find((c) => c.code === "JPY"); // { code: "JPY", numeric: "392", name: "Yen", minorUnits: 0, fund: false }
withdrawn.find((c) => c.code === "ANG"); // { code: "ANG", numeric: "532", name: "Netherlands Antillean Guilder", withdrawn: "2025-..." }
```

The `codes` tuple carries the literal union `CurrencyCode`. A minor release means the set of active codes changed; a patch release means only names, numbers or minor units did. The publication date of the underlying list is exported as `published`.
