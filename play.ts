import * as z from "zod";

export function moneyAmountString() {
  return z
    .string()
    .regex(/^(0|[1-9]\d*)\.\d{2}$/, { message: "Must be a number with exactly 2 decimal places" })
    .refine((val) => Number.parseFloat(val) > 0, { message: "Money amount must be greater than 0" });
}

const schema = z.object({ money: moneyAmountString() });
type schema = z.output<typeof schema>;
// { money: string }

const res = schema.safeParse({ money: "1.00" });
console.log(res);
