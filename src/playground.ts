import * as z from ".";

const test = z.object({
  key: z.literal("asdf"),
  name: z.string().optional(),
  age: z.number().nullable(),
  tuple: z.tuple([z.number(), z.string()]),
  set: z.set(z.boolean()),
  union: z.union([z.string(), z.number(), z.boolean()]),
  enum: z.enum(["Colin", "Ryan"]),
  record: z.record(z.object({ name: z.string() })),
  transformer: z.string().transform(async (val) => val.toUpperCase()),
});
test;

const run = async () => {
  // console.log(
  //   await test
  //     .spa({
  //       key: "asdf",
  //       name: undefined,
  //       age: null,
  //       tuple: [124, "false"],
  //       set: new Set().add(true).add(false),
  //       union: "asdf",
  //       enum: "Ryan",
  //       record: { asdf: { name: "Colin" } },
  //       transformer: "colin",
  //     })
  //     .catch(console.log)
  // );

  // const myFunc = z
  //   .function()
  //   .args(z.string())
  //   .returns(z.number())
  //   .implement((arg) => {
  //     return arg as any;
  //   });
  // console.log(myFunc("asdf"));
  const testTuple = z.tuple([
    z.object({ name: z.literal("Rudy") }),
    z.string(),
    z.array(z.literal("blue")),
  ]);
  console.log(
    await testTuple.spa([{ name: "Rudy2" }, 123, ["blue", "red"]] as any)
  );
  // console.log(
  //   await testTuple.spa([{ name: "Rudy" }, "123", ["blue", "blue"]] as any)
  // );
};
run();
