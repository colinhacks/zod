import { z } from "zod/v4";

const result = z.string().safeParse(12);
console.log(result.error! instanceof Error); // => false

try {
  z.string().parse(12);
} catch (err) {
  console.log(err instanceof Error); // => true
}
