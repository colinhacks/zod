import { z } from ".";
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
};

run();

export {};
