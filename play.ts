import * as z from "zod";

z.number({
  error: "positiveNumber",
})
  .int("positiveNumber")
  .min(1, "positiveNumber");
