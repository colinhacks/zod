import { z } from "zod/v4";

const zodSchema = z
  .object({
    password: z.string().min(1),
    nested: z
      .object({
        confirm: z
          .string()
          .min(1)
          .refine((value) => value.length > 2, {
            message: "Confirm length should be > 2",
          }),
      })
      .refine(
        (data) => {
          return data.confirm === "bar";
        },
        {
          path: ["confirm"],
          error: 'Value must be "bar"',
        }
      ),
  })
  .refine(
    (data) => {
      return data.nested.confirm === data.password;
    },
    {
      path: ["nested", "confirm"],
      error: "Password and confirm must match",
    }
  );

const DATA = {
  password: "bar",
  nested: { confirm: "" },
};

// ✅ OK
const result1 = zodSchema.safeParse(DATA);
console.dir(result1, { depth: null });

const result2 = zodSchema.safeParse(DATA, { jitless: true });
console.dir(result2, { depth: null });
zodSchema.safeParse(DATA, { jitless: true });
zodSchema.safeParse(DATA, { jitless: true });
zodSchema.safeParse(DATA, { jitless: true });

const result3 = zodSchema["~standard"].validate(DATA);
console.dir(result3, { depth: null });
