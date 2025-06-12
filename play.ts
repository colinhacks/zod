import { z } from "zod/v4";

z;

console.dir(z.iso.datetime({ local: true }).parse("2025-05-21T12:00"), { depth: null });
