import { z } from "./src";
const px = z.custom<`${number}px`>((val) => /^\d+px$/.test(val as string));
px.parse("100px"); // pass
px.parse("100vw"); // fail
