import * as z from "zod";

z;

// const a = z.string(); //.check(z.check(async (_) => {}));
// console.log(a.parse("asdf"));

// console.log("sadf");

const myFunction = new Function(
  "ctx",
  "a", // Parameter with default value
  "b", // Another parameter with a default value
  "return [ctx.value, a + b]"
);

// console.log(myFunction.arguments);
console.log(myFunction.toString());
// console.log(myFunction({ value: "sup" }, 1, 2));

const bound = myFunction.bind({}, { value: "sup" });
console.log(myFunction.toString());
console.log(bound(1, 2));
