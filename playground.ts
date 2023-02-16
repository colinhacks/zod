import { z } from "./src";

const schema = z.string().emoji();

schema.parse("😀 is an emoji");
