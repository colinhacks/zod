import * as z from "zod";

const stringbool = z.stringbool({ truthy: ["yes", "y"], falsy: ["no", "n"] });

console.log(z.encode(stringbool, true)); // => "yes"
console.log(z.encode(stringbool, false)); // => "no"
