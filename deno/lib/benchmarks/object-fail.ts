import { makeData } from "./benchUtil.ts";
import { metabench } from "./metabench.ts";
import { zod3, zod4 } from "./object-old.ts";

const DATA = makeData(1000, () => {
  return Object.freeze({
    nest: {
      number: "asdf",
      string: 12,
      // boolean: undefined,
    },
  });
});

const bench = metabench("small: z.object().safeParseAsync", {
  zod3() {
    for (const _ of DATA) zod3.parse(_);
  },
  zod4() {
    for (const _ of DATA) zod4.parse(_);
  },
});

export default async function run() {
  await bench.run();
}

if (require.main === module) run();
