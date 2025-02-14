// import * as core from "../../zod-core/src/index.js";
// import * as util from "../../zod-core/src/util.js";
import * as core from "@zod/core";
import * as api from "./api.js";

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodFunction     //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
export interface ZodFunction<
  Args extends core.$ZodFunctionArgs = core.$ZodFunctionArgs,
  Returns extends core.$ZodType = core.$ZodType,
> extends core.$ZodFunction<Args, Returns> {
  _def: core.$ZodFunctionDef;

  /** @deprecated Use `.params()` instead. */
  args<Items extends core.$ZodType[]>(...items: Items): ZodFunction<core.$ZodTuple<Items, core.$ZodUnknown>, Returns>;
}

export const ZodFunction: core.$constructor<ZodFunction> = /*@__PURE__*/ core.$constructor(
  "ZodFunction",
  (inst, def) => {
    core.$ZodFunction.init(inst, def);

    inst.args = (...items) => {
      return new ZodFunction({
        ...def,
        args: api.tuple(items as any),
      });
    };
  }
);

function _function<
  Args extends core.$ZodFunctionArgs = core.$ZodFunctionArgs,
  Returns extends core.$ZodType = core.$ZodType,
>(args: Args, returns: Returns): ZodFunction<Args, Returns> {
  return new ZodFunction({
    type: "function",
    args,
    returns,
  });
}
export { _function as function };
