import * as mitata from "mitata";
import { makeSchema } from "./benchUtil.js";

const { zod3, zod4 } = makeSchema((z) => z.string());

const DATA = Array.from({ length: 10000 }, () => "this is a test");

mitata.group("string", () => {
  mitata.bench("zod3", () => {
    for (const d of DATA) zod3.parse(d);
  });
  mitata.bench("zod4", () => {
    for (const d of DATA) zod4.parse(d);
  });
});

mitata.run();
