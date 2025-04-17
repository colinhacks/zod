import * as z from "zod";

const Record = z.record(z.enum(["a", "b", "c"]), z.number());
type Record = z.infer<typeof Record>;
Record.parse({
  a: 1,
  // b: 2,
  // c: 3,
});

const PartialRecord = z.record(z.enum(["a", "b", "c"]).or(z.never()), z.number());
type PartialRecord = z.infer<typeof PartialRecord>;
PartialRecord.parse({
  a: 1,
  // b: 2,
  // c: 3,
});
