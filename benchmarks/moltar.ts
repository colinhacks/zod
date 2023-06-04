import Benchmark from "benchmark";

import { z as zNew } from "../src/index";
import { z as zOld } from "zod";

const DATA = Object.freeze({
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
});

const oldSchema = zOld.object({
  number: zOld.number(),
  negNumber: zOld.number(),
  maxNumber: zOld.number(),
  string: zOld.string(),
  longString: zOld.string(),
  boolean: zOld.boolean(),
  deeplyNested: zOld.object({
    foo: zOld.string(),
    num: zOld.number(),
    bool: zOld.boolean(),
  }),
});

const newSchema = zNew.object({
  number: zNew.number(),
  negNumber: zNew.number(),
  maxNumber: zNew.number(),
  string: zNew.string(),
  longString: zNew.string(),
  boolean: zNew.boolean(),
  deeplyNested: zNew.object({
    foo: zNew.string(),
    num: zNew.number(),
    bool: zNew.boolean(),
  }),
});

const suite = new Benchmark.Suite("moltar - strict");
suite
  .add("oldschema", () => {
    oldSchema.parse(DATA);
  })
  .add("newschema", () => {
    newSchema.parse(DATA);
  })

  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${suite.name}: ${e.target}`);
  })
  .run();
