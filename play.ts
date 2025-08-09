import { z } from "zod/v4";

z;

// import { z } from "zod";
const BrandedSchema = z.string().brand<"brand">();
const WrappedSchema = z.object({ key: BrandedSchema });

type bso = typeof BrandedSchema._output;
type basdfasdfso = typeof BrandedSchema._zod.output;
type wso = (typeof WrappedSchema._output)["key"];
type bso2 = z.output<typeof BrandedSchema>;
type wso2 = z.output<typeof WrappedSchema>["key"];
