import { Bench } from "tinybench";
import { Table } from "console-table-printer";
import chalk from "chalk";
import zNew from "..";
import zOld from "zod";

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

export function toTable(bench: Bench) {
  const sorted = bench.tasks.sort((a, b) => a.result!.mean - b.result!.mean);
  // const fastest = sorted[0];
  const slowest = sorted[sorted.length - 1];

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
        task === slowest
          ? "slowest"
          : (task.result!.hz / slowest.result!.hz).toFixed(3) +
            `x faster than ${slowest.name}`,
      "ops/sec": formatNumber(task.result!.hz) + " ops/sec",
      "time/op": formatNumber(task.result!.mean / 1000) + "s",
      margin: "±" + task.result!.rme.toFixed(2) + "%",
      samples: task.result!.samples.length,
    });
  }

  return table.render();
}

export function makeSchema<T>(factory: (z: typeof zNew) => T) {
  return {
    zod4: factory(zNew),
    zod3: factory(zOld as any),
  };
}

export async function runBench(name: string, bench: Bench) {
  console.log();
  console.log(`   ${chalk.bold.white(name)}`);

  bench.addEventListener("cycle", (e) => {
    const task = e.task!.result!;

    console.log(
      chalk.dim("   ") +
        chalk.white.dim(`→ `) +
        chalk.white.dim(e.task.name) +
        chalk.white.dim(" ") +
        chalk.cyan(formatNumber(task.hz)) +
        chalk.cyan(` ops/sec`) +
        chalk.dim(" (" + e.task.result!.totalTime.toFixed(2) + "ms" + ")")
    );
  });

  await bench.warmup();
  await bench.run();

  const rendered = "   " + toTable(bench).split("\n").join("\n   ");
  console.log();
  console.log(rendered);
  console.log();
}
