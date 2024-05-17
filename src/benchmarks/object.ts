import { makeData, makeSchema } from "./benchUtil.js";
import { metabench } from "./metabench.js";

export const { zod3, zod4 } = makeSchema((z) =>
  z.object({
    string: z.string(),
    boolean: z.boolean(),
    number: z.number(),
  })
);

export const DATA = makeData(1000, () => {
  return Object.freeze({
    number: Math.random(),
    string: `${Math.random()}`,
    boolean: Math.random() > 0.5,
  });
});

const bench = metabench("small: z.object().parse", {
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

if (require.main === module) {
  run();
}
