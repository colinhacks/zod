import { z } from "zod/v4";

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

const data = {
  name: "John Doe",
  age: 30,
};

const result = schema.safeParse(data);

if (result.success) {
  console.log("Parsed data:", result.data);
} else {
  console.error("Validation errors:", result.error);
}
