import * as z from "./packages/zod/src/v4/index.js";

const Schema = z.record(z.enum(["key1", "key2"]), z.number());

console.log(z.toJSONSchema(Schema));
