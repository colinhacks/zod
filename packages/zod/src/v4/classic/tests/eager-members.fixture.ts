// a module that exports a schema, automocked by eager-members.test.ts the way a user's schema module is
import * as z from "zod/v4";

export const Fixture = z.object({ content: z.string().optional() });
