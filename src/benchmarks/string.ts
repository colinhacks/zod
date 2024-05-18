import { randomString } from "./benchUtil.js";
import { zodbench } from "./zodbench.js";

const bench = zodbench({
  name: "z.string().parse",
  batch: 10000,
  schema(z) {
    return z.string();
  },
  data() {
    return randomString(10);
  },
  benchmark(d) {
    this.schema.parse(d);
  },
});

export default async function run() {
  await bench.run();
}

if (require.main === module) {
  run();
}
