// import * as core from "@zod/core";
// import * as api from "./api.js";

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      ZodFunction     //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
// export interface ZodFunction<
//   Args extends core.$ZodFunctionArgs = core.$ZodFunctionArgs,
//   Returns extends core.$ZodType = core.$ZodType,
// > extends core.$ZodFunction<Args, Returns> {
//   _def: core.$ZodFunctionDef;

//   accepts(args: core.$ZodTupleItems): ZodFunction<core.$ZodTuple<core.$ZodTupleItems>, Returns>;
//   accepts<NewArgs extends core.$ZodFunctionArgs>(args: NewArgs): ZodFunction<NewArgs, Returns>;

//   /** @deprecated Use `.accepts()` instead. */
//   args<Items extends core.$ZodType[]>(...items: Items): ZodFunction<core.$ZodTuple<Items, core.$ZodUnknown>, Returns>;
// }

// export const ZodFunction: core.$constructor<ZodFunction> = /*@__PURE__*/ core.$constructor(
//   "ZodFunction",
//   (inst, def) => {
//     core.$ZodFunction.init(inst, def);

//     const superAccepts = inst.accepts;
//     inst.accepts = (args: any) => {
//       if (Array.isArray(args)) {
//         return new ZodFunction({
//           type: "function",
//           args: api.tuple(args as any),
//           returns: def.returns,
//         });
//       }

//       return superAccepts(args);
//     };

//     inst.args = (...items) => {
//       return new ZodFunction({
//         ...def,
//         args: api.tuple(items as any),
//       });
//     };
//   }
// );

// function _function<
//   Args extends core.$ZodFunctionArgs = core.$ZodFunctionArgs,
//   Returns extends core.$ZodType = core.$ZodType,
// >(args: Args, returns: Returns): ZodFunction<Args, Returns> {
//   return new ZodFunction({
//     type: "function",
//     args,
//     returns,
//   });
// }
// export { _function as function };

export { function } from "@zod/core";
