import * as z from "zod/mini";

// valid hostnames
z.hostname().parse("localhost");
