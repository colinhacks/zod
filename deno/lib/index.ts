import * as mod from "./external.ts";
export * from "./external.ts";
export { mod as z };
export default mod;

const myArray = mod.array(mod.string()).parse(["foo"], {
  errorMap: (issue) => {
    if (issue.code === "too_big") {
      return { message: "Hey yo, the array must have a length of 2." };
    }
    return { message: "Nope" };
  },
});
