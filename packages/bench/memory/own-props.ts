/**
 * Enumerates exactly what each schema instance owns: own properties on the
 * instance and on `_zod`, split by whether the value is a per-instance
 * function (a closure allocated at construction) or shared/data.
 */
import * as z from "zod";
import { table } from "./harness.js";

function describe(label: string, a: any, b: any): void {
  const report: Array<{ where: string; key: string; kind: string; perInstance: string }> = [];

  for (const [where, objA, objB] of [
    ["inst", a, b],
    ["_zod", a._zod, b._zod],
  ] as const) {
    for (const key of Reflect.ownKeys(objA)) {
      const d = Object.getOwnPropertyDescriptor(objA, key)!;
      const dB = Object.getOwnPropertyDescriptor(objB, key);
      let kind: string;
      let perInstance: string;
      if (d.get || d.set) {
        kind = `accessor${d.get ? " get" : ""}${d.set ? " set" : ""}`;
        // Accessor pairs defined per-instance are distinct function objects.
        perInstance = dB && (d.get !== dB.get || d.set !== dB.set) ? "YES" : "no";
      } else {
        const v = d.value;
        kind = typeof v === "function" ? "function" : Array.isArray(v) ? `array[${v.length}]` : typeof v;
        perInstance = dB && typeof v === "object" && v !== null ? (v !== dB.value ? "YES" : "no") : "";
        if (typeof v === "function") perInstance = dB && v !== dB.value ? "YES" : "no";
      }
      report.push({ where, key: String(key), kind, perInstance });
    }
  }

  const closures = report.filter(
    (r) => (r.kind === "function" || r.kind.startsWith("accessor")) && r.perInstance === "YES"
  );
  const objects = report.filter((r) => r.kind === "object" && r.perInstance === "YES");

  console.log(`\n=== ${label} ===`);
  console.log(
    `own props: inst=${Reflect.ownKeys(a).length}, _zod=${Reflect.ownKeys(a._zod).length}` +
      `  |  per-instance functions: ${closures.length}, per-instance objects: ${objects.length}`
  );
  table(report);
}

describe("z.string()", z.string(), z.string());
describe("z.object({a: string})", z.object({ a: z.string() }), z.object({ a: z.string() }));
