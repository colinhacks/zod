import * as core from "./core.js";
import type * as errors from "./errors.js";
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
> extends schemas.$ZodTypeDef {
  type: "function";
  input: In;
  output: Out;
}

export type $ZodFunctionArgs = schemas.$ZodType<unknown[], unknown[]>;
export type $ZodFunctionIn = $ZodFunctionArgs;
export type $ZodFunctionOut = schemas.$ZodType;

export type $InferInnerFunctionType<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (
  ...args: $ZodFunctionIn extends Args ? never[] : core.output<Args>
) => core.input<Returns>;

export type $InferInnerFunctionTypeAsync<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (
  ...args: $ZodFunctionIn extends Args ? never[] : core.output<Args>
) => util.MaybeAsync<core.input<Returns>>;

export type $InferOuterFunctionType<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (
  ...args: $ZodFunctionIn extends Args ? never[] : core.input<Args>
) => core.output<Returns>;

export type $InferOuterFunctionTypeAsync<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (
  ...args: $ZodFunctionIn extends Args ? never[] : core.input<Args>
) => util.MaybeAsync<core.output<Returns>>;

export interface $ZodFunctionInternals<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut>
  extends schemas.$ZodTypeInternals<$InferOuterFunctionType<Args, Returns>, $InferInnerFunctionType<Args, Returns>> {
  def: $ZodFunctionDef<Args, Returns>;
  isst: errors.$ZodIssueInvalidType;
  // _input: $InferInnerFunctionType<Args, Returns>;
  // _output: $InferOuterFunctionType<Args, Returns>;
}

export interface $ZodFunction<
  Args extends $ZodFunctionIn = $ZodFunctionIn,
  Returns extends $ZodFunctionOut = $ZodFunctionOut,
> extends schemas.$ZodType<any, any, $ZodFunctionInternals<Args, Returns>> {
  /** @deprecated */
  _def: $ZodFunctionDef<Args, Returns>;
  _input: $InferInnerFunctionType<Args, Returns>;
  _output: $InferOuterFunctionType<Args, Returns>;

  implement<F extends $InferInnerFunctionType<Args, Returns>>(
    func: F
  ): // allow for return type inference
  (
    ...args: Parameters<this["_output"]>
  ) => ReturnType<F> extends ReturnType<this["_output"]> ? ReturnType<F> : ReturnType<this["_output"]>;

  implementAsync<F extends $InferInnerFunctionTypeAsync<Args, Returns>>(
    func: F
  ): F extends $InferOuterFunctionTypeAsync<Args, Returns> ? F : $InferOuterFunctionTypeAsync<Args, Returns>;

  input<const Items extends util.TupleItems, const Rest extends $ZodFunctionOut = $ZodFunctionOut>(
    args: Items,
    rest?: Rest
  ): $ZodFunction<schemas.$ZodTuple<Items, Rest>, Returns>;
  input<NewArgs extends $ZodFunctionIn>(args: NewArgs): $ZodFunction<NewArgs, Returns>;
  input(...args: any[]): $ZodFunction<any, Returns>;

  output<NewReturns extends schemas.$ZodType>(output: NewReturns): $ZodFunction<Args, NewReturns>;
}

export interface $ZodFunctionParams<I extends $ZodFunctionIn, O extends schemas.$ZodType> {
  input?: I;
  output?: O;
}

export const $ZodFunction: core.$constructor<$ZodFunction> = /*@__PURE__*/ core.$constructor(
  "$ZodFunction",
  (inst, def) => {
    schemas.$ZodType.init(inst, def);
    inst._def = def;
    inst._zod.def = def;

    inst.implement = (func) => {
      if (typeof func !== "function") {
        throw new Error("implement() must be called with a function");
      }
      const impl = ((...args: any[]) => {
        const parsedArgs = inst._def.input ? parse(inst._def.input, args, undefined, { callee: impl }) : args;
        const result = func(...(parsedArgs as never[]));
        if (inst._def.output) {
          return parseAsync(inst._def.output, result, undefined, { callee: impl });
        }
        return result;
      }) as any;
      return impl;
    };

    inst.implementAsync = (func) => {
      if (typeof func !== "function") {
        throw new Error("implementAsync() must be called with a function");
      }
      const impl = (async (...args: any[]) => {
        const parsedArgs = inst._def.input ? parse(inst._def.input, args, undefined, { callee: impl }) : args;
        const result = await func(...(parsedArgs as never[]));
        if (inst._def.output) {
          return parseAsync(inst._def.output, result, undefined, { callee: impl });
        }
        return result;
      }) as any;
      return impl;
    };

    inst.input = (...args: any[]): $ZodFunction<any, any> => {
      const F: any = inst.constructor;
      if (Array.isArray(args[0])) {
        return new F({
          type: "function",
          input: new $ZodTuple({
            type: "tuple",
            items: args[0],
            rest: args[1],
          }),
          output: inst._def.output,
        });
      }

      return new F({
        type: "function",
        input: args[0],
        output: inst._def.output,
      });
    };

    inst.output = (output) => {
      const F: any = inst.constructor;
      return new F({
        type: "function",
        input: inst._def.input,
        output,
      });
    };

    return inst;
  }
);
