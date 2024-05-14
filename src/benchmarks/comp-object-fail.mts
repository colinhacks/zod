import * as mitata from "mitata";

import zOld from "zod";
import zNew from "..";

const DATA = Object.freeze({
  nest: {
    number: "asdf", // Math.random(),
    string: `${Math.random()}`,
    boolean: Math.random() > 0.5,
  },
});

const oldSchema = zOld.object({
  nest: zOld.object({
    string: zOld.string(),
    boolean: zOld.boolean(),
    number: zOld.number(),
  }),
});

const newSchema = zNew.object({
  nest: zNew.object({
    string: zNew.string(),
    boolean: zNew.boolean(),
    number: zNew.number(),
  }),
});

// rewrite in mitata
mitata.group("z.object parsing — failure", () => {
  mitata.bench("zod4", () => {
    newSchema.safeParse(DATA);
  });
  mitata.bench("zod3", () => {
    oldSchema.safeParse(DATA);
  });
});
