import { metabench } from "./benchUtil";
import { zod3, zod4 } from "./object";

const BADDATA = Object.freeze({
  nest: {
    number: "asdf",
    string: 12,
    // boolean: undefined,
  },
});

const bench = metabench("small: z.object().safeParseAsync", {
  zod3() {
    zod3.parse(BADDATA);
  },
  zod4() {
    zod4.parse(BADDATA);
  },
});

export default async function run() {
  await bench.run();
}

if (require.main === module) run();
