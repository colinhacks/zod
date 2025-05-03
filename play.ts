import * as z from "zod";

z;

const frozenLetters = Object.freeze(["a", "b"]);
const lettersAsConst = ["a", "b"] as const;

const frozenLettersParser = z.enum(frozenLetters);
const lettersAsConstParser = z.enum(lettersAsConst);

console.log(frozenLettersParser.safeParse("a"));
console.log(lettersAsConstParser.safeParse("a"));
