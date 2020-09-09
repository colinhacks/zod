import * as z from '.';

export class MyZodString extends z.ZodString {
  cpf = () => this.refine(arg => validateCPF(arg), { message: 'CPF inválido' });
}
