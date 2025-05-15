import * as zMini from "zod/v4-mini";

z;

zMini.pipe(
  zMini.pipe(
    zMini.string().check(zMini.regex(/asdf/)),
    zMini.transform((v) => new Date(v))
  ),
  zMini.date().check(zMini.maximum(new Date()))
);
