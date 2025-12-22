import { z } from "./packages/zod/src/v4/index.js";

// Test the z.file() case
const c = z.file().mime(["image/png", "image/jpg"]).min(1000).max(10000);
console.log("z.file() schema:", JSON.stringify(z.toJSONSchema(c), null, 2));

// Test the metadata case
const metaFirstSchema = z.object({
  name: z.string().meta({ describe: "First name", title: "Name Field" }).min(1),
});
console.log("metadata schema:", JSON.stringify(z.toJSONSchema(metaFirstSchema), null, 2));