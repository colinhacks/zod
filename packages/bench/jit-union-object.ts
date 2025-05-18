import { makeData, randomPick, randomString } from "./benchUtil.js";
import { metabench } from "./metabench.js";
import * as z3 from "zod/v3";
import * as z from "zod/v4";

const z3fields = {
  data1: z3.string(),
  data2: z3.string(),
  data3: z3.string(),
  // data4: z3.string(),
  // data5: z3.string(),
  // data6: z3.string(),
  // data7: z3.string(),
  // data8: z3.string(),
  // data9: z3.string(),
  // data10: z3.string(),
}

const z3Union = z3.union([
  z3.object({ ... z3fields }),
  z3.object({ ... z3fields }),
  z3.object({ ... z3fields }),
  z3.object({ ... z3fields }),
  z3.object({ ... z3fields }),
  z3.object({ ... z3fields }),
  z3.object({ ... z3fields }),
])
const zfields = {
  data1: z.string(),
  data2: z.string(),
  data3: z.string(),
  // data4: z.string(),
  // data5: z.string(),
  // data6: z.string(),
  // data7: z.string(),
  // data8: z.string(),
  // data9: z.string(),
  // data10: z.string(),
}
const zUnion = z.union([
  z.object({ ...zfields }),
  z.object({ ...zfields }),
  z.object({ ...zfields }),
  z.object({ ...zfields }),
  z.object({ ...zfields }),
  z.object({ ...zfields }),
  z.object({ ...zfields }),
]);

const DATA = makeData(100, () => ({ 
  data1: randomString(10),
  data2: randomString(10),
  data3: randomString(10),
 }));


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
