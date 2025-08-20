import * as z from "zod/v4";

const stringToDate = z.codec(
  z.iso.datetime(), // input schema: ISO date string
  z.date(), // output schema: Date object
  {
    decode: (isoString) => new Date(isoString), // ISO string → Date
    encode: (date) => date.toISOString(), // Date → ISO string
  }
);

const schema = stringToDate.refine((date) => date.getFullYear() > 2000, {
  message: "Must be a valid date",
});

z.encode(schema, new Date("2000-01-01"));
// => ZodError: Must be a valid date

z.encode(schema, new Date("1999-01-01"));
// => ✅
