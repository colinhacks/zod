import * as z from "zod";

z;

z.string().slugify().parse("Hello World");
// => "hello-world"
