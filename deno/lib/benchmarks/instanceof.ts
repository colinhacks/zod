import { makeData, metabench } from "./benchUtil.js";

const ZOD_FAILURE = "~~key~~";

class ZodFailure {
  [ZOD_FAILURE] = true;
  tag = ZOD_FAILURE;

  constructor(public value: string) {}
}

// const DATA = Object.assign(Object.create(null), {
//   tag: ZOD_FAILURE,
//   [ZOD_FAILURE]: true,
//   [ZOD_FAILURE]: true,
// });
export var DATA = makeData(1000, () => {
  const random = Math.random();
  if (random > 0.75) return new ZodFailure("test");
  if (random > 0.5) return { name: "Colin" };
  if (random > 0.25) return "hello";
  return Promise.resolve("hello");
});

const instanceofClass = (x: any) => x instanceof ZodFailure; // 0.64!
const instanceofPromise = (x: any) => x instanceof Promise; // 0.64!
const keyin = (x: any) => typeof x === "object" && x && ZOD_FAILURE in x;
// const typeofObject = (x: any) => typeof x === "object";
const typeofThenCheckSymbol = (x: any) =>
  typeof x === "object" && x?.[ZOD_FAILURE]; // 1.69
const typeofThenCheckTag = (x: any) =>
  typeof x === "object" && x?.tag === ZOD_FAILURE; // 1.69
const instanceofObjectThenCheckSymbol = (x: any) =>
  x instanceof Object && x[ZOD_FAILURE]; // 1.69
const instanceofObjectThenCheckTag = (x: any) =>
  x instanceof Object && x.tag === ZOD_FAILURE; // 1.69
const falsyThenCheckTag = (x: any) => x && x.tag === ZOD_FAILURE; // 1.59
const falsyThenCheckSymbol = (x: any) => x && x[ZOD_FAILURE]; // 1.74
const nullChainCheckSymbol = (x: any) => x?.[ZOD_FAILURE]; // 1.74
const nullChainCheckTag = (x: any) => x?.tag === ZOD_FAILURE; // 1.74

const bench = metabench("instanceof")
  .add("instanceofClass", () => {
    for (const d of DATA) instanceofClass(d);
  })
  .add("instanceofPromise", () => {
    for (const d of DATA) instanceofPromise(d);
  })
  .add("keyin", () => {
    for (const d of DATA) keyin(d);
  })
  .add("typeofThenCheckSymbol", () => {
    for (const d of DATA) typeofThenCheckSymbol(d);
  })
  .add("typeofThenCheckTag", () => {
    for (const d of DATA) typeofThenCheckTag(d);
  })
  .add("instanceofObjectThenCheckSymbol", () => {
    for (const d of DATA) instanceofObjectThenCheckSymbol(d);
  })
  .add("instanceofObjectThenCheckTag", () => {
    for (const d of DATA) instanceofObjectThenCheckTag(d);
  })
  .add("falsyThenCheckTag", () => {
    for (const d of DATA) falsyThenCheckTag(d);
  })
  .add("falsyThenCheckSymbol", () => {
    for (const d of DATA) falsyThenCheckSymbol(d);
  })
  .add("nullChainCheckSymbol", () => {
    for (const d of DATA) nullChainCheckSymbol(d);
  })
  .add("nullChainCheckTag", () => {
    for (const d of DATA) nullChainCheckTag(d);
  });

export default async function run() {
  await bench.run();
}

if (require.main === module) {
  run();
}
