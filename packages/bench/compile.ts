import * as z4 from "zod/v4";
import * as z4core from "zod/v4/core";
import { metabench } from "./metabench.js";

// Schema for benchmarking - same as moltar benchmark
const schema = z4.strictObject({
  number: z4.number(),
  negNumber: z4.number(),
  maxNumber: z4.number(),
  string: z4.string(),
  longString: z4.string(),
  boolean: z4.boolean(),
  deeplyNested: z4.strictObject({
    foo: z4.string(),
    num: z4.number(),
    bool: z4.boolean(),
  }),
});

// AOT compiled validator
const aotValidator = z4core.compile(schema);

// Test data
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

// Verify correctness
console.log("=== Correctness Check ===");
console.log("AOT valid:", aotValidator(DATA[0]));
console.log("Zod valid:", schema.safeParse(DATA[0]).success);
console.log("Zod JIT valid:", schema.safeParse(DATA[0]).success);
console.log("Zod non-JIT valid:", schema.safeParse(DATA[0], { jitless: true }).success);
console.log("");

const bench = metabench("z.compile() vs z.safeParse()", {
  "AOT compiled"() {
    for (const d of DATA) aotValidator(d);
  },
  "Zod JIT"() {
    for (const d of DATA) schema.safeParse(d);
  },
  "Zod non-JIT"() {
    for (const d of DATA) schema.safeParse(d, { jitless: true });
  },
});

await bench.run();
