import * as z from "zod";

z;

const stringToDate = z.codec(
  z.iso.datetime(), // input schema: ISO string
  z.date(), // output schema: Date object
  {
    decode: (isoString) => new Date(isoString), // string → Date
    encode: (date) => date.toISOString(), // Date → string
  }
);

console.log(stringToDate.decode("2024-01-15T10:30:00.000Z")); // Date
console.log(stringToDate.encode(new Date("2024-01-15"))); // "2024-01-15T00:00:00.000Z"
