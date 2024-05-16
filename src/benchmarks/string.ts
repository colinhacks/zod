import { makeSchema, metabench } from "./benchUtil.js";

const { zod3, zod4 } = makeSchema((z) => z.string());

const DATA = Array.from({ length: 10000 }, () => "this is a test");
let d = "this is a test";

const bench = metabench("z.string().parse", {
  zod3() {
    for (const _ of DATA) zod3.parse(d);
  },
  zod4() {
    for (const _ of DATA) zod4.parse(d);
  },
});

export default async function run() {
  await bench.run();
}

if (require.main === module) {
  run();
}
