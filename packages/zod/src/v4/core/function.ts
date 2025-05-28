import { _tuple } from "./api.js";

import { parse, parseAsync } from "./parse.js";
import * as schemas from "./schemas.js";
import { $ZodTuple } from "./schemas.js";
import type * as util from "./util.js";

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////     $ZodFunction     //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface $ZodFunctionDef<
  In extends $ZodFunctionIn = $ZodFunctionIn,
  Out extends $ZodFunctionOut = $ZodFunctionOut,
> {
  type: "function";
  input: In;
  output: Out;
}

export type $ZodFunctionArgs = schemas.$ZodType<unknown[], unknown[]>;
export type $ZodFunctionIn = $ZodFunctionArgs | null;
export type $ZodFunctionOut = schemas.$ZodType | null;

export type $InferInnerFunctionType<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (
  ...args: null extends Args ? never[] : NonNullable<Args>["_zod"]["output"]
) => null extends Returns ? unknown : NonNullable<Returns>["_zod"]["input"];

export type $InferInnerFunctionTypeAsync<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (
  ...args: null extends Args ? never[] : NonNullable<Args>["_zod"]["output"]
) => null extends Returns ? unknown : util.MaybeAsync<NonNullable<Returns>["_zod"]["input"]>;

export type $InferOuterFunctionType<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (
  ...args: null extends Args ? never[] : NonNullable<Args>["_zod"]["input"]
) => null extends Returns ? unknown : NonNullable<Returns>["_zod"]["output"];

export type $InferOuterFunctionTypeAsync<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (
  ...args: null extends Args ? never[] : NonNullable<Args>["_zod"]["input"]
) => null extends Returns ? unknown : util.MaybeAsync<NonNullable<Returns>["_zod"]["output"]>;

export class $ZodFunction<
  Args extends $ZodFunctionIn = $ZodFunctionIn,
  Returns extends $ZodFunctionOut = $ZodFunctionOut,
> {
  // _zod!: {
  //   def: $ZodFunctionDef<Args, Returns>;
  //   input: $InferInnerFunctionType<Args, Returns>;
  //   output: $InferOuterFunctionType<Args, Returns>;
  // };

  def: $ZodFunctionDef<Args, Returns>;

  /** @deprecated */
  _def!: $ZodFunctionDef<Args, Returns>;
  _input!: $InferInnerFunctionType<Args, Returns>;
  _output!: $InferOuterFunctionType<Args, Returns>;

  constructor(def: $ZodFunctionDef<Args, Returns>) {
    this._def = def;
    this.def = def;
  }

  implement<F extends $InferInnerFunctionType<Args, Returns>>(
    func: F
  ): F extends this["_output"] ? F : this["_output"] {
    if (typeof func !== "function") {
      throw new Error("implement() must be called with a function");
    }
    const impl = ((...args: any[]) => {
      const parsedArgs = this._def.input ? parse(this._def.input, args, undefined, { callee: impl }) : args;
      if (!Array.isArray(parsedArgs)) {
        throw new Error("Invalid arguments schema: not an array or tuple schema.");
      }
      const output = func(...(parsedArgs as any));
      return this._def.output ? parse(this._def.output, output, undefined, { callee: impl }) : output;
    }) as any;
    return impl;
  }

  implementAsync<F extends $InferInnerFunctionTypeAsync<Args, Returns>>(
    func: F
  ): F extends $InferOuterFunctionTypeAsync<Args, Returns> ? F : $InferOuterFunctionTypeAsync<Args, Returns> {
    if (typeof func !== "function") {
      throw new Error("implement() must be called with a function");
    }

    const impl = (async (...args: any[]) => {
      const parsedArgs = this._def.input ? await parseAsync(this._def.input, args, undefined, { callee: impl }) : args;
      if (!Array.isArray(parsedArgs)) {
        throw new Error("Invalid arguments schema: not an array or tuple schema.");
      }
      const output = await func(...(parsedArgs as any));
      return this._def.output ? parseAsync(this._def.output, output, undefined, { callee: impl }) : output;
    }) as any;
    return impl;
  }

  input<const Items extends util.TupleItems, const Rest extends $ZodFunctionOut = null>(
    args: Items,
    rest?: Rest
  ): $ZodFunction<schemas.$ZodTuple<Items, Rest>, Returns>;
  input<NewArgs extends $ZodFunctionIn>(args: NewArgs): $ZodFunction<NewArgs, Returns>;
  input(...args: any[]): $ZodFunction<any, Returns> {
    if (Array.isArray(args[0])) {
      return new $ZodFunction({
        type: "function",
        input: new $ZodTuple({
          type: "tuple",
          items: args[0],
          rest: args[1],
        }),
        output: this._def.output,
      });
    }
    return new $ZodFunction({
      type: "function",
      input: args[0],
      output: this._def.output,
    });
  }

  output<NewReturns extends schemas.$ZodType>(output: NewReturns): $ZodFunction<Args, NewReturns> {
    return new $ZodFunction({
      type: "function",
      input: this._def.input,
      output,
    });
  }
}

export interface $ZodFunctionParams<I extends $ZodFunctionIn, O extends schemas.$ZodType> {
  input?: I;
  output?: O;
}

function _function(): $ZodFunction;
function _function<const In extends Array<schemas.$ZodType> = Array<schemas.$ZodType>>(params: {
  input: In;
}): $ZodFunction<$ZodTuple<In, null>, null>;
function _function<const In extends $ZodFunctionIn = $ZodFunctionIn>(params: {
  input: In;
}): $ZodFunction<In, null>;
function _function<const Out extends $ZodFunctionOut = $ZodFunctionOut>(params: {
  output: Out;
}): $ZodFunction<null, Out>;
function _function<
  In extends $ZodFunctionIn = $ZodFunctionIn,
  Out extends schemas.$ZodType = schemas.$ZodType,
>(params?: {
  input: In;
  output: Out;
}): $ZodFunction<In, Out>;
function _function(params?: {
  output?: schemas.$ZodType;
  input?: $ZodFunctionArgs | Array<schemas.$ZodType>;
}): any {
  return new $ZodFunction({
    type: "function",
    input: Array.isArray(params?.input) ? _tuple(schemas.$ZodTuple, params?.input as any) : (params?.input ?? null),
    output: params?.output ?? null,
  });
}

export { _function as function };
