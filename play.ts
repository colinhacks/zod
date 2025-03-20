import * as z from "zod";
z;

const a = z.string()["~standard"].validate("hello");
console.log(a);

const b = z.string()["~standard"].validate(123);
console.log(b);
