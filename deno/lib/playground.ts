import { z } from "./index.ts";
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
