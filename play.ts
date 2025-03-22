import * as zm from "@zod/mini";
import * as z from "zod";

const fish = ["Salmon", "Tuna", "Trout"];

const FishEnum = z.enum(fish);
type FishEnum = z.infer<typeof FishEnum>; // string
