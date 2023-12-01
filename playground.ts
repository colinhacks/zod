import { z } from "./src";
import * as mod from "node:module";
z;

// @ts-ignore
// const arg = await import("./index");
// arg;
// require.resolve(arg);

load: {
}
interface A<T> {
  name: T;
  children: any;
  render(): ReadableStream | string;
}
function Hyper<T>(arg: T) {
  return function () {} as any as {
    prototype: A<T>;
    new (): A<T>;
  };
}

export default class extends Hyper({ name: 1234 }) {
  render() {
    // this.name.name;
    return `asdf ${this.children} asdf`;
  }
}

const a = new Arg();
a.name;
