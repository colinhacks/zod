import * as z_cjs from "./node_modules/zod/dist/commonjs/v4/index.js";
import * as z_esm from "./node_modules/zod/dist/esm/v4/index.js";

z_cjs.string() instanceof z_esm.ZodString;
// => true
