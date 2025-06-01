import { z } from "zod/v4";

z;
const recordWithBrandedNumberKeys = z.record(z.number().brand("SomeBrand"), z.number());
type recordWithBrandedNumberKeys = z.infer<typeof recordWithBrandedNumberKeys>;
