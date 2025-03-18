import { parse, parseAsync } from "./parse.js";
import type * as schemas from "./schemas.js";
import { $ZodTuple } from "./schemas.js";
import type * as util from "./util.js";

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////     $ZodFunction     //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface $ZodFunctionDef /* extends schemas.$ZodTypeDef */ {
  type: "function";
  input: $ZodFunctionArgs | null;
  output: schemas.$ZodType | null;
}

export type $ZodFunctionArgs = schemas.$ZodType<unknown[], unknown[]>;

export type $InferInnerFunctionType<Args extends $ZodFunctionArgs, Returns extends schemas.$ZodType> = (
  ...args: Args["_zod"]["output"]
) => Returns["_zod"]["input"];

export type $InferInnerFunctionTypeAsync<Args extends $ZodFunctionArgs, Returns extends schemas.$ZodType> = (
  ...args: Args["_zod"]["output"]
) => util.MaybeAsync<Returns["_zod"]["input"]>;

export type $InferOuterFunctionType<Args extends $ZodFunctionArgs, Returns extends schemas.$ZodType> = (
  ...args: Args["_zod"]["input"]
) => Returns["_zod"]["output"];

export type $InferOuterFunctionTypeAsync<Args extends $ZodFunctionArgs, Returns extends schemas.$ZodType> = (
  ...args: Args["_zod"]["input"]
) => util.MaybeAsync<Returns["_zod"]["output"]>;

// export interface $ZodFunction<
//   Args extends $ZodFunctionArgs = $ZodFunctionArgs,
//   Returns extends schemas.$ZodType = schemas.$ZodType,
// > /* extends schemas.$ZodType<$InferOuterFunctionTypeAsync<Args, Returns>, $InferInnerFunctionTypeAsync<Args, Returns>> */ {
//   _def: $ZodFunctionDef;
//   _input: $InferInnerFunctionType<Args, Returns>;
//   _output: $InferOuterFunctionType<Args, Returns>;

//   implement<F extends $InferInnerFunctionType<Args, Returns>>(func: F): $InferOuterFunctionType<Args, Returns>;
//   implementAsync<F extends $InferInnerFunctionTypeAsync<Args, Returns>>(
//     func: F
//   ): $InferOuterFunctionTypeAsync<Args, Returns>;

//   // called accepts to differentiate from .args() in Zod 3 which is variadic
//   // "params" is misleading because that's used for configuation objects elsewhere
//   // accepts is non variadic and support rest tuples natively
//   // it also agrees with `returns` grammatically
//   input<const Items extends util.TupleItems, const Rest extends schemas.$ZodType | null = null>(
//     args: Items,
//     rest?: Rest
//   ): $ZodFunction<schemas.$ZodTuple<Items, Rest>, Returns>;
//   input<NewArgs extends $ZodFunctionArgs>(args: NewArgs): $ZodFunction<NewArgs, Returns>;
//   output<NewReturns extends schemas.$ZodType>(returns: NewReturns): $ZodFunction<Args, NewReturns>;
// }

// export const $ZodFunction: $constructor<$ZodFunction, $ZodFunctionDef> = $constructor("$ZodFunction", (inst, def) => {
//   inst.implement = (fn) => {
//     if (typeof fn !== "function") {
//       throw new Error("implement() must be called with a function");
//     }
//     return ((...args: any[]) => {
//       // use parse()
//       const parsedArgs = def.input ? parse(def.input, args) : args;
//       if (!Array.isArray(parsedArgs)) {
//         throw new Error("Invalid arguments schema: not an array or tuple schema.");
//       }
//       const output = fn(...parsedArgs);
//       return def.output ? parse(def.output, output) : output;
//     }) as any;
//   };

//   inst.implementAsync = (fn) => {
//     if (typeof fn !== "function") {
//       throw new Error("implement() must be called with a function");
//     }

//     return (async (...args: any[]) => {
//       const parsedArgs = def.input ? await parseAsync(def.input, args) : args;
//       if (!Array.isArray(parsedArgs)) {
//         throw new Error("Invalid arguments schema: not an array or tuple schema.");
//       }
//       const output = await fn(...parsedArgs);
//       return def.output ? parseAsync(def.output, output) : output;
//     }) as any;
//   };

//   inst.input = (...args: any[]) => {
//     if (Array.isArray(args[0])) {
//       return new $ZodFunction({
//         type: "function",
//         input: new $ZodTuple({
//           type: "tuple",
//           items: args[0],
//           rest: args[1],
//         }), //tuple(args[0] as any, args[1] as any),
//         output: def.output,
//       });
//     }
//     return new $ZodFunction({
//       type: "function",
//       input: args[0],
//       output: def.output,
//     });
//   };

//   inst.output = (output) => {
//     return new $ZodFunction({
//       type: "function",
//       input: def.input,
//       output,
//     });
//   };
// });

export class $ZodFunction<
  Args extends $ZodFunctionArgs = $ZodFunctionArgs,
  Returns extends schemas.$ZodType = schemas.$ZodType,
> {
  _def: $ZodFunctionDef;
  _input!: $InferInnerFunctionType<Args, Returns>;
  _output!: $InferOuterFunctionType<Args, Returns>;

  constructor(def: $ZodFunctionDef) {
    this._def = def;
  }

  implement<F extends $InferInnerFunctionType<Args, Returns>>(func: F): $InferOuterFunctionType<Args, Returns> {
    if (typeof func !== "function") {
      throw new Error("implement() must be called with a function");
    }
    return ((...args: any[]) => {
      const parsedArgs = this._def.input ? parse(this._def.input, args) : args;
      if (!Array.isArray(parsedArgs)) {
        throw new Error("Invalid arguments schema: not an array or tuple schema.");
      }
      const output = func(...parsedArgs);
      return this._def.output ? parse(this._def.output, output) : output;
    }) as any;
  }

  implementAsync<F extends $InferInnerFunctionTypeAsync<Args, Returns>>(
    func: F
  ): $InferOuterFunctionTypeAsync<Args, Returns> {
    if (typeof func !== "function") {
      throw new Error("implement() must be called with a function");
    }

    return (async (...args: any[]) => {
      const parsedArgs = this._def.input ? await parseAsync(this._def.input, args) : args;
      if (!Array.isArray(parsedArgs)) {
        throw new Error("Invalid arguments schema: not an array or tuple schema.");
      }
      const output = await func(...parsedArgs);
      return this._def.output ? parseAsync(this._def.output, output) : output;
    }) as any;
  }

  input<const Items extends util.TupleItems, const Rest extends schemas.$ZodType | null = null>(
    args: Items,
    rest?: Rest
  ): $ZodFunction<schemas.$ZodTuple<Items, Rest>, Returns>;
  input<NewArgs extends $ZodFunctionArgs>(args: NewArgs): $ZodFunction<NewArgs, Returns>;
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

export interface $ZodFunctionParams<I extends $ZodFunctionArgs, O extends schemas.$ZodType> {
  input?: I;
  output?: O;
}
function _function<In extends $ZodFunctionArgs = $ZodFunctionArgs, Out extends schemas.$ZodType = schemas.$ZodType>(
  params?: $ZodFunctionParams<In, Out>
): $ZodFunction<In, Out> {
  return new $ZodFunction({
    type: "function",
    input: params?.input ?? null,
    output: params?.output ?? null,
  });
}

export { _function as function };
