import { z } from "./src";
z;

function recursive<T extends z.ZodTypeAny>(
  callback: <G extends z.ZodTypeAny>(schema: G) => T
): T {
  return "asdf" as any;
}

const cat = recursive((type) => {
  return z.object({
    name: z.string(),
    subcategories: type,
  });
});
type cat = z.infer<typeof cat>; //["subcategories"];
declare let fido: cat;
fido;
fido.subcategories![0];

declare const __nominal__type: unique symbol;
declare const __nominal__type2: unique symbol;

const arg = {
  a: "asdf",
  b: "asdf",
  c: "asdf",
  ["$type"]: () => {},
  ["@@type"]: () => {},
  ["{type}"]: 1324,
};

arg;

const kwarg = {
  [__nominal__type2]: "asdf",
};

type aklmdf = typeof arg extends typeof kwarg ? true : false;
