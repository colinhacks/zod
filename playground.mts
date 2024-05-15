import z from "./src";
// import { z  } from "zod";
z;

const schema = z.string();
console.log(schema.safeParse("asdf"));
console.log(schema.safeParse("asdf"));
