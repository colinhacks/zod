import * as z from "zod";

z;

const stringToDate = z.codec(
  z.iso.datetime(), // input schema: ISO date string
  z.date(), // output schema: Date object
  {
    decode: (isoString) => new Date(isoString),
    encode: (date) => date.toISOString(),
  }
);

const schema = stringToDate.refine((date) => date.getFullYear() > 2000, "must be after 2000");
