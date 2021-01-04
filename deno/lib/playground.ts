import * as z from "./index.ts";

const numberWithRandomDefault = z.number().default(Math.random);
console.log(numberWithRandomDefault.parse(undefined));
console.log(numberWithRandomDefault.parse(undefined));
console.log(numberWithRandomDefault.parse(undefined));
console.log(numberWithRandomDefault.parse(undefined));

export {};
