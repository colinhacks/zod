import { z } from "./index";

const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === "string") {
      return { message: "bad type!" };
    }
  }
  if (issue.code === z.ZodIssueCode.custom) {
    return { message: `less-than-${(issue.params || {}).minimum}` };
  }
  return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);

const NUMBER = (Symbol.for("number") as any) as number;
const STRING = (Symbol.for("string") as any) as string;

const obj = {
  one: NUMBER,
  two: STRING,
  get obj() {
    return [obj];
  },
} as const;

const pass = <T>(arg: T) => {
  return arg;
};
const A = pass({
  get b() {
    return B;
  },
});
const B = pass({
  get a() {
    return A;
  },
});
const run = async () => {
  z;

  const data = z
    .object({
      name: z.string(),
    })
    .safeParse({ name: 12 });

  console.log(data);
  if (!data.success) console.log(data.error.format());
  // console.log(z.promise(z.any()).safeParse(Promise.resolve("asdf")));
  // console.log(z.any().safeParse("sdf"));
};

run();

export {};

// const stringOrNumber = z.string().or(z.number()).or(z.boolean());
