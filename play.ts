import * as z from "@zod/mini";

const Category = z.object({
  name: z.string(),
  get parent() {
    return Category;
  },
});

type Category = z.infer<typeof Category>;

// base type
interface ZodType {
  optional: "true" | "false";
  output: any;
}

// string
interface ZodString extends ZodType {
  optional: "false";
  output: string;
}

// object
type ZodShape = Record<string, any>;
type Prettify<T> = { [K in keyof T]: T[K] } & {};
type InferObjectType<Shape extends ZodShape> = Prettify<
  {
    [k in keyof Shape as Shape[k] extends { optional: "true" } ? k : never]?: Shape[k]["output"];
  } & {
    [k in keyof Shape as Shape[k] extends { optional: "true" } ? never : k]: Shape[k]["output"];
  }
>;
interface ZodObject<T extends ZodShape> extends ZodType {
  optional: "false";
  output: InferObjectType<T>;
}

// optional
interface ZodOptional<T extends ZodType> extends ZodType {
  optional: "true";
  output: T["output"] | undefined;
}

// factories
declare function object<T extends ZodShape>(shape: T): ZodObject<T>;
declare function string(): ZodString;
declare function optional<T extends ZodType>(schema: T): ZodOptional<T>;

// recursive type inference error
const _Category = object({
  name: string(),
  get parent() {
    return optional(_Category);
  },
});

type _Category = (typeof _Category)["output"];

export const name = _Category.output.parent?.parent?.parent?.parent?.name;
//           ^?
