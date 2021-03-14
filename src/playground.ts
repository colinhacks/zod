import { z } from ".";

const run = async () => {
  // const schema = z.array(z.string().transform((name) => ({ name })));
  // const schemaWD = schema.default(["asdf", "qwer"]);
  // type schema = z.infer<typeof schema>;
  // type schemaWD = z.infer<typeof schema>;
  // const os = z
  //   .string()
  //   .transform((val) => val.length)
  //   .optional();
  // type os1 = z.input<typeof os>;
  // type os2 = z.output<typeof os>;

  const oswd = z
    .object({
      nameToLength: z
        .string()
        .transform((val) => val.length)
        .default("asdf"),
      nameToUpper: z.string().transform((val) => val.toUpperCase()),
    })
    .default({ nameToLength: undefined, nameToUpper: "undefined" });
  // type oswd1 = z.input<typeof oswd>;
  // type oswd2 = z.output<typeof oswd>;
  console.log(oswd.parse(undefined));

  // const asdf = new z.ZodOptional({
  //   innerType: z.string(),
  //   defaultValue: () => "strg",
  // });
};

run();

export {};
