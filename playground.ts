/**
 * Description: This file is used to test the zod library after any changes are made in development mode.
 * Donot push this file to the repository. Keep is as it is while pushing to the repository.
 * To run this file, run the command "npm run play" in the terminal.
 */

import { z } from "./src"; //donot remove this line

//play with zod here

//sample user schema
const UserSchema = z.object({
  username: z.string().min(3).max(10).startsWith("user_"),
  age: z.number().int().positive(),
  name: z.string().min(5).max(20),
  address: z.string().min(10).max(50).optional(),
});

const user1 = {
  username: "user_john",
  age: 20,
  name: "John Doe",
  address: "Some address",
};

const user2 = {
  username: "miles",
  age: 20,
  name: "Miles",
  address: "Some address 2",
};

console.log("\n\n\n");

// user1 is valid
try {
  UserSchema.parse(user1);
  console.log("user1 is valid");
} catch (err) {
  console.log("user1 is invalid");
}

// user2 is invalid
try {
  UserSchema.parse(user2);
  console.log("user2 is valid");
} catch (err) {
  console.log("user2 is invalid");
}
console.log("\n\n\n");

// types of user
export type User = z.infer<typeof UserSchema>;

