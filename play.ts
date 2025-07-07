import { z } from "zod/v4";

z;

const a = z.string().meta({ id: "stuff" });
const b = z.string().meta({ id: "stuff" });
const obj = z.object({ a, b });

const json = z.toJSONSchema(obj);
console.log(json);
