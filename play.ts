import * as z from "zod";

z;

export const Field1Schema = z.strictObject({
  "field1.1": z.string(),
  "field1.2": z.number(),
});

export const Field2Schema = z.strictObject({
  "field2.1": z.boolean(),
  "field2.2": z.date(),
});

export const SomeSchema = z.strictObject({
  field1: Field1Schema as typeof Field1Schema,
  field2: Field2Schema as typeof Field2Schema,
});
