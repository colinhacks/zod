import * as z from './base';
import { ZodTuple } from './tuple';

export interface ZodFunctionDef<
  Args extends ZodTuple<any> = ZodTuple<any>,
  Returns extends z.ZodAny = z.ZodAny
> extends z.ZodTypeDef {
  t: z.ZodTypes.function;
  args: Args;
  returns: Returns;
}

export class ZodFunction<
  Args extends ZodTuple<any>,
  Returns extends z.ZodAny
> extends z.ZodType<
  z.TypeOfFunction<Args, Returns>,
  ZodFunctionDef<Args, Returns>
> {
  toJSON = () => ({
    t: this._def.t,
    args: this._def.args.toJSON(),
    returns: this._def.returns.toJSON(),
  });

  static create = <T extends ZodTuple<any>, U extends z.ZodAny>(
    args: T,
    returns: U
  ): ZodFunction<T, U> => {
    return new ZodFunction({
      t: z.ZodTypes.function,
      args,
      returns,
    });
  };
}
