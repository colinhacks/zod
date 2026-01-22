import { z } from "zod";

const type1 = z.literal(["a", "b", "c"]);
const type2 = z.literal([1, 2, 3]);

const record = z.partialRecord(z.union([type1, type2]), z.string());

console.log(record.parse({ a: "1", 2: "4" }));
