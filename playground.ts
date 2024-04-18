import { z } from "./src/index";

z;

const User = z.object({ name: z.string(), age: z.number() });

const UpdatedUser = User.remap((shape) => ({
  name: "fullName",
  age: shape.age.nullable(),
}));
type UpdatedUser = z.infer<typeof UpdatedUser>;

const user: UpdatedUser = {
  fullName: "Betty Brant",
  age: null,
};
