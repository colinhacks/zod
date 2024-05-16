import Benchmark from "benchmark";
import { Bench } from "tinybench";
import * as mitata from "mitata";
import { Table, printTable } from "console-table-printer";
import chalk from "chalk";
import zNew from "..";
import zOld from "zod";
import { assertNever } from "../helpers/util";

type BENCH = "tinybench" | "benchmarkjs" | "mitata";
const BENCH: BENCH = (process.env.BENCH as BENCH) || "tinybench";

export function makeData(count: number, factory: () => any) {
  return Array.from({ length: count }, () => {
    // clone non primitive data
    return factory();
  });
}
abstract class Metabench {
  abstract run(): Promise<void>;
  constructor(
    public name: string,
    public benchmarks: { [k: string]: () => any }
  ) {}

  add(name: string, fn: () => any) {
    this.benchmarks[name] = fn;
    return this;
  }
}

class Tinybench extends Metabench {
  async run() {
    const bench = new Bench({ time: 1500 });
    for (const [name, fn] of Object.entries(this.benchmarks)) {
      bench.add(name, fn);
    }
    await runBench(this.name, bench);
  }
}

class BenchmarkJS extends Metabench {
  async run() {
    const suite = new Benchmark.Suite();
    console.log("  " + chalk.white(this.name));
    for (const [name, fn] of Object.entries(this.benchmarks)) {
      suite.add(name, fn);
    }
    suite.on("cycle", (event: Benchmark.Event) => {
      // const target = event.target;
      // console.log(target.name, target.hz, target.stats!.mean);
      console.log("  → " + String(event.target));
      // print summary
    });
    suite.on("complete", (event: Benchmark.Event) => {
      // print summary
      const suite = event.currentTarget as Benchmark.Suite;

      // for(const benchmark of suite){}
      const results: {
        name: string;
        hz: number;
        mean: number;
        rme: number;
        samples: number;
      }[] = suite.map((benchmark: Benchmark) => ({
        name: benchmark.name,
        hz: benchmark.hz,
        mean: benchmark.stats.mean,
        rme: benchmark.stats.rme,
        samples: benchmark.stats.sample.length,
      }));

      results.sort((a, b) => a.hz - b.hz).reverse();
      const slowest = results[results.length - 1];

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
      for (const result of results) {
        table.addRow({
          name: result.name,
          summary:
            result === slowest
              ? "slowest"
              : (result.hz / slowest.hz).toFixed(3) +
                `x faster than ${slowest.name}`,
          "ops/sec": formatNumber(result.hz) + " ops/sec",
          "time/op": formatNumber(1 / result.hz) + "s",
          margin: "±" + result.rme.toFixed(2) + "%",
          samples: result.samples,
        });
      }

      const rendered = "  " + table.render().split("\n").join("\n  ");
      console.log();
      console.log(rendered);
      console.log();
    });
    await suite.run();
  }
}

class Mitata extends Metabench {
  async run() {
    mitata.group(this.name, () => {
      for (const [name, fn] of Object.entries(this.benchmarks)) {
        mitata.bench(name, fn);
      }
    });

    mitata.run();
  }
}

export function metabench<T extends { [k: string]: () => any }>(
  name: string,
  benchmarks?: T
) {
  let bench: Metabench;
  if (BENCH === "tinybench") {
    bench = new Tinybench(name, benchmarks || {});
  } else if (BENCH === "benchmarkjs") {
    bench = new BenchmarkJS(name, benchmarks || {});
  } else if (BENCH === "mitata") {
    bench = new Mitata(name, benchmarks || {});
  } else {
    assertNever(BENCH);
  }
  return bench;
}

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
