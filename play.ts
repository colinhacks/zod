import { z } from "zod/v4";

z.string().parse(12, {
  reportInput: true,
});
