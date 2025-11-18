import * as z from "zod";

z;

// Test slugify
console.log(z.string().slugify().parse("Hello World"));
console.log(z.string().check(z.slugify()).parse("Hello World"));
