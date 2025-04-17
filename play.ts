import * as zm from "@zod/mini";
import * as z from "zod";

zm._default;

z.config(z.locales.es());

const result = z.string().safeParse(123);

result.error!.issues[0].message;
// => Entrada inválida: se esperaba string, recibido número
