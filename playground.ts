import { z } from "./src";

declare module './src' {
  interface ZodMeta {
    foo: string
  }
}

const basicSchema = z.string().transform((val, ctx) => {
  console.log(ctx.meta.foo)
  return val.toUpperCase()
})

const res1 = basicSchema.parse('zce', { meta: { foo: 'bar' } })
console.log(res1)

const objSchema = z
  .object({
    name: z.string().transform((val, ctx) => {
      console.log(ctx.meta.foo)
      console.log(ctx.path)
      return val.toUpperCase()
    }),
    age: z.number().superRefine((val, ctx) => {
      console.log(ctx.meta.foo)
      console.log(ctx.path)
      return val > 0
    })
  })

const res2 = objSchema.parse({ name: 'John', age: 30 }, { meta: { foo: 'bar' } })
console.log(res2)

// import { z } from "./src";
// import * as mod from "node:module";
// z;

// // @ts-ignore
// // const arg = await import("./index");
// // arg;
// // require.resolve(arg);

// load: {
// }
// interface A<T> {
//   name: T;
//   children: any;
//   render(): ReadableStream | string;
// }
// function Hyper<T>(arg: T) {
//   return function () {} as any as {
//     prototype: A<T>;
//     new (): A<T>;
//   };
// }

// export default class extends Hyper({ name: 1234 }) {
//   render() {
//     // this.name.name;
//     return `asdf ${this.children} asdf`;
//   }
// }

// const a = new Arg();
// a.name;
