/**
 * Shared measurement utilities for the memory benchmarks.
 * Run everything under `node --expose-gc`.
 */

declare const gc: (() => void) | undefined;

export function collect(): void {
  if (typeof gc !== "function") {
    throw new Error("run with --expose-gc");
  }
  // Repeated collections: the first pass frees the bulk, later passes catch objects that only became unreachable once the first pass ran.
  for (let i = 0; i < 6; i++) gc();
}

export function heapUsed(): number {
  collect();
  return process.memoryUsage().heapUsed;
}

export interface Measurement {
  label: string;
  count: number;
  totalBytes: number;
  bytesEach: number;
}

/**
 * Builds `count` instances via `factory`, holds them all live, and reports the
 * retained heap delta. The sink array itself is subtracted out.
 */
export function measure(label: string, count: number, factory: (i: number) => unknown): Measurement {
  // Warm up so lazily-initialized module state isn't attributed to the payload.
  factory(0);

  const sink: unknown[] = new Array(count);
  const before = heapUsed();
  for (let i = 0; i < count; i++) {
    sink[i] = factory(i);
  }
  const after = heapUsed();

  // Keep the sink reachable across the measurement.
  if (sink.length !== count) throw new Error("unreachable");

  const arrayOverhead = count * 8;
  const totalBytes = after - before - arrayOverhead;
  return { label, count, totalBytes, bytesEach: totalBytes / count };
}

/**
 * Median-of-runs variant. Allocation measurements are noisy; taking the median
 * of independent runs keeps a single unlucky GC from dominating the number.
 */
export function measureStable(label: string, count: number, factory: (i: number) => unknown, runs = 5): Measurement {
  const samples: number[] = [];
  for (let r = 0; r < runs; r++) {
    samples.push(measure(label, count, factory).bytesEach);
  }
  samples.sort((a, b) => a - b);
  const bytesEach = samples[Math.floor(samples.length / 2)]!;
  return { label, count, totalBytes: bytesEach * count, bytesEach };
}

export function fmtBytes(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  if (abs >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n.toFixed(0)} B`;
}

export function table(rows: Array<Record<string, string | number>>): void {
  if (rows.length === 0) return;
  const cols = Object.keys(rows[0]!);
  const widths = cols.map((c) => Math.max(c.length, ...rows.map((r) => String(r[c]).length)));
  const line = (cells: string[]) => cells.map((cell, i) => cell.padEnd(widths[i]!)).join("  ");
  console.log(line(cols));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of rows) {
    console.log(line(cols.map((c) => String(row[c]))));
  }
}
