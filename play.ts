import { z } from "zod/v4";
const schema_02 = z.enum({
  A: 1,
  B: "A",
});

schema_02.parse("A");
