import * as z from "zod/v4";

// ID is branded. Brand under the hood is an obj structur {...}
const Id = z.string().brand("Id");
const Obj = z.object({
  id: Id,
  name: z.string(),
});

const result = Obj.safeParse({});
if (result.error) {
  const tree = z.treeifyError(result.error);
  // Compare the two types
  // name is looked up as primitive string
  // id is looked up as object with its properties, ending up with the properties of string
  // this is because of the brand obj intersection with string
  type TreeId = NonNullable<(typeof tree)["properties"]>["id"];
  type TreeName = NonNullable<(typeof tree)["properties"]>["name"];
}
