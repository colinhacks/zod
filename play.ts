import { z } from "zod/v4";

z;

const file = z
  .file()
  .max(5_000_000, { message: "File too large (max 5MB)" })
  .mime(["image/png", "image/jpeg"], { error: "Only PNG and JPEG allowed" })
  .optional();

// test parsing with invalid mime
const f = new File([""], "test.txt", {
  type: "text/plain",
});
file.parse(f);
