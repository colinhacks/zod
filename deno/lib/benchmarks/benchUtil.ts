import { Bench } from "tinybench";
// @ts-ignore
import "console.table";
import { Table, printTable } from "console-table-printer";

function formatNumber(val: number) {
  if (val >= 1e12) {
    return toFixed(val / 1e12) + "T";
  } else if (val >= 1e9) {
    return toFixed(val / 1e9) + "B";
  } else if (val >= 1e6) {
    return toFixed(val / 1e6) + "M";
  } else if (val >= 1e3) {
    return toFixed(val / 1e3) + "k";
  } else if (val >= 1) {
    return val.toString();
  } else if (val >= 1e-3) {
    return toFixed(val * 1e3) + "m";
  } else if (val >= 1e-6) {
    return toFixed(val * 1e6) + "µ";
  } else if (val >= 1e-9) {
    return toFixed(val * 1e9) + "n";
  } else if (val >= 1e-12) {
    return toFixed(val * 1e12) + "p";
  } else {
    return val.toString();
  }
}

function toFixed(val: number) {
  return val.toFixed(2).replace(/\.00$/, "");
}

export function log(name: string, bench: Bench) {
  // let fastest: number = Number.POSITIVE_INFINITY;
  // for (const task of bench.tasks) {
  //   if (task.result!.mean < fastest) {
  //     fastest = task.result!.mean;
  //   }
  // }

  const sorted = bench.tasks.sort((a, b) => a.result!.mean - b.result!.mean);

  const fastest = sorted[0];
  // console.log(`benchmarking ${name}...`);
  const table = new Table({
    columns: [
      { name: "name" },
      { name: "comp", alignment: "left" },
      { name: "ops/sec", color: "yellow" },
      { name: "mean", color: "yellow" },
    ],
  });
  for (const task of sorted) {
    table.addRow({
      name: task.name,
      comp:
        task === sorted[0]
          ? "🥇"
          : (task.result!.mean / fastest.result!.mean).toFixed(2) +
            `x slower than ${fastest.name}`,
      "ops/sec": formatNumber(1 / (task.result!.mean / 1000)) + " ops/sec",
      mean: formatNumber(task.result!.mean / 1000) + "sec",
      // margin: "±" + (task.result!.moe * 1000000).toFixed(2) + "μs",
    });
  }
  table.printTable();
  // printTable(table);
  // console.table(data);
}
