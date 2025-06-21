import { z } from "zod/v3";
// import ru from "zod/v4/locales/ru.js";
// console.dir(ru, { depth: null });
// console.dir(z, { depth: null });
// console.dir(
//   z
//     .optional(z.array(z.string()))
//     .check(z.overwrite((data) => data ?? []))
//     .parse(undefined),
//   { depth: null }
// );
console.dir(z.string().parse("Hello, Zod!"), { depth: null });
