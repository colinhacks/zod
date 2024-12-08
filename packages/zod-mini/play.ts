import { randomUUID } from "node:crypto";
import * as z from "zod-mini";

const schema = z.string([z.uuid()]);

z.parse(schema, "asdf");
z.parse(schema, randomUUID());
