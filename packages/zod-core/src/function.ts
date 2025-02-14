import * as base from "./base.js";
import { parse, parseAsync } from "./parse.js";
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
  args: $ZodFunctionArgs;
  returns: base.$ZodType;
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

  implement<F extends $InferInnerFunctionType<Args, Returns>>(func: F): F;
  implementAsync<F extends $InferInnerFunctionTypeAsync<Args, Returns>>(func: F): F;

  accepts<NewArgs extends $ZodFunctionArgs>(args: NewArgs): $ZodFunction<NewArgs, Returns>;
  returns<NewReturns extends base.$ZodType>(returns: NewReturns): $ZodFunction<Args, NewReturns>;
}

export const $ZodFunction: base.$constructor<$ZodFunction> = base.$constructor("$ZodFunction", (inst, def) => {
  // base.$ZodType.init(inst, def);
  // inst._parse = (payload, ctx) => {}
  inst.implement = (fn) => {
    if (typeof fn !== "function") {
      throw new Error("implement() must be called with a function");
    }
    return ((...args: any[]) => {
      // use parse()
      const parsedArgs = parse(def.args, args);
      if (!Array.isArray(parsedArgs)) {
        throw new Error("Invalid arguments schema: not an array or tuple schema.");
      }
      const output = fn(...parsedArgs);
      return parse(def.returns, output);
    }) as any;
  };

  inst.implementAsync = (fn) => {
    if (typeof fn !== "function") {
      throw new Error("implement() must be called with a function");
    }

    return (async (...args: any[]) => {
      const parsedArgs = await parseAsync(def.args, args);
      if (!Array.isArray(parsedArgs)) {
        throw new Error("Invalid arguments schema: not an array or tuple schema.");
      }
      const output = await fn(...parsedArgs);
      return parseAsync(def.returns, output);
    }) as any;
  };

  inst.accepts = (params) => {
    return new $ZodFunction({
      type: "function",
      args: params,
      returns: def.returns,
    });
  };

  inst.returns = (returns) => {
    return new $ZodFunction({
      type: "function",
      args: def.args,
      returns,
    });
  };
});

function _function<Args extends $ZodFunctionArgs = $ZodFunctionArgs, Returns extends base.$ZodType = base.$ZodType>(
  args: Args,
  returns: Returns
): $ZodFunction<Args, Returns> {
  return new $ZodFunction({
    type: "function",
    args,
    returns,
  });
}
export { _function as function };
