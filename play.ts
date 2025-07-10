import * as z from "zod/mini";

// z.instanceof(URL).check(z.property("hash", z.string().min(10)), z.property("search", z.string().min(10)));

const typeid = z.templateLiteral([z.enum(["a", "b", "c"]), "_", z.string().check(z.regex(/[a-z0-9]{10}/))], {
  format: "typeid",
});
console.log(typeid.parse("d_1234567890"));

// throws ZodError ❌
[
  {
    code: "invalid_format",
    format: "typeid",
    pattern: "^(a|b|c)_[a-z0-9]{10}$",
    path: [],
    message: "Invalid typeid",
  },
];

// z.file().parse({}).foo;
