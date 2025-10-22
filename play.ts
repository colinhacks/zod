import * as z from "zod";

const Keys = z.literal(["id", "name", "email"]);
const schema = z.partialRecord(Keys, z.string());
type Schema = z.infer<typeof schema>;

schema.parse({ id: "1" });
