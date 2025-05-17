import { z } from "zod/v4";

z;

const stringWithDefault = z
  .pipe(
    z.transform((v) => (v === "none" ? undefined : v)),
    z.string()
  )
  .catch("default");

stringWithDefault.parse(undefined);
