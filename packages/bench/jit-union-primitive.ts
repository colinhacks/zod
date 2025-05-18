import { makeData, randomPick, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";
import * as z3 from "zod/v3";
import * as z from "zod/v4";


const z3Union = z3.union([
  z3.string(), z3.number(), z3.boolean()
])

const zUnion = z.union([
  z.string(), z.number(), z.boolean()
]);

const DATA = makeData(100, () => randomPick([
  randomString(10),
  Math.random(),
  Math.random() > 0.5,
]));


const args = {jitless: true}
console.dir(z3Union.parse(DATA[0]), {depth: null});
console.dir(zUnion.parse(DATA[0]), {depth: null});
console.dir(zUnion.parse(DATA[0], args), {depth: null});

const bench = metabench("z.disriminatedUnion().parse", {
  v3(){
    for (const item of DATA) {
      z3Union.parse(item);
    }
  },
  v4_jit() {
    for (const item of DATA) {
      zUnion.parse(item);
    }
  },
  v4_jitless() {
    for (const item of DATA) {
      zUnion.parse(item,args);
    }
  },
})
  
await bench.run();
