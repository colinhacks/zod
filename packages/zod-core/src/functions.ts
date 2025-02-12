// import * as api from "./api.js";
// import type * as base from "./base.js";
// import type * as schemas from "./schemas.js";
// import type * as util from "./util.js";

// //////////     FUNCTIONS     //////////
// type OuterFunctionType<
//   Args extends base.$ZodType<unknown[], unknown[]>,
//   Returns extends base.$ZodType,
// > = (...args: base.input<Args>) => base.output<Returns>;
// type OuterFunctionTypeAsync<
//   Args extends base.$ZodType<unknown[], unknown[]>,
//   Returns extends base.$ZodType,
// > = (...args: base.input<Args>) => Promise<base.output<Returns>>;
// type InnerFunctionType<
//   Args extends base.$ZodType<unknown[], unknown[]>,
//   Returns extends base.$ZodType,
// > = (...args: base.output<Args>) => base.input<Returns>;
// type InnerFunctionTypeAsync<
//   Args extends base.$ZodType<unknown[], unknown[]>,
//   Returns extends base.$ZodType,
// > = (...args: base.output<Args>) => util.MaybeAsync<base.input<Returns>>;

// interface $ZodFunction<
//   Args extends base.$ZodType<unknown[], unknown[]>,
//   Returns extends base.$ZodType,
// > {
//   "_args": Args;
//   "_returns": Returns;
//   implement<Fn extends InnerFunctionType<Args, Returns>>(
//     fn: Fn
//   ): OuterFunctionType<Args, Returns>;
//   implementAsync<Fn extends InnerFunctionTypeAsync<Args, Returns>>(
//     fn: Fn
//   ): OuterFunctionTypeAsync<Args, Returns>;
//   strictImplement(
//     fn: InnerFunctionType<Args, Returns>
//   ): OuterFunctionType<Args, Returns>;
//   strictImplementAsync(
//     fn: InnerFunctionTypeAsync<Args, Returns>
//   ): OuterFunctionTypeAsync<Args, Returns>;
// }

// interface $ZodFunctionArgs<
//   Args extends base.$ZodType<unknown[], unknown[]>,
//   Returns extends base.$ZodType,
// > {
//   args?: Args;
//   returns?: Returns;
// }

// type AnyFunc = (...args: any[]) => any;

// function typedCall(
//   fn: AnyFunc,
//   args: any[],
//   argSchema: base.$ZodType,
//   returnSchema: base.$ZodType
// ) {
//   const parsedArgs = api.parse(argSchema, args);
//   const result = fn(...(parsedArgs as any));
//   return api.parse(returnSchema, result);
// }

// async function typedCallAsync(
//   fn: AnyFunc,
//   args: any[],
//   argSchema: base.$ZodType,
//   returnSchema: base.$ZodType
// ) {
//   const parsedArgs = await api.parseAsync(argSchema, args);
//   const result = await fn(...(parsedArgs as any));
//   return api.parseAsync(returnSchema, result);
// }

// function _function<
//   Args extends base.$ZodType<unknown[], unknown[]> = schemas.$ZodTuple<[]>,
//   Returns extends base.$ZodType = schemas.$ZodUnknown,
// >(args: $ZodFunctionArgs<Args, Returns>): $ZodFunction<Args, Returns> {
//   return {
//     "_args": args.args ?? (api.tuple([]) as any),
//     "_returns": args.returns ?? (api.unknown() as any),
//     implement(fn) {
//       return (...args) =>
//         typedCall(fn, args, this["_args"], this["_returns"]) as any;
//     },
//     implementAsync(fn) {
//       return async (...args) =>
//         typedCallAsync(fn, args, this["_args"], this["_returns"]) as any;
//     },
//     strictImplement(fn) {
//       return (...args) =>
//         typedCall(fn, args, this["_args"], this["_returns"]) as any;
//     },
//     strictImplementAsync(fn) {
//       return async (...args) =>
//         typedCallAsync(fn, args, this["_args"], this["_returns"]) as any;
//     },
//   };
// }

// export { _function as function };
