import * as z from "zod/v4";

z;

const a: any = z.lazy(() => a).optional();
const b: any = z.lazy(() => b).nullable();
const c: any = z.lazy(() => c).default({} as any);
const d: any = z.lazy(() => d).prefault({} as any);
const e: any = z.lazy(() => e).nonoptional();
const f: any = z.lazy(() => f).catch({} as any);
const g: any = z.lazy(() => z.object({ g })).readonly();
