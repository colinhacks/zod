import { makeData, makeSchema } from "./benchUtil";
import { metabench } from "./metabench";
const { zod3, zod4 } = makeSchema((z) =>
  z.object({
    string: z.string(),
    boolean: z.boolean(),
    number: z.number(),
  })
);

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

export default async function run(): Promise<void> {
  await bench.run();
}

if (require.main === module) run();
