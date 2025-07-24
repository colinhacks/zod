import * as z from "zod/v4";

z;

function myThing() {
  const schema = z.custom<string>((val) => typeof val === "string");
  schema._zod.toJSONSchema = () => ({
    type: "string",
  });
  return schema;
}

console.log(z.toJSONSchema(myThing()));

z.file().parse({}).text;
