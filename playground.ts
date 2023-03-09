import { z } from "./src";
z;

function recursive<T extends z.ZodTypeAny>(
  callback: <G extends z.ZodTypeAny>(schema: G) => T
): T {
  return "asdf" as any;
}

const cat = recursive((type) => {
  return z.object({
    name: z.string(),
    subcategories: type,
  });
});
type cat = z.infer<typeof cat>; //["subcategories"];
declare let fido: cat;
fido;
fido.subcategories![0];
