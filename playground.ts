import { z } from "./src";

declare module './src' {
  interface ZodMeta {
    title: string
  }
}

const schema = z
  .object({
    name: z.string().transform((val, ctx) => {
      console.log(ctx.meta.title)
      console.log(ctx.path)
      return val.toUpperCase()
    }),
    age: z.number()
  })

const res = schema.parse({ name: 'John', age: 30 }, { meta: { title: 'User' } })
console.log(res)

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
