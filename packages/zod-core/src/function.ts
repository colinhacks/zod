import { tuple } from "./api.js";
import * as base from "./base.js";
import { parse, parseAsync } from "./parse.js";
import type { $ZodTuple, $ZodTupleItems } from "./schemas.js";
import type * as util from "./util.js";

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////     $ZodFunction     //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface $ZodFunctionDef /* extends base.$ZodTypeDef */ {
  type: "function";
  input: $ZodFunctionArgs | null;
  output: base.$ZodType | null;
}

export type $ZodFunctionArgs = base.$ZodType<unknown[], unknown[]>;

export type $InferInnerFunctionType<Args extends $ZodFunctionArgs, Returns extends base.$ZodType> = (
  ...args: Args["_output"]
) => Returns["_input"];

export type $InferInnerFunctionTypeAsync<Args extends $ZodFunctionArgs, Returns extends base.$ZodType> = (
  ...args: Args["_output"]
) => util.MaybeAsync<Returns["_input"]>;

export type $InferOuterFunctionType<Args extends $ZodFunctionArgs, Returns extends base.$ZodType> = (
  ...args: Args["_input"]
) => Returns["_output"];

export type $InferOuterFunctionTypeAsync<Args extends $ZodFunctionArgs, Returns extends base.$ZodType> = (
  ...args: Args["_input"]
) => util.MaybeAsync<Returns["_output"]>;

export interface $ZodFunction<
  Args extends $ZodFunctionArgs = $ZodFunctionArgs,
  Returns extends base.$ZodType = base.$ZodType,
> /* extends base.$ZodType<$InferOuterFunctionTypeAsync<Args, Returns>, $InferInnerFunctionTypeAsync<Args, Returns>> */ {
  _def: $ZodFunctionDef;
  _input: $InferInnerFunctionType<Args, Returns>;
  _output: $InferOuterFunctionType<Args, Returns>;

  implement<F extends $InferInnerFunctionType<Args, Returns>>(func: F): $InferOuterFunctionType<Args, Returns>;
  implementAsync<F extends $InferInnerFunctionTypeAsync<Args, Returns>>(
    func: F
  ): $InferOuterFunctionTypeAsync<Args, Returns>;

  // called accepts to differentiate from .args() in Zod 3 which is variadic
  // "params" is misleading because that's used for configuation objects elsewhere
  // accepts is non variadic and support rest tuples natively
  // it also agrees with `returns` grammatically
  input<const Items extends $ZodTupleItems, const Rest extends base.$ZodType | null = null>(
    args: Items,
    rest?: Rest
  ): $ZodFunction<$ZodTuple<Items, Rest>, Returns>;
  input<NewArgs extends $ZodFunctionArgs>(args: NewArgs): $ZodFunction<NewArgs, Returns>;
  output<NewReturns extends base.$ZodType>(returns: NewReturns): $ZodFunction<Args, NewReturns>;
}

export const $ZodFunction: base.$constructor<$ZodFunction> = base.$constructor("$ZodFunction", (inst, def) => {
  inst.implement = (fn) => {
    if (typeof fn !== "function") {
      throw new Error("implement() must be called with a function");
    }
    return ((...args: any[]) => {
      // use parse()
      const parsedArgs = def.input ? parse(def.input, args) : args;
      if (!Array.isArray(parsedArgs)) {
        throw new Error("Invalid arguments schema: not an array or tuple schema.");
      }
      const output = fn(...parsedArgs);
      return def.output ? parse(def.output, output) : output;
    }) as any;
  };

  inst.implementAsync = (fn) => {
    if (typeof fn !== "function") {
      throw new Error("implement() must be called with a function");
    }

    return (async (...args: any[]) => {
      const parsedArgs = def.input ? await parseAsync(def.input, args) : args;
      if (!Array.isArray(parsedArgs)) {
        throw new Error("Invalid arguments schema: not an array or tuple schema.");
      }
      const output = await fn(...parsedArgs);
      return def.output ? parseAsync(def.output, output) : output;
    }) as any;
  };

  inst.input = (...args: any[]) => {
    if (Array.isArray(args[0])) {
      return new $ZodFunction({
        type: "function",
        input: tuple(args[0] as any, args[1] as any),
        output: def.output,
      });
    }
    return new $ZodFunction({
      type: "function",
      input: args[0],
      output: def.output,
    });
  };

  inst.output = (output) => {
    return new $ZodFunction({
      type: "function",
      input: def.input,
      output,
    });
  };
});

interface $ZodFunctionParams<I extends $ZodFunctionArgs, O extends base.$ZodType> {
  input?: I;
  output?: O;
}
function _function<In extends $ZodFunctionArgs = $ZodFunctionArgs, Out extends base.$ZodType = base.$ZodType>(
  params?: $ZodFunctionParams<In, Out>
): $ZodFunction<In, Out> {
  return new $ZodFunction({
    type: "function",
    input: params?.input ?? null,
    output: params?.output ?? null,
  });
}

export { _function as function };
