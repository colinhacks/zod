import * as z from './base';
import { ZodTuple } from './tuple';
import { ZodUnknown } from './unknown';

export interface ZodFunctionDef<
  Args extends ZodTuple<any> = ZodTuple<any>,
  Returns extends z.ZodTypeAny = z.ZodTypeAny
> extends z.ZodTypeDef {
  t: z.ZodTypes.function;
  args: Args;
  returns: Returns;
}

export type OuterTypeOfFunction<
  Args extends ZodTuple<any>,
  Returns extends z.ZodTypeAny
> = Args['_input'] extends Array<any>
  ? (...args: Args['_input']) => Returns['_output']
  : never;

export type InnerTypeOfFunction<
  Args extends ZodTuple<any>,
  Returns extends z.ZodTypeAny
> = Args['_output'] extends Array<any>
  ? (...args: Args['_output']) => Returns['_input']
  : never;

export class ZodFunction<
  Args extends ZodTuple<any>,
  Returns extends z.ZodTypeAny
> extends z.ZodType<
  InnerTypeOfFunction<Args, Returns>,
  ZodFunctionDef,
  OuterTypeOfFunction<Args, Returns>
> {
  readonly _def!: ZodFunctionDef<Args, Returns>;
  //  readonly _type!: TypeOfFunction<Args, Returns>;

  args = <Items extends Parameters<typeof ZodTuple['create']>[0]>(
    ...items: Items
  ): ZodFunction<ZodTuple<Items>, Returns> => {
    return new ZodFunction({
      ...this._def,
      args: ZodTuple.create(items),
    });
  };

  returns = <NewReturnType extends z.ZodType<any, any>>(
    returnType: NewReturnType,
  ): ZodFunction<Args, NewReturnType> => {
    return new ZodFunction({
      ...this._def,
      returns: returnType,
    });
  };

  implement = <F extends InnerTypeOfFunction<Args, Returns>>(func: F): F => {
    const validatedFunc = this.parse(func);
    return validatedFunc as any;
  };

  validate = this.implement;

  static create = <
    T extends ZodTuple<any> = ZodTuple<[]>,
    U extends z.ZodTypeAny = ZodUnknown
  >(
    args?: T,
    returns?: U,
  ): ZodFunction<T, U> => {
    return new ZodFunction({
      t: z.ZodTypes.function,
      args: args || ZodTuple.create([]),
      returns: returns || ZodUnknown.create(),
    });
  };

  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => {
    return {
      t: this._def.t,
      args: this._def.args.toJSON(),
      returns: this._def.returns.toJSON(),
    };
  };
}
