import { Bench } from "tinybench";

export function log(bench: Bench) {
  let fastest: number = Number.POSITIVE_INFINITY;
  for (const task of bench.tasks) {
    if (task.result!.mean < fastest) {
      fastest = task.result!.mean;
    }
  }

  const sorted = bench.tasks.sort((task) => task.result!.mean);
  console.log(sorted);
  const data: any[] = [];
  console.log(JSON.stringify(sorted, null, 2));
  console.log(`${sorted[0].name} — fastest`);
  for (const task of sorted) {
    data.push({
      name: task.name,
      mean: task.result!.mean,
      margin: task.result!.moe,
      factor:
        task === sorted[0]
          ? "fastest"
          : (task.result!.mean / fastest).toFixed(2) + "x slower",
    });
  }
  console.table(data);
}
