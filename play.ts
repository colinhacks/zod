import * as z from "zod";

const schema = z.union([z.string(), z.null()]);
console.log(z.toJSONSchema(schema, { target: "openapi-3.0" }));
