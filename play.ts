import { es } from "zod/locales";
// import type * as z from "zod";
import * as z from "zod/mini";

z.config(es());

z.string().parse(123);
