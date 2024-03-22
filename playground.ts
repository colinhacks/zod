import { z } from "./src";

z;

const schema = z.object({ name: z.string() }).catchall(z.string());

type schema = z.input<typeof schema>;
