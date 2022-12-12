import { Schema, z } from "./src";

async function main() {
  const schema = z.custom<`${number}px`>(
    (val) => typeof val === "string" && /^\d+px$/.test(val),
    {
      message: "Not a valid px string",
    }
  );
  console.log(schema.parse("100px")); // pass
  console.log(schema.parse("100vw")); // fail
}
main();
