import { z } from "./src";
z;

const schema = z.coerce.date();
// console.log(schema.parse("3.14"));
test("asdf", () => {
  expect(schema.parse("3.14")).toBeInstanceOf(Date);
});
