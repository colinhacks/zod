import * as z from "zod";
// import * as z from "zod";

z;

const Player = z.interface({
  username: z.string(),
  xp: z.number(),
});
Player.parse({ username: 42, xp: "100" });
