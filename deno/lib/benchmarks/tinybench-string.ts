import { Bench } from "tinybench";

import zOld from "zod";
import zNew from "../index.ts";
import { log } from "./benchUtil.ts";

function makeSchemas(z: typeof zNew) {
  return {
    string: z.string(),
    optional: z.string().optional(),
    nullable: z.string().nullable(),
  };
}

const news = makeSchemas(zNew);
const olds = makeSchemas(zOld as any);

const DATA = "this is a test";

const bench = new Bench();

bench.add("zod3", () => olds.string.parse(DATA));
bench.add("zod4", () => news.string.parse(DATA));

export default async function run() {
  await bench.warmup();
  await bench.run();

  log("z.string()", bench);
}

run();
