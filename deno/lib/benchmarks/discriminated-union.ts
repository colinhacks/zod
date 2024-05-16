import { makeSchema, metabench } from "./benchUtil.js";

const { zod3, zod4 } = makeSchema((z) => {
  const aSchema = z.object({
    type: z.literal("a"),
  });

  const bSchema = z.object({
    type: z.literal("b"),
  });

  const cSchema = z.object({
    type: z.literal("c"),
  });

  return z.discriminatedUnion("type", [aSchema, bSchema, cSchema]);
});

const DATA = { type: "c" };
const bench = metabench("z.disriminatedUnion().parse")
  .add("zod3", () => {
    zod3.parse(DATA);
  })
  .add("zod4", () => {
    zod4.parse(DATA);
  });

export default async function run() {
  await bench.run();
}

if (require.main === module) {
  run();
}
