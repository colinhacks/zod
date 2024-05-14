import * as mitata from "mitata";

import zOld from "zod";
import zNew from "..";

const DATA = Math.random();

const oldSchema = zOld.number();
const newSchema = zNew.number();

// rewrite in mitata
mitata.group("z.number parsing", () => {
  mitata.bench("zod4", () => {
    newSchema.parse(DATA);
  });
  mitata.bench("zod3", () => {
    oldSchema.parse(DATA);
  });
});

mitata.run();
