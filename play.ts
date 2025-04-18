import * as z from "zod";

console.log(z.toJSONSchema(z.literal(undefined), { unrepresentable: "any" }));
