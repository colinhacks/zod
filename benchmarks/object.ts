import { zodbench } from "./zodbench.js";

const bench = zodbench({
  name: "z.object().parse",
  batch: 1000,
  schema(z) {
    return z.object({
      string: z.string(),
      boolean: z.boolean(),
      number: z.number(),
    });
  },
  data() {
    return Object.freeze({
      number: Math.random(),
      string: `${Math.random()}`,
      boolean: Math.random() > 0.5,
    });
  },
  benchmark(d) {
    this.schema.parse(d);
  },
});

export default bench.run;

if (require.main === module) {
  bench.run();
}
