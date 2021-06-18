import { z } from "./index.ts";

class Test {
  constructor(public readonly path: string) {}
}

const test = new Test("asdf");
console.log(test.path);
const run = async () => {
  z;
};

run();

export {};
