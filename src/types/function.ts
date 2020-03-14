import * as z from './base';
import { ZodTuple } from './tuple';

export interface ZodFunctionDef<Args extends ZodTuple<any> = ZodTuple<any>, Returns extends z.ZodAny = z.ZodAny>
  extends z.ZodTypeDef {
  t: z.ZodTypes.function;
  args: Args;
  returns: Returns;
}

export class ZodFunction<Args extends ZodTuple<any>, Returns extends z.ZodAny> {
  readonly _def!: ZodFunctionDef<Args, Returns>;

  constructor(def: ZodFunctionDef<Args, Returns>) {
    this._def = def;
  }

  validate = (func: z.TypeOfFunction<Args, Returns>): z.TypeOfFunction<Args, Returns> => {
    const validatedFunc = (...args: any[]) => {
      try {
        this._def.args.parse(args);
        const result = func(...(args as any));
        this._def.returns.parse(result);
        return result;
      } catch (err) {
        throw err;
      }
    };
    return (validatedFunc as any) as z.TypeOfFunction<Args, Returns>;
  };

  static create = <T extends ZodTuple<any>, U extends z.ZodAny>(args: T, returns: U): ZodFunction<T, U> => {
    return new ZodFunction({
      t: z.ZodTypes.function,
      args,
      returns,
    });
  };
}
