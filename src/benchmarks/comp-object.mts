import * as mitata from "mitata";

import zOld from "zod";
import zNew from "..";

const DATA = Object.freeze({
  number: Math.random(),
  string: `${Math.random()}`,
  boolean: Math.random() > 0.5,
});

const oldSchema = zOld.object({
  string: zOld.string(),
  boolean: zOld.boolean(),
  number: zOld.number(),
});

const newSchema = zNew.object({
  string: zNew.string(),
  boolean: zNew.boolean(),
  number: zNew.number(),
});

// rewrite in mitata
mitata.group("object parsing", () => {
  mitata.bench("zod4", () => {
    newSchema.parse(DATA);
  });
  mitata.bench("zod3", () => {
    oldSchema.parse(DATA);
  });
});

mitata.run();
