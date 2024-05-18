import type z from "../index.ts";
import { makeSchema } from "./benchUtil.ts";
import { metabench } from "./metabench.ts";

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
    const DATA = params.data();
    bench.add("zod4", () => {
      zod4Bench(DATA);
    });
    bench.add("zod3", () => {
      zod3Bench(DATA);
    });
  } else {
    const DATA = Array.from({ length: params.batch || 1000 }, params.data);
    bench.add("zod4", () => {
      for (const d of DATA) zod4Bench(d);
    });
    bench.add("zod3", () => {
      for (const d of DATA) zod3Bench(d);
    });
  }

  return bench;
}
