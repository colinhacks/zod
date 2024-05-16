import { Bench } from "tinybench";
// @ts-ignore
import "console.table";
import { Table } from "console-table-printer";
import chalk from "chalk";

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
  return val.toPrecision(3);
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
      { name: "name", color: "white" },
      { name: "summary", alignment: "left" },
      { name: "ops/sec", color: "cyan" },
      { name: "time/op", color: "magenta" },
      { name: "margin", color: "magenta" },
      { name: "samples", color: "magenta" },
    ],
  });
  for (const task of sorted) {
    table.addRow({
      name: task.name,
      summary:
        task === sorted[0]
          ? "🥇"
          : (task.result!.mean / fastest.result!.mean).toFixed(3) +
            `x slower than ${fastest.name}`,
      "ops/sec": formatNumber(task.result!.hz) + " ops/sec",
      "time/op": formatNumber(task.result!.mean / 1000) + "s",
      margin: "±" + task.result!.rme.toFixed(2) + "%",
      samples: task.result!.samples.length,
    });
  }
  const rendered = "  " + table.render().split("\n").join("\n  ");
  console.log();
  console.log(`   ${chalk.bold(chalk.white(name))} benchmark results`);
  console.log(rendered);
  console.log();
  // printTable(table);
  // console.table(data);
}
