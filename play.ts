import * as z from "zod";

z.config(z.locales.es());

const result = z.string().safeParse(123);

result.error!.issues[0].message;
// => Entrada inválida: se esperaba string, recibido número
