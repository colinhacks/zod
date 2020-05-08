import * as z from './base';
import { ZodTuple } from './tuple';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';

export interface ZodFunctionDef<
  Args extends ZodTuple<any> = ZodTuple<any>,
  Returns extends z.ZodTypeAny = z.ZodTypeAny
> extends z.ZodTypeDef {
  t: z.ZodTypes.function;
  args: Args;
  returns: Returns;
}

export type TypeOfFunction<Args extends ZodTuple<any>, Returns extends z.ZodTypeAny> = Args['_type'] extends Array<any>
  ? (...args: Args['_type']) => Returns['_type']
  : never;

export class ZodFunction<Args extends ZodTuple<any>, Returns extends z.ZodTypeAny> extends z.ZodType<
  TypeOfFunction<Args, Returns>,
  ZodFunctionDef
> {
  readonly _def!: ZodFunctionDef<Args, Returns>;
  readonly _type!: TypeOfFunction<Args, Returns>;

  // implement = this.parse;
  implement = (func: TypeOfFunction<Args, Returns>): TypeOfFunction<Args, Returns> => {
    const validatedFunc = (...args: any[]) => {
      try {
        this._def.args.parse(args as any);
        const result = func(...(args as any));
        this._def.returns.parse(result);
        return result;
      } catch (err) {
        throw err;
      }
    };
    return (validatedFunc as any) as TypeOfFunction<Args, Returns>;
  };

  validate = this.implement;

  static create = <T extends ZodTuple<any>, U extends z.ZodTypeAny>(args: T, returns: U): ZodFunction<T, U> => {
    return new ZodFunction({
      t: z.ZodTypes.function,
      args,
      returns,
    });
  };

  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => {
    return {
      t: this._def.t,
      args: this._def.args.toJSON(),
      returns: this._def.returns.toJSON(),
    };
  };
}
