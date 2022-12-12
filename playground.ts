import { Schema, z } from "./src";

async function main() {
  const dateRangeValidator = (val: {
    startDate?: Date;
    endDate?: Date;
    actualDate: Date;
  }) => {
    if (!val.startDate && !val.endDate) return true;
    if (!val.startDate || !val.endDate) return false;
    return val.actualDate >= val.startDate && val.actualDate <= val.endDate;
  };
  z.object({ asdf: z.string() }, { required_error: "asdf" });

  const schema = z
    .object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      actualDate: z.date(),
    })
    .refine(dateRangeValidator);

  z.enum(["asdf"], { required_error: "error mesage" });
  console.log(schema.parse("100px")); // pass
  console.log(schema.parse("100vw")); // fail
}
main();

const myErrorMap: z.ZodErrorMap = (val, ctx) => {
  return { message: "whatever" };
};
z.setErrorMap(myErrorMap);
