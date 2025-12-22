import * as z from "zod";

z.string().brand<"A", "in">();
z.string().brand<"A", "out">();
z.string().brand<"A", "inout">();
