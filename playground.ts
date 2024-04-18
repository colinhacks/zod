import { z } from "./src/index";

z;

// const User = z
//   .object({
//     name: z.string(),
//     age: z.number(),
//   })
//   .remap((shape) => ({
//     name: shape.name.optional(),
//     age: shape.age.nullable(),
//   }));

// type User = z.infer<typeof User>;
// // { name?: string | null; age?: number | null; }

// const User = z
//   .object({
//     name: z.string(),
//     age: z.number(),
//   })
//   .remap(() => ({
//     name: "fullname",
//     age: "newage",
//   }));

// type User = z.infer<typeof User>;
// // { fullname: string; newage: number; }

const User = z.object({
  name: z.string(),
  age: z.number(),
});

const ModUser = User.remap({
  name: "fullname",
  age: User.shape.age.optional(),
});

type ModUser = z.infer<typeof ModUser>;
// { fullname: string; age?: number; }
