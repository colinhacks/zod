import cronometro from "cronometro";
import { makeSchema } from "./benchUtil.js";

const { zod3, zod4 } = makeSchema((z) => z.string());

const DATA = Array.from({ length: 10000 }, () => "this is a test");

export default async function run() {
  await cronometro({
    zod3() {
      for (const d of DATA) zod3.parse(d);
    },
    zod4() {
      for (const d of DATA) zod4.parse(d);
    },
  });
}

cronometro({
  zod3() {
    zod3.parse(DATA);
  },
  zod4() {
    zod4.parse(DATA);
  },
});

// if (require.main === module) {
//   await run();
// }
