import type z from "../index";
import { makeSchema } from "./benchUtil";
import { metabench } from "./metabench";

interface ZodBenchParams<T extends z.ZodType, D> {
  name: string;
  schema: (_z: typeof z) => T;
  data: () => D;
  batch?: number | null;
  benchmark: (arg: D) => void | Promise<void>;
}

export function zodbench<T extends z.ZodType, D>(
  params: ZodBenchParams<T, D> & ThisType<{ schema: T }>
) {
  const bench = metabench(params.name);
  console.log(`Batch size: ${params.batch}`);

  const { zod3, zod4 } = makeSchema(params.schema);

  const zod3Bench = params.benchmark.bind({ schema: zod3 });
  const zod4Bench = params.benchmark.bind({ schema: zod4 });

  if (params.batch === null) {
    // biome-ignore lint/style/noVar: <explanation>
    // biome-ignore lint/correctness/noInnerDeclarations: <explanation>
    const DATA = params.data();
    bench.add("zod4", () => {
      zod4Bench(DATA);
    });
    bench.add("zod3", () => {
      zod3Bench(DATA);
    });
  } else {
    // biome-ignore lint/style/noVar: <explanation>
    // biome-ignore lint/correctness/noInnerDeclarations: <explanation>
    const BATCHDATA = Array.from({ length: params.batch || 1000 }, params.data);
    bench.add("zod4", () => {
      for (const d of BATCHDATA) zod4Bench(d);
    });
    bench.add("zod3", () => {
      for (const d of BATCHDATA) zod3Bench(d);
    });
  }

  return bench;
}
