import * as z from "zod";
import { toJSONSchema } from "./packages/zod/src/v4/core/to-json-schema-old.js";

z;

const a = z.string().meta({ id: "hi" });
console.log(toJSONSchema(a));
console.log(toJSONSchema(a.meta({ name: "asdf" })));
