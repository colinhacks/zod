import * as z4 from "zod";
import * as z3 from "zod3";
import { metabench } from "./metabench.js";

const z3schema = z3.object({
  number: z3.number(),
  negNumber: z3.number(),
  maxNumber: z3.number(),
  string: z3.string(),
  longString: z3.string(),
  boolean: z3.boolean(),
  deeplyNested: z3.object({
    foo: z3.string(),
    num: z3.number(),
    bool: z3.boolean(),
  }),
});

const z4schema = z4.object({
  number: z4.number(),
  negNumber: z4.number(),
  maxNumber: z4.number(),
  string: z4.string(),
  longString: z4.string(),
  boolean: z4.boolean(),
  deeplyNested: z4.object({
    foo: z4.string(),
    num: z4.number(),
    bool: z4.boolean(),
  }),
});

const DATA = Array.from({ length: 1000 }, () =>
  Object.freeze({
    number: 1,
    negNumber: -1,
    maxNumber: Number.MAX_VALUE,
    string: "string",
    longString:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Vivendum intellegat et qui, ei denique consequuntur vix. Semper aeterno percipit ut his, sea ex utinam referrentur repudiandae. No epicuri hendrerit consetetur sit, sit dicta adipiscing ex, in facete detracto deterruisset duo. Quot populo ad qui. Sit fugit nostrum et. Ad per diam dicant interesset, lorem iusto sensibus ut sed. No dicam aperiam vis. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Ex nam agam veri, dicunt efficiantur ad qui, ad legere adversarium sit. Commune platonem mel id, brute adipiscing duo an. Vivendum intellegat et qui, ei denique consequuntur vix. Offendit eleifend moderatius ex vix, quem odio mazim et qui, purto expetendis cotidieque quo cu, veri persius vituperata ei nec. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    boolean: true,
    deeplyNested: {
      foo: "bar",
      num: 1,
      bool: false,
    },
  })
);

console.log(z3schema.safeParse(DATA[0]));
console.log(z4schema.safeParse(DATA[0]));

const bench = metabench("small: z.object().safeParseAsync", {
  zod3() {
    for (const _ of DATA) z3schema.safeParse(_);
  },
  zod4() {
    for (const _ of DATA) z4schema.safeParse(_);
  },
});

await bench.run();
