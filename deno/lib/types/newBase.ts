// import { ZodOptional, ZodOptionalType } from "..";
// import { defaultErrorMap } from "../defaultErrorMap";
// import { errorUtil } from "../helpers/errorUtil";
// import { objectUtil } from "../helpers/objectUtil";

// // import { mergeShapes } from "../helpers/objectUtil/merge";
// import { partialUtil } from "../helpers/partialUtil";
// import { Primitive, Scalars } from "../helpers/primitive";
// import { INVALID, util } from "../helpers/util";
// import { isScalar } from "../isScalar";
// import { ParseParams, ZodParser, ZodParserReturnType } from "../parser";

// import {
//   MakeErrorData,
//   StringValidation,
//   ZodCustomIssue,
//   ZodError,
//   ZodIssueCode,
// } from "../ZodError";
// import { ZodTypes } from "../ZodTypes";

// ///////////////////////////////////////
// ///////////////////////////////////////
// //////////                   //////////
// //////////      ZodType      //////////
// //////////                   //////////
// ///////////////////////////////////////
// ///////////////////////////////////////

// type InternalCheck<T> = {
//   type: "check";
//   check: (arg: T, ctx: RefinementCtx) => any;
// };
// type Mod<T> = {
//   type: "mod";
//   mod: (arg: T) => any;
// };
// type Effect<T> = InternalCheck<T> | Mod<T>;
// type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, "code">>;

// export interface ZodTypeDef {
//   t: ZodTypes;
//   effects?: Effect<any>[];
//   accepts?: ZodType<any, any>;
// }

// export abstract class ZodType<
//   Output,
//   Def extends ZodTypeDef = ZodTypeDef,
//   Input = Output
// > {
//   readonly _type!: Output;
//   readonly _output!: Output;
//   readonly _input!: Input;
//   readonly _def!: Def;

//   // _parseInternal

//   // abstract _parse: (
//   //   data: unknown,
//   //   params: ParseParams
//   // ) => PseudoPromise<Output> = (data, params) => {
//   //   const def = this._def;

//   //   let PROMISE: PseudoPromise<any> = PseudoPromise.resolve(INVALID);
//   //   (PROMISE as any)._default = true;

//   //   params.seen = params.seen || [];

//   //   const ERROR = params.error;
//   //   const parsedType = getParsedType(data);
//   //   const promise = this
//   //   return PROMISE;
//   // };

//   // _parseInternal: (
//   //   data: unknown,
//   //   params: ParseParams
//   // ) => ZodParserReturnType<Output> = (data, params) => {
//   //   const def = this._def;

//   //   let PROMISE: PseudoPromise<any> = PseudoPromise.resolve(INVALID);
//   //   (PROMISE as any)._default = true;

//   //   params.seen = params.seen || [];

//   //   const ERROR = params.error;
//   //   const parsedType = getParsedType(data);

//   //   const promise = this._parse(data, params);

//   // };
//   _parseInternal: (
//     data: unknown,
//     params: ParseParams
//   ) => ZodParserReturnType<Output> = (data, params) => {
//     const parser = ZodParser(this);
//     return parser(data, params);
//   };

//   _parseInternalOptionalParams: (
//     data: unknown,
//     params?: Partial<ParseParams>
//   ) => ZodParserReturnType<Output> = (data, params = {}) => {
//     const fullParams: ParseParams = {
//       seen: params.seen || [],
//       path: params.path || [],
//       error: params.error || new ZodError([]),
//       errorMap: params.errorMap || defaultErrorMap,
//       async: params.async ?? false,
//       runAsyncValidationsInSeries: params.runAsyncValidationsInSeries ?? false,
//     };

//     return this._parseInternal(data, fullParams);
//   };

//   parse: (data: unknown, params?: Partial<ParseParams>) => Output = (
//     data,
//     params
//   ) => {
//     const result = this._parseInternalOptionalParams(data, params);
//     if (result instanceof Promise)
//       throw new Error(
//         "You can't use .parse() on a schema containing async elements. Use .parseAsync instead."
//       );
//     if (result.success) return result.data;
//     throw result.error;
//   };

//   safeParse: (
//     data: unknown,
//     params?: Partial<ParseParams>
//   ) => { success: true; data: Output } | { success: false; error: ZodError } = (
//     data,
//     params
//   ) => {
//     const result = this._parseInternalOptionalParams(data, params);
//     if (result instanceof Promise)
//       throw new Error(
//         "You can't use .safeParse() on a schema containing async elements. Use .parseAsync instead."
//       );
//     return result;
//     // try {
//     //   return this._parseInternalOptionalParams(data, params);
//     //   if(result instanceof Promise) return result;
//     //   return { success: true, data:  };
//     // } catch (err) {
//     //   if (err instanceof ZodError) {
//     //     return { success: false, error: err };
//     //   }
//     //   throw err;
//     // }
//   };

//   parseAsync: (
//     x: unknown,
//     params?: Partial<ParseParams>
//   ) => Promise<Output> = async (data, params) => {
//     const result = await this._parseInternalOptionalParams(data, {
//       ...params,
//       async: true,
//     });
//     if (result.success) return result.data;
//     throw result.error;
//   };

//   safeParseAsync: (
//     x: unknown,
//     params?: Partial<ParseParams>
//   ) => Promise<
//     { success: true; data: Output } | { success: false; error: ZodError }
//   > = async (data, params) => {
//     return await this._parseInternalOptionalParams(data, {
//       ...params,
//       async: true,
//     });
//     // try {
//     //   return await this.parseAsync(data, params);
//     //   return { success: true, data: parsed };
//     // } catch (err) {
//     //   if (err instanceof ZodError) {
//     //     return { success: false, error: err };
//     //   }
//     //   throw err;
//     // }
//   };

//   spa = this.safeParseAsync;

//   _parseWithInvalidFallback: (x: unknown, params: ParseParams) => Output = (
//     x,
//     params
//   ) => {
//     const parser = ZodParser(this);
//     const result = parser(x, params);
//     if (result instanceof Promise) {
//       return result.then((result) => {
//         if (result.success) return result.data;
//         return INVALID;
//       });
//     }
//     if (result.success) return result.data;
//     return INVALID;
//   };

//   /** The .is method has been removed in Zod 3. For details see https://github.com/colinhacks/zod/tree/v3. */
//   is: never;

//   /** The .check method has been removed in Zod 3. For details see https://github.com/colinhacks/zod/tree/v3. */
//   check: never;

//   refine = <Func extends (arg: Output) => any>(
//     check: Func,
//     message:
//       | string
//       | CustomErrorParams
//       | ((arg: Output) => CustomErrorParams) = "Invalid value."
//   ) => {
//     if (typeof message === "string") {
//       return this._refinement((val, ctx) => {
//         const result = check(val);
//         const setError = () =>
//           ctx.addIssue({
//             code: ZodIssueCode.custom,
//             message,
//           });
//         if (result instanceof Promise) {
//           return result.then((data) => {
//             if (!data) setError();
//           });
//         }
//         if (!result) {
//           setError();
//           return result;
//         }
//       });
//     }
//     if (typeof message === "function") {
//       return this._refinement((val, ctx) => {
//         const result = check(val);
//         const setError = () =>
//           ctx.addIssue({
//             code: ZodIssueCode.custom,
//             ...message(val),
//           });
//         if (result instanceof Promise) {
//           return result.then((data) => {
//             if (!data) setError();
//           });
//         }
//         if (!result) {
//           setError();
//           return result;
//         }
//       });
//     }
//     return this._refinement((val, ctx) => {
//       const result = check(val);
//       const setError = () =>
//         ctx.addIssue({
//           code: ZodIssueCode.custom,
//           ...message,
//         });
//       if (result instanceof Promise) {
//         return result.then((data) => {
//           if (!data) setError();
//         });
//       }

//       if (!result) {
//         setError();
//         return result;
//       }
//     });
//   };

//   refinement = (
//     check: (arg: Output) => any,
//     refinementData:
//       | MakeErrorData
//       | ((arg: Output, ctx: RefinementCtx) => MakeErrorData)
//   ) => {
//     return this._refinement((val, ctx) => {
//       if (!check(val)) {
//         ctx.addIssue(
//           typeof refinementData === "function"
//             ? refinementData(val, ctx)
//             : refinementData
//         );
//       }
//     });
//   };

//   _refinement: (refinement: InternalCheck<Output>["check"]) => this = (
//     refinement
//   ) => {
//     return new (this as any).constructor({
//       ...this._def,
//       effects: [
//         ...(this._def.effects || []),
//         { type: "check", check: refinement },
//       ],
//     }) as this;
//   };

//   constructor(def: Def) {
//     this._def = def;
//     // this.is = this.is.bind(this);
//     // this.check = this.check.bind(this);
//     this.transform = this.transform.bind(this);
//     this.default = this.default.bind(this);
//   }

//   abstract toJSON: () => object;

//   optional: () => ZodOptionalType<this> = () => ZodOptional.create(this);
//   nullable: () => ZodNullableType<this> = () => {
//     return ZodNullable.create(this) as any;
//   };
//   array: () => ZodArray<this> = () => ZodArray.create(this);
//   transform: <Out, This extends this>(
//     transformer: (arg: Output) => Out | Promise<Out>
//   ) => This extends ZodTransformer<infer T, any>
//     ? ZodTransformer<T, Out>
//     : ZodTransformer<This, Out> = (mod) => {
//     let returnType;
//     if (this instanceof ZodTransformer) {
//       returnType = new (this as any).constructor({
//         ...this._def,
//         effects: [...(this._def.effects || []), { type: "mod", mod }],
//       }) as any;
//     } else {
//       returnType = new ZodTransformer({
//         // ...this._def,
//         t: ZodTypes.transformer,
//         schema: this,
//         effects: [{ type: "mod", mod }],
//       }) as any;
//     }
//     return returnType;
//   };

//   prependMod = <Out>(
//     mod: (arg: Output) => Out | Promise<Out>
//   ): ZodType<Out, Def, Input> => {
//     return new (this as any).constructor({
//       ...this._def,
//       effects: [{ type: "mod", mod }, ...(this._def.effects || [])],
//     }) as any;
//   };

//   clearEffects = <Out>(): ZodType<Out, Def, Input> => {
//     return new (this as any).constructor({
//       ...this._def,
//       effects: [],
//     }) as any;
//   };

//   setEffects = <Out>(effects: Effect<any>[]): ZodType<Out, Def, Input> => {
//     return new (this as any).constructor({
//       ...this._def,
//       effects,
//     }) as any;
//   };

//   default<T extends Input, This extends this = this>(
//     def: T
//   ): ZodTransformer<ZodOptional<This>, Input>;
//   default<T extends (arg: this) => Input, This extends this = this>(
//     def: T
//   ): ZodTransformer<ZodOptional<This>, Input>;
//   default(def: any) {
//     return this.optional().transform((val: any) => {
//       const defaultVal = typeof def === "function" ? def(this) : def;
//       return typeof val !== "undefined" ? val : defaultVal;
//     }) as any;
//   }

//   isOptional: () => boolean = () => this.safeParse(undefined).success;
//   isNullable: () => boolean = () => this.safeParse(null).success;
// }

// export type RefinementCtx = {
//   addIssue: (arg: MakeErrorData) => void;
//   path: (string | number)[];
// };

// export type ZodRawShape = { [k: string]: ZodTypeAny };

// export type TypeOf<T extends ZodType<any>> = T["_output"];
// export type input<T extends ZodType<any>> = T["_input"];
// export type output<T extends ZodType<any>> = T["_output"];
// export type infer<T extends ZodType<any>> = T["_output"];

// export type ZodTypeAny = ZodType<any, any, any>;

// /////////////////////////////////////////
// /////////////////////////////////////////
// //////////                     //////////
// //////////      ZodString      //////////
// //////////                     //////////
// /////////////////////////////////////////
// /////////////////////////////////////////

// export interface ZodStringDef extends ZodTypeDef {
//   t: ZodTypes.string;
//   validation: {
//     uuid?: true;
//     custom?: ((val: any) => boolean)[];
//   };
// }

// // eslint-disable-next-line
// const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
// const uuidRegex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/i;

// export class ZodString extends ZodType<string, ZodStringDef> {
//   inputSchema = this;
//   outputSchema = this;

//   toJSON = () => this._def;
//   min = (minLength: number, message?: errorUtil.ErrMessage) =>
//     this.refinement((data) => data.length >= minLength, {
//       code: ZodIssueCode.too_small,
//       minimum: minLength,
//       type: "string",
//       inclusive: true,
//       ...errorUtil.errToObj(message),
//     });

//   max = (maxLength: number, message?: errorUtil.ErrMessage) =>
//     this.refinement((data) => data.length <= maxLength, {
//       code: ZodIssueCode.too_big,
//       maximum: maxLength,
//       type: "string",
//       inclusive: true,
//       ...errorUtil.errToObj(message),
//     });

//   length(len: number, message?: errorUtil.ErrMessage) {
//     return this.min(len, message).max(len, message);
//   }

//   protected _regex = (
//     regex: RegExp,
//     validation: StringValidation,
//     message?: errorUtil.ErrMessage
//   ) =>
//     this.refinement((data) => regex.test(data), {
//       validation,
//       code: ZodIssueCode.invalid_string,

//       ...errorUtil.errToObj(message),
//     });

//   email = (message?: errorUtil.ErrMessage) =>
//     this._regex(emailRegex, "email", message);

//   url = (message?: errorUtil.ErrMessage) =>
//     this.refinement(
//       (data) => {
//         try {
//           new URL(data);
//           return true;
//         } catch {
//           return false;
//         }
//       },
//       {
//         code: ZodIssueCode.invalid_string,
//         validation: "url",
//         ...errorUtil.errToObj(message),
//       }
//     );

//   // url = (message?: errorUtil.ErrMessage) => this._regex(urlRegex, 'url', message);

//   uuid = (message?: errorUtil.ErrMessage) =>
//     this._regex(uuidRegex, "uuid", message);

//   regex = (regexp: RegExp, message?: errorUtil.ErrMessage) =>
//     this._regex(regexp, "regex", message);

//   nonempty = (message?: errorUtil.ErrMessage) =>
//     this.min(1, errorUtil.errToObj(message));

//   static create = (): ZodString => {
//     return new ZodString({
//       t: ZodTypes.string,
//       validation: {},
//     });
//   };
// }

// /////////////////////////////////////////
// /////////////////////////////////////////
// //////////                     //////////
// //////////      ZodNumber      //////////
// //////////                     //////////
// /////////////////////////////////////////
// /////////////////////////////////////////

// export interface ZodNumberDef extends ZodTypeDef {
//   t: ZodTypes.number;
// }

// export class ZodNumber extends ZodType<number, ZodNumberDef> {
//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   toJSON = () => this._def;
//   static create = (): ZodNumber => {
//     return new ZodNumber({
//       t: ZodTypes.number,
//     });
//   };

//   min = (minimum: number, message?: errorUtil.ErrMessage) =>
//     this.refinement((data) => data >= minimum, {
//       code: ZodIssueCode.too_small,
//       minimum,
//       type: "number",
//       inclusive: true,
//       ...errorUtil.errToObj(message),
//     });

//   max = (maximum: number, message?: errorUtil.ErrMessage) =>
//     this.refinement((data) => data <= maximum, {
//       code: ZodIssueCode.too_big,
//       maximum,
//       type: "number",
//       inclusive: true,
//       ...errorUtil.errToObj(message),
//     });

//   int = (message?: errorUtil.ErrMessage) =>
//     this.refinement((data) => Number.isInteger(data), {
//       code: ZodIssueCode.invalid_type,
//       expected: "integer",
//       received: "number",
//       ...errorUtil.errToObj(message),
//     });

//   positive = (message?: errorUtil.ErrMessage) =>
//     this.refinement((data) => data > 0, {
//       code: ZodIssueCode.too_small,
//       minimum: 0,
//       type: "number",
//       inclusive: false,
//       ...errorUtil.errToObj(message),
//     });

//   negative = (message?: errorUtil.ErrMessage) =>
//     this.refinement((data) => data < 0, {
//       code: ZodIssueCode.too_big,
//       maximum: 0,
//       type: "number",
//       inclusive: false,
//       ...errorUtil.errToObj(message),
//     });

//   nonpositive = (message?: errorUtil.ErrMessage) =>
//     this.refinement((data) => data <= 0, {
//       code: ZodIssueCode.too_big,
//       maximum: 0,
//       type: "number",
//       inclusive: true,
//       ...errorUtil.errToObj(message),
//     });

//   nonnegative = (message?: errorUtil.ErrMessage) =>
//     this.refinement((data) => data >= 0, {
//       code: ZodIssueCode.too_small,
//       minimum: 0,
//       type: "number",
//       inclusive: true,
//       ...errorUtil.errToObj(message),
//     });
// }

// /////////////////////////////////////////
// /////////////////////////////////////////
// //////////                     //////////
// //////////      ZodBigInt      //////////
// //////////                     //////////
// /////////////////////////////////////////
// /////////////////////////////////////////

// export interface ZodBigIntDef extends ZodTypeDef {
//   t: ZodTypes.bigint;
// }

// export class ZodBigInt extends ZodType<bigint, ZodBigIntDef> {
//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   toJSON = () => this._def;

//   static create = (): ZodBigInt => {
//     return new ZodBigInt({
//       t: ZodTypes.bigint,
//     });
//   };
// }

// //////////////////////////////////////////
// //////////////////////////////////////////
// //////////                     ///////////
// //////////      ZodBoolean      //////////
// //////////                     ///////////
// //////////////////////////////////////////
// //////////////////////////////////////////
// export interface ZodBooleanDef extends ZodTypeDef {
//   t: ZodTypes.boolean;
// }

// export class ZodBoolean extends ZodType<boolean, ZodBooleanDef> {
//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   toJSON = () => this._def;
//   static create = (): ZodBoolean => {
//     return new ZodBoolean({
//       t: ZodTypes.boolean,
//     });
//   };
// }

// ///////////////////////////////////////
// ///////////////////////////////////////
// //////////                     ////////
// //////////      ZodDate        ////////
// //////////                     ////////
// ///////////////////////////////////////
// ///////////////////////////////////////
// export interface ZodDateDef extends ZodTypeDef {
//   t: ZodTypes.date;
// }

// export class ZodDate extends ZodType<Date, ZodDateDef> {
//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   toJSON = () => this._def;
//   static create = (): ZodDate => {
//     return new ZodDate({
//       t: ZodTypes.date,
//     });
//   };
// }

// ////////////////////////////////////////////
// ////////////////////////////////////////////
// //////////                        //////////
// //////////      ZodUndefined      //////////
// //////////                        //////////
// ////////////////////////////////////////////
// ////////////////////////////////////////////
// export interface ZodUndefinedDef extends ZodTypeDef {
//   t: ZodTypes.undefined;
// }

// export class ZodUndefined extends ZodType<undefined> {
//   toJSON = () => this._def;

//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   static create = (): ZodUndefined => {
//     return new ZodUndefined({
//       t: ZodTypes.undefined,
//     });
//   };
// }

// ///////////////////////////////////////
// ///////////////////////////////////////
// //////////                   //////////
// //////////      ZodNull      //////////
// //////////                   //////////
// ///////////////////////////////////////
// ///////////////////////////////////////
// export interface ZodNullDef extends ZodTypeDef {
//   t: ZodTypes.null;
// }

// export class ZodNull extends ZodType<null, ZodNullDef> {
//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   toJSON = () => this._def;
//   static create = (): ZodNull => {
//     return new ZodNull({
//       t: ZodTypes.null,
//     });
//   };
// }

// //////////////////////////////////////
// //////////////////////////////////////
// //////////                  //////////
// //////////      ZodAny      //////////
// //////////                  //////////
// //////////////////////////////////////
// //////////////////////////////////////
// export interface ZodAnyDef extends ZodTypeDef {
//   t: ZodTypes.any;
// }

// export class ZodAny extends ZodType<any, ZodAnyDef> {
//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
//   toJSON = () => this._def;

//   static create = (): ZodAny => {
//     return new ZodAny({
//       t: ZodTypes.any,
//     });
//   };
// }

// //////////////////////////////////////////
// //////////////////////////////////////////
// //////////                      //////////
// //////////      ZodUnknown      //////////
// //////////                      //////////
// //////////////////////////////////////////
// //////////////////////////////////////////
// export interface ZodUnknownDef extends ZodTypeDef {
//   t: ZodTypes.unknown;
// }

// export class ZodUnknown extends ZodType<unknown, ZodUnknownDef> {
//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
//   toJSON = () => this._def;

//   static create = (): ZodUnknown => {
//     return new ZodUnknown({
//       t: ZodTypes.unknown,
//     });
//   };
// }

// ////////////////////////////////////////
// ////////////////////////////////////////
// //////////                    //////////
// //////////      ZodNever      //////////
// //////////                    //////////
// ////////////////////////////////////////
// ////////////////////////////////////////
// export interface ZodNeverDef extends ZodTypeDef {
//   t: ZodTypes.never;
// }

// export class ZodNever extends ZodType<never, ZodNeverDef> {
//   __class = "ZodNever";
//   toJSON = () => this._def;

//   static create = (): ZodNever => {
//     return new ZodNever({
//       t: ZodTypes.never,
//     });
//   };
// }

// ///////////////////////////////////////
// ///////////////////////////////////////
// //////////                   //////////
// //////////      ZodVoid      //////////
// //////////                   //////////
// ///////////////////////////////////////
// ///////////////////////////////////////
// export interface ZodVoidDef extends ZodTypeDef {
//   t: ZodTypes.void;
// }

// export class ZodVoid extends ZodType<void, ZodVoidDef> {
//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
//   toJSON = () => this._def;

//   static create = (): ZodVoid => {
//     return new ZodVoid({
//       t: ZodTypes.void,
//     });
//   };
// }

// ////////////////////////////////////////
// ////////////////////////////////////////
// //////////                    //////////
// //////////      ZodArray      //////////
// //////////                    //////////
// ////////////////////////////////////////
// ////////////////////////////////////////
// export interface ZodArrayDef<T extends ZodTypeAny = ZodTypeAny>
//   extends ZodTypeDef {
//   t: ZodTypes.array;
//   type: T;
//   nonempty: boolean;
// }

// export class ZodArray<T extends ZodTypeAny> extends ZodType<
//   T["_output"][],
//   ZodArrayDef<T>,
//   T["_input"][]
// > {
//   toJSON = () => {
//     return {
//       t: this._def.t,
//       nonempty: this._def.nonempty,
//       type: this._def.type.toJSON(),
//     };
//   };

//   get element() {
//     return this._def.type;
//   }

//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   min = (minLength: number, message?: string | { message?: string }) =>
//     this.refinement((data) => data.length >= minLength, {
//       code: ZodIssueCode.too_small,
//       type: "array",
//       inclusive: true,
//       minimum: minLength,
//       ...(typeof message === "string" ? { message } : message),
//     });

//   max = (maxLength: number, message?: string | { message?: string }) =>
//     this.refinement((data) => data.length <= maxLength, {
//       // check: data => data.length <= maxLength,
//       code: ZodIssueCode.too_big,
//       type: "array",
//       inclusive: true,
//       maximum: maxLength,
//       ...(typeof message === "string" ? { message } : message),
//     });

//   length = (len: number, message?: string) =>
//     this.min(len, { message }).max(len, { message });

//   nonempty: () => ZodNonEmptyArray<T> = () => {
//     return new ZodNonEmptyArray({ ...this._def, nonempty: true });
//   };

//   static create = <T extends ZodTypeAny>(schema: T): ZodArray<T> => {
//     return new ZodArray({
//       t: ZodTypes.array,
//       type: schema,
//       nonempty: false,
//     });
//   };
// }

// ////////////////////////////////////////////////
// ////////////////////////////////////////////////
// //////////                            //////////
// //////////      ZodNonEmptyArray      //////////
// //////////                            //////////
// ////////////////////////////////////////////////
// ////////////////////////////////////////////////
// export class ZodNonEmptyArray<T extends ZodTypeAny> extends ZodType<
//   [T["_output"], ...T["_output"][]],
//   ZodArrayDef<T>,
//   [T["_input"], ...T["_input"][]]
// > {
//   toJSON = () => {
//     return {
//       t: this._def.t,
//       type: this._def.type.toJSON(),
//     };
//   };

//   min = (minLength: number, message?: string | { message?: string }) =>
//     this.refinement((data) => data.length >= minLength, {
//       code: ZodIssueCode.too_small,
//       minimum: minLength,
//       type: "array",
//       inclusive: true,
//       ...(typeof message === "string" ? { message } : message),
//     });

//   max = (maxLength: number, message?: string | { message?: string }) =>
//     this.refinement((data) => data.length <= maxLength, {
//       // check:
//       code: ZodIssueCode.too_big,
//       maximum: maxLength,
//       type: "array",
//       inclusive: true,
//       ...(typeof message === "string" ? { message } : message),
//     });

//   length = (len: number, message?: string) =>
//     this.min(len, { message }).max(len, { message });
// }

// /////////////////////////////////////////
// /////////////////////////////////////////
// //////////                     //////////
// //////////      ZodObject      //////////
// //////////                     //////////
// /////////////////////////////////////////
// /////////////////////////////////////////
// export const mergeObjects = <First extends AnyZodObject>(first: First) => <
//   Second extends AnyZodObject
// >(
//   second: Second
// ): ZodObject<
//   First["_shape"] & Second["_shape"],
//   First["_unknownKeys"],
//   First["_catchall"]
//   // MergeObjectParams<First['_params'], Second['_params']>,
//   // First['_input'] & Second['_input'],
//   // First['_output'] & Second['_output']
// > => {
//   const mergedShape = objectUtil.mergeShapes(
//     first._def.shape(),
//     second._def.shape()
//   );
//   const merged: any = new ZodObject({
//     t: ZodTypes.object,
//     effects: [...(first._def.effects || []), ...(second._def.effects || [])],
//     unknownKeys: first._def.unknownKeys,
//     catchall: first._def.catchall,
//     // params: {
//     //   strict: first.params.strict && second.params.strict,
//     // },
//     shape: () => mergedShape,
//   }) as any;
//   return merged;
// };

// const AugmentFactory = <Def extends ZodObjectDef>(def: Def) => <
//   Augmentation extends ZodRawShape
// >(
//   augmentation: Augmentation
// ): ZodObject<
//   {
//     [k in Exclude<
//       keyof ReturnType<Def["shape"]>,
//       keyof Augmentation
//     >]: ReturnType<Def["shape"]>[k];
//   } &
//     { [k in keyof Augmentation]: Augmentation[k] },
//   Def["unknownKeys"],
//   Def["catchall"]
// > => {
//   return new ZodObject({
//     ...def,
//     shape: () => ({
//       ...def.shape(),
//       ...augmentation,
//     }),
//   }) as any;
// };

// type UnknownKeysParam = "passthrough" | "strict" | "strip";

// export interface ZodObjectDef<
//   T extends ZodRawShape = ZodRawShape,
//   UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
//   Catchall extends ZodTypeAny = ZodTypeAny
//   // Params extends ZodObjectParams = ZodObjectParams
// > extends ZodTypeDef {
//   t: ZodTypes.object;
//   shape: () => T;
//   catchall: Catchall;
//   unknownKeys: UnknownKeys;
//   // params: Params;
// }

// export type baseObjectOutputType<
//   Shape extends ZodRawShape
//   // Catchall extends ZodTypeAny
// > = objectUtil.flatten<
//   objectUtil.addQuestionMarks<
//     {
//       [k in keyof Shape]: Shape[k]["_output"];
//     }
//   > //{ [k: string]: Catchall['_output'] }
// >;

// export type objectOutputType<
//   Shape extends ZodRawShape,
//   Catchall extends ZodTypeAny
// > = ZodTypeAny extends Catchall
//   ? baseObjectOutputType<Shape>
//   : objectUtil.flatten<
//       baseObjectOutputType<Shape> & { [k: string]: Catchall["_output"] }
//     >;

// export type baseObjectInputType<Shape extends ZodRawShape> = objectUtil.flatten<
//   objectUtil.addQuestionMarks<
//     {
//       [k in keyof Shape]: Shape[k]["_input"];
//     }
//   >
// >;

// export type objectInputType<
//   Shape extends ZodRawShape,
//   Catchall extends ZodTypeAny
// > = ZodTypeAny extends Catchall
//   ? baseObjectInputType<Shape>
//   : objectUtil.flatten<
//       baseObjectInputType<Shape> & { [k: string]: Catchall["_input"] }
//     >;

// const objectDefToJson = (def: ZodObjectDef<any, any>) => ({
//   t: def.t,
//   shape: Object.assign(
//     {},
//     ...Object.keys(def.shape()).map((k) => ({
//       [k]: def.shape()[k].toJSON(),
//     }))
//   ),
// });

// export class ZodObject<
//   T extends ZodRawShape,
//   UnknownKeys extends UnknownKeysParam = "strip",
//   Catchall extends ZodTypeAny = ZodTypeAny,
//   // Params extends ZodObjectParams = { strict: true },
//   // Type extends ZodObjectType<T, Params> = ZodObjectType<T, Params>
//   Output = objectOutputType<T, Catchall>,
//   Input = objectInputType<T, Catchall>
// > extends ZodType<
//   //  objectUtil.objectOutputType<T, UnknownKeys, Catchall>,
//   Output,
//   ZodObjectDef<T, UnknownKeys, Catchall>,
//   Input
// > {
//   readonly _shape!: T;
//   readonly _unknownKeys!: UnknownKeys;
//   readonly _catchall!: Catchall;

//   get shape() {
//     return this._def.shape();
//   }

//   // get params() {
//   //   return this._def.params;
//   // }

//   //  get t() {
//   //    return this;
//   //  }

//   toJSON = () => objectDefToJson(this._def);

//   strict = (): ZodObject<T, "strict", Catchall> =>
//     new ZodObject({
//       ...this._def,
//       unknownKeys: "strict",
//     }) as any;

//   strip = (): ZodObject<T, "strip", Catchall> =>
//     new ZodObject({
//       ...this._def,
//       unknownKeys: "strip",
//     }) as any;

//   passthrough = (): ZodObject<T, "passthrough", Catchall> =>
//     new ZodObject({
//       ...this._def,
//       unknownKeys: "passthrough",
//     }) as any;

//   nonstrict = this.passthrough;

//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   augment = AugmentFactory<ZodObjectDef<T, UnknownKeys, Catchall>>(this._def);
//   extend = AugmentFactory<ZodObjectDef<T, UnknownKeys, Catchall>>(this._def);

//   setKey = <Key extends string, Schema extends ZodTypeAny>(
//     key: Key,
//     schema: Schema
//   ): ZodObject<T & { [k in Key]: Schema }, UnknownKeys, Catchall> => {
//     return this.augment({ [key]: schema }) as any;
//   };

//   /**
//    * Prior to zod@1.0.12 there was a bug in the
//    * inferred type of merged objects. Please
//    * upgrade if you are experiencing issues.
//    */
//   merge: <Incoming extends AnyZodObject>(
//     other: Incoming
//   ) => ZodObject<
//     T & Incoming["_shape"],
//     UnknownKeys,
//     Catchall
//     // objectUtil.MergeObjectParams<Params, MergeUnknownKeys>
//   > = mergeObjects(this as any) as any;

//   catchall = <Index extends ZodTypeAny>(
//     index: Index
//   ): ZodObject<
//     T,
//     UnknownKeys,
//     Index
//     // objectUtil.MergeObjectParams<Params, MergeUnknownKeys>
//   > => {
//     return new ZodObject({
//       ...this._def,
//       // unknownKeys: 'passthrough',
//       catchall: index,
//     }) as any;
//   };

//   pick = <Mask extends { [k in keyof T]?: true }>(
//     mask: Mask
//   ): ZodObject<
//     objectUtil.NoNever<{ [k in keyof Mask]: k extends keyof T ? T[k] : never }>,
//     UnknownKeys,
//     Catchall
//   > => {
//     const shape: any = {};
//     Object.keys(mask).map((key) => {
//       shape[key] = this.shape[key];
//     });
//     return new ZodObject({
//       ...this._def,
//       shape: () => shape,
//     }) as any;
//   };

//   omit = <Mask extends { [k in keyof T]?: true }>(
//     mask: Mask
//   ): ZodObject<
//     objectUtil.NoNever<{ [k in keyof T]: k extends keyof Mask ? never : T[k] }>,
//     UnknownKeys,
//     Catchall
//   > => {
//     const shape: any = {};
//     Object.keys(this.shape).map((key) => {
//       if (Object.keys(mask).indexOf(key) === -1) {
//         shape[key] = this.shape[key];
//       }
//     });
//     return new ZodObject({
//       ...this._def,
//       shape: () => shape,
//     }) as any;
//   };

//   partial = (): ZodObject<
//     { [k in keyof T]: ReturnType<T[k]["optional"]> },
//     UnknownKeys,
//     Catchall
//   > => {
//     const newShape: any = {};
//     for (const key in this.shape) {
//       const fieldSchema = this.shape[key];
//       newShape[key] = fieldSchema.isOptional()
//         ? fieldSchema
//         : fieldSchema.optional();
//     }
//     return new ZodObject({
//       ...this._def,
//       shape: () => newShape,
//     }) as any;
//   };

//   primitives = (): ZodObject<
//     objectUtil.NoNever<
//       {
//         [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? T[k] : never;
//       }
//     >,
//     UnknownKeys,
//     Catchall
//   > => {
//     const newShape: any = {};
//     for (const key in this.shape) {
//       if (isScalar(this.shape[key])) {
//         newShape[key] = this.shape[key];
//       }
//     }
//     return new ZodObject({
//       ...this._def,
//       shape: () => newShape,
//     }) as any;
//   };

//   nonprimitives = (): ZodObject<
//     objectUtil.NoNever<
//       {
//         [k in keyof T]: [T[k]["_output"]] extends [Scalars] ? never : T[k];
//       }
//     >,
//     UnknownKeys,
//     Catchall
//   > => {
//     const newShape: any = {};
//     for (const key in this.shape) {
//       if (!isScalar(this.shape[key])) {
//         newShape[key] = this.shape[key];
//       }
//     }
//     return new ZodObject({
//       ...this._def,
//       shape: () => newShape,
//     }) as any;
//   };

//   deepPartial: () => partialUtil.RootDeepPartial<this> = () => {
//     const newShape: any = {};

//     for (const key in this.shape) {
//       const fieldSchema = this.shape[key];
//       if (fieldSchema instanceof ZodObject) {
//         newShape[key] = fieldSchema.isOptional()
//           ? fieldSchema
//           : (fieldSchema.deepPartial() as any).optional();
//       } else {
//         newShape[key] = fieldSchema.isOptional()
//           ? fieldSchema
//           : fieldSchema.optional();
//       }
//     }
//     return new ZodObject({
//       ...this._def,
//       shape: () => newShape,
//     }) as any;
//   };

//   // keyof: ()=>ZodEnum<{[k in T]: k}>

//   static create = <T extends ZodRawShape>(shape: T): ZodObject<T> => {
//     return new ZodObject({
//       t: ZodTypes.object,
//       shape: () => shape,
//       unknownKeys: "strip",
//       catchall: ZodNever.create(),
//       //  params: {
//       //    strict: true,
//       //  },
//     }) as any;
//   };

//   static lazycreate = <T extends ZodRawShape>(shape: () => T): ZodObject<T> => {
//     return new ZodObject({
//       t: ZodTypes.object,
//       shape,
//       unknownKeys: "strip",
//       catchall: ZodNever.create(),
//     }) as any;
//   };
// }

// export type AnyZodObject = ZodObject<any, any, any>;

// ////////////////////////////////////////
// ////////////////////////////////////////
// //////////                    //////////
// //////////      ZodUnion      //////////
// //////////                    //////////
// ////////////////////////////////////////
// ////////////////////////////////////////
// export interface ZodUnionDef<
//   T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]] = [
//     ZodTypeAny,
//     ZodTypeAny,
//     ...ZodTypeAny[]
//   ]
// > extends ZodTypeDef {
//   t: ZodTypes.union;
//   options: T;
// }

// export class ZodUnion<
//   T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]
// > extends ZodType<T[number]["_output"], ZodUnionDef<T>, T[number]["_input"]> {
//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   toJSON = (): object => ({
//     t: this._def.t,
//     options: this._def.options.map((x) => x.toJSON()),
//   });

//   get options() {
//     return this._def.options;
//   }

//   // distribute = <F extends (arg: T[number]) => ZodTypeAny>(f: F): ZodUnion<{ [k in keyof T]: ReturnType<F> }> => {
//   //   return ZodUnion.create(this._def.options.map(f) as any);
//   // };

//   static create = <T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>(
//     types: T
//   ): ZodUnion<T> => {
//     return new ZodUnion({
//       t: ZodTypes.union,
//       options: types,
//     });
//   };
// }

// ///////////////////////////////////////////////
// ///////////////////////////////////////////////
// //////////                           //////////
// //////////      ZodIntersection      //////////
// //////////                           //////////
// ///////////////////////////////////////////////
// ///////////////////////////////////////////////
// export interface ZodIntersectionDef<
//   T extends ZodTypeAny = ZodTypeAny,
//   U extends ZodTypeAny = ZodTypeAny
// > extends ZodTypeDef {
//   t: ZodTypes.intersection;
//   left: T;
//   right: U;
// }

// export class ZodIntersection<
//   T extends ZodTypeAny,
//   U extends ZodTypeAny
// > extends ZodType<
//   T["_output"] & U["_output"],
//   ZodIntersectionDef<T, U>,
//   T["_input"] & U["_input"]
// > {
//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   toJSON = () => ({
//     t: this._def.t,
//     left: this._def.left.toJSON(),
//     right: this._def.right.toJSON(),
//   });

//   static create = <T extends ZodTypeAny, U extends ZodTypeAny>(
//     left: T,
//     right: U
//   ): ZodIntersection<T, U> => {
//     return new ZodIntersection({
//       t: ZodTypes.intersection,
//       left: left,
//       right: right,
//     });
//   };
// }

// ////////////////////////////////////////
// ////////////////////////////////////////
// //////////                    //////////
// //////////      ZodTuple      //////////
// //////////                    //////////
// ////////////////////////////////////////
// ////////////////////////////////////////
// export type OutputTypeOfTuple<T extends [ZodTypeAny, ...ZodTypeAny[]] | []> = {
//   [k in keyof T]: T[k] extends ZodType<any, any> ? T[k]["_output"] : never;
// };

// export type InputTypeOfTuple<T extends [ZodTypeAny, ...ZodTypeAny[]] | []> = {
//   [k in keyof T]: T[k] extends ZodType<any, any> ? T[k]["_input"] : never;
// };

// export interface ZodTupleDef<
//   T extends [ZodTypeAny, ...ZodTypeAny[]] | [] = [ZodTypeAny, ...ZodTypeAny[]]
// > extends ZodTypeDef {
//   t: ZodTypes.tuple;
//   items: T;
// }

// export class ZodTuple<
//   T extends [ZodTypeAny, ...ZodTypeAny[]] | [] = [ZodTypeAny, ...ZodTypeAny[]]
// > extends ZodType<OutputTypeOfTuple<T>, ZodTupleDef<T>, InputTypeOfTuple<T>> {
//   toJSON = () => ({
//     t: this._def.t,
//     items: (this._def.items as any[]).map((item) => item.toJSON()),
//   });

//   get items() {
//     return this._def.items;
//   }

//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   static create = <T extends [ZodTypeAny, ...ZodTypeAny[]] | []>(
//     schemas: T
//   ): ZodTuple<T> => {
//     return new ZodTuple({
//       t: ZodTypes.tuple,
//       items: schemas,
//     });
//   };
// }

// /////////////////////////////////////////
// /////////////////////////////////////////
// //////////                     //////////
// //////////      ZodRecord      //////////
// //////////                     //////////
// /////////////////////////////////////////
// /////////////////////////////////////////
// export interface ZodRecordDef<Value extends ZodTypeAny = ZodTypeAny>
//   extends ZodTypeDef {
//   t: ZodTypes.record;
//   valueType: Value;
// }

// export class ZodRecord<Value extends ZodTypeAny = ZodTypeAny> extends ZodType<
//   Record<string, Value["_output"]>, // { [k in keyof T]: T[k]['_type'] },
//   ZodRecordDef<Value>,
//   Record<string, Value["_input"]>
// > {
//   readonly _value!: Value;

//   toJSON = () => ({
//     t: this._def.t,
//     valueType: this._def.valueType.toJSON(),
//   });

//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   static create = <Value extends ZodTypeAny = ZodTypeAny>(
//     valueType: Value
//   ): ZodRecord<Value> => {
//     return new ZodRecord({
//       t: ZodTypes.record,
//       valueType,
//     });
//   };
// }

// //////////////////////////////////////
// //////////////////////////////////////
// //////////                  //////////
// //////////      ZodMap      //////////
// //////////                  //////////
// //////////////////////////////////////
// //////////////////////////////////////
// export interface ZodMapDef<
//   Key extends ZodTypeAny = ZodTypeAny,
//   Value extends ZodTypeAny = ZodTypeAny
// > extends ZodTypeDef {
//   t: ZodTypes.map;
//   valueType: Value;
//   keyType: Key;
// }

// export class ZodMap<
//   Key extends ZodTypeAny = ZodTypeAny,
//   Value extends ZodTypeAny = ZodTypeAny
// > extends ZodType<
//   Map<Key["_output"], Value["_output"]>,
//   ZodMapDef<Key, Value>,
//   Map<Key["_input"], Value["_input"]>
// > {
//   readonly _value!: Value;

//   toJSON = () => ({
//     t: this._def.t,
//     valueType: this._def.valueType.toJSON(),
//     keyType: this._def.keyType.toJSON(),
//   });

//   static create = <
//     Key extends ZodTypeAny = ZodTypeAny,
//     Value extends ZodTypeAny = ZodTypeAny
//   >(
//     keyType: Key,
//     valueType: Value
//   ): ZodMap<Key, Value> => {
//     return new ZodMap({
//       t: ZodTypes.map,
//       valueType,
//       keyType,
//     });
//   };
// }

// //////////////////////////////////////
// //////////////////////////////////////
// //////////                  //////////
// //////////      ZodSet      //////////
// //////////                  //////////
// //////////////////////////////////////
// //////////////////////////////////////
// export interface ZodSetDef<Value extends ZodTypeAny = ZodTypeAny>
//   extends ZodTypeDef {
//   t: ZodTypes.set;
//   valueType: Value;
// }

// export class ZodSet<Value extends ZodTypeAny = ZodTypeAny> extends ZodType<
//   Set<Value["_output"]>,
//   ZodSetDef<Value>,
//   Set<Value["_input"]>
// > {
//   readonly _value!: Value;

//   toJSON = () => ({
//     t: this._def.t,
//     valueType: this._def.valueType.toJSON(),
//   });

//   static create = <Value extends ZodTypeAny = ZodTypeAny>(
//     valueType: Value
//   ): ZodSet<Value> => {
//     return new ZodSet({
//       t: ZodTypes.set,
//       valueType,
//     });
//   };
// }

// ///////////////////////////////////////////
// ///////////////////////////////////////////
// //////////                       //////////
// //////////      ZodFunction      //////////
// //////////                       //////////
// ///////////////////////////////////////////
// ///////////////////////////////////////////
// export interface ZodFunctionDef<
//   Args extends ZodTuple<any> = ZodTuple<any>,
//   Returns extends ZodTypeAny = ZodTypeAny
// > extends ZodTypeDef {
//   t: ZodTypes.function;
//   args: Args;
//   returns: Returns;
// }

// export type OuterTypeOfFunction<
//   Args extends ZodTuple<any>,
//   Returns extends ZodTypeAny
// > = Args["_input"] extends Array<any>
//   ? (...args: Args["_input"]) => Returns["_output"]
//   : never;

// export type InnerTypeOfFunction<
//   Args extends ZodTuple<any>,
//   Returns extends ZodTypeAny
// > = Args["_output"] extends Array<any>
//   ? (...args: Args["_output"]) => Returns["_input"]
//   : never;

// // type as df = string extends unknown  ? true : false
// export class ZodFunction<
//   Args extends ZodTuple<any>,
//   Returns extends ZodTypeAny
// > extends ZodType<
//   OuterTypeOfFunction<Args, Returns>,
//   ZodFunctionDef,
//   InnerTypeOfFunction<Args, Returns>
// > {
//   readonly _def!: ZodFunctionDef<Args, Returns>;
//   //  readonly _type!: TypeOfFunction<Args, Returns>;

//   args = <Items extends Parameters<typeof ZodTuple["create"]>[0]>(
//     ...items: Items
//   ): ZodFunction<ZodTuple<Items>, Returns> => {
//     return new ZodFunction({
//       ...this._def,
//       args: ZodTuple.create(items),
//     });
//   };

//   returns = <NewReturnType extends ZodType<any, any>>(
//     returnType: NewReturnType
//   ): ZodFunction<Args, NewReturnType> => {
//     return new ZodFunction({
//       ...this._def,
//       returns: returnType,
//     });
//   };

//   implement = <F extends InnerTypeOfFunction<Args, Returns>>(func: F): F => {
//     const validatedFunc = this.parse(func);
//     return validatedFunc as any;
//   };

//   validate = this.implement;

//   static create = <
//     T extends ZodTuple<any> = ZodTuple<[]>,
//     U extends ZodTypeAny = ZodUnknown
//   >(
//     args?: T,
//     returns?: U
//   ): ZodFunction<T, U> => {
//     return new ZodFunction({
//       t: ZodTypes.function,
//       args: args || ZodTuple.create([]),
//       returns: returns || ZodUnknown.create(),
//     });
//   };

//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   toJSON = () => {
//     return {
//       t: this._def.t,
//       args: this._def.args.toJSON(),
//       returns: this._def.returns.toJSON(),
//     };
//   };
// }

// ///////////////////////////////////////
// ///////////////////////////////////////
// //////////                   //////////
// //////////      ZodLazy      //////////
// //////////                   //////////
// ///////////////////////////////////////
// ///////////////////////////////////////
// export interface ZodLazyDef<T extends ZodTypeAny = ZodTypeAny>
//   extends ZodTypeDef {
//   t: ZodTypes.lazy;
//   getter: () => T;
// }

// export class ZodLazy<T extends ZodTypeAny> extends ZodType<
//   output<T>,
//   ZodLazyDef<T>,
//   input<T>
// > {
//   get schema(): T {
//     return this._def.getter();
//   }

//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   toJSON = () => {
//     throw new Error("Can't JSONify recursive structure");
//   };

//   static create = <T extends ZodTypeAny>(getter: () => T): ZodLazy<T> => {
//     return new ZodLazy({
//       t: ZodTypes.lazy,
//       getter: getter,
//     });
//   };
// }

// //////////////////////////////////////////
// //////////////////////////////////////////
// //////////                      //////////
// //////////      ZodLiteral      //////////
// //////////                      //////////
// //////////////////////////////////////////
// //////////////////////////////////////////
// export interface ZodLiteralDef<T extends any = any> extends ZodTypeDef {
//   t: ZodTypes.literal;
//   value: T;
// }

// export class ZodLiteral<T extends any> extends ZodType<T, ZodLiteralDef<T>> {
//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   toJSON = () => this._def;

//   static create = <T extends Primitive>(value: T): ZodLiteral<T> => {
//     return new ZodLiteral({
//       t: ZodTypes.literal,
//       value: value,
//     });
//   };
// }

// ///////////////////////////////////////
// ///////////////////////////////////////
// //////////                   //////////
// //////////      ZodEnum      //////////
// //////////                   //////////
// ///////////////////////////////////////
// ///////////////////////////////////////
// export type ArrayKeys = keyof any[];
// export type Indices<T> = Exclude<keyof T, ArrayKeys>;

// type EnumValues = [string, ...string[]];

// type Values<T extends EnumValues> = {
//   [k in T[number]]: k;
// };

// export interface ZodEnumDef<T extends EnumValues = EnumValues>
//   extends ZodTypeDef {
//   t: ZodTypes.enum;
//   values: T;
// }

// export class ZodEnum<T extends [string, ...string[]]> extends ZodType<
//   T[number],
//   ZodEnumDef<T>
// > {
//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   toJSON = () => this._def;

//   get options() {
//     return this._def.values;
//   }

//   get enum(): Values<T> {
//     const enumValues: any = {};
//     for (const val of this._def.values) {
//       enumValues[val] = val;
//     }
//     return enumValues as any;
//   }

//   get Values(): Values<T> {
//     const enumValues: any = {};
//     for (const val of this._def.values) {
//       enumValues[val] = val;
//     }
//     return enumValues as any;
//   }

//   get Enum(): Values<T> {
//     const enumValues: any = {};
//     for (const val of this._def.values) {
//       enumValues[val] = val;
//     }
//     return enumValues as any;
//   }

//   static create = <U extends string, T extends [U, ...U[]]>(
//     values: T
//   ): ZodEnum<T> => {
//     return new ZodEnum({
//       t: ZodTypes.enum,
//       values: values,
//     }) as any;
//   };
// }

// /////////////////////////////////////////////
// /////////////////////////////////////////////
// //////////                         //////////
// //////////      ZodNativeEnum      //////////
// //////////                         //////////
// /////////////////////////////////////////////
// /////////////////////////////////////////////
// export interface ZodNativeEnumDef<T extends EnumLike = EnumLike>
//   extends ZodTypeDef {
//   t: ZodTypes.nativeEnum;
//   values: T;
// }

// type EnumLike = { [k: string]: string | number; [nu: number]: string };

// export class ZodNativeEnum<T extends EnumLike> extends ZodType<
//   T[keyof T],
//   ZodNativeEnumDef<T>
// > {
//   toJSON = () => this._def;
//   static create = <T extends EnumLike>(values: T): ZodNativeEnum<T> => {
//     return new ZodNativeEnum({
//       t: ZodTypes.nativeEnum,
//       values: values,
//     });
//   };
// }

// //////////////////////////////////////////
// //////////////////////////////////////////
// //////////                      //////////
// //////////      ZodPromise      //////////
// //////////                      //////////
// //////////////////////////////////////////
// //////////////////////////////////////////
// export interface ZodPromiseDef<T extends ZodTypeAny = ZodTypeAny>
//   extends ZodTypeDef {
//   t: ZodTypes.promise;
//   type: T;
// }

// export class ZodPromise<T extends ZodTypeAny> extends ZodType<
//   Promise<T["_output"]>,
//   ZodPromiseDef<T>,
//   Promise<T["_input"]>
// > {
//   toJSON = () => {
//     return {
//       t: this._def.t,
//       type: this._def.type.toJSON(),
//     };
//   };

//   // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   static create = <T extends ZodTypeAny>(schema: T): ZodPromise<T> => {
//     return new ZodPromise({
//       t: ZodTypes.promise,
//       type: schema,
//     });
//   };
// }

// //////////////////////////////////////////////
// //////////////////////////////////////////////
// //////////                          //////////
// //////////      ZodTransformer      //////////
// //////////                          //////////
// //////////////////////////////////////////////
// //////////////////////////////////////////////
// export interface ZodTransformerDef<T extends ZodTypeAny = ZodTypeAny>
//   extends ZodTypeDef {
//   t: ZodTypes.transformer;
//   schema: T;
//   // transforms: (arg: T["_output"]) => U["_input"];
// }

// export class ZodTransformer<
//   T extends ZodTypeAny,
//   Output = T["_type"]
// > extends ZodType<Output, ZodTransformerDef<T>, T["_input"]> {
//   toJSON = () => ({
//     t: this._def.t,
//     schema: this._def.schema.toJSON(),
//   });

//   constructor(def: ZodTransformerDef<T>) {
//     super(def);
//     if (def.schema instanceof ZodTransformer) {
//       throw new Error("ZodTransformers cannot be nested.");
//     }
//   }

//   /** You can't use the .default method on transformers! */
//   default: (..._args: any[]) => never = (..._args: any[]) => {
//     throw new Error(
//       "You can't use the default method on a ZodTransformer instance."
//     );
//   };

//   // static create = <I extends ZodTypeAny, O extends ZodTypeAny, Out>(
//   static create = <I extends ZodTypeAny>(
//     schema: I
//     // outputSchema?: O,
//     // tx?: (arg: I["_output"]) => Out | Promise<Out>
//   ): ZodTransformer<I, I["_output"]> => {
//     // if (schema instanceof ZodTransformer) {
//     //   throw new Error("Can't nest transformers inside each other.");
//     // }
//     const newTx = new ZodTransformer({
//       t: ZodTypes.transformer,
//       schema,
//     });

//     // if (outputSchema && tx) {
//     //   console.warn(
//     //     `Calling transform() with three arguments is deprecated and not recommended.`
//     //   );
//     //   newTx = newTx.transform(tx).transform((val) => outputSchema.parse);
//     // }
//     return newTx;
//   };

//   // mod: <NewOut>(
//   //   arg: (curr: Output) => NewOut | Promise<NewOut>
//   // ) => ZodTransformer<T, NewOut> = (arg) => {
//   //   return this.mod(arg);
//   // };
// }

// ///////////////////////////////////////////
// ///////////////////////////////////////////
// //////////                       //////////
// //////////      ZodOptional      //////////
// //////////                       //////////
// ///////////////////////////////////////////
// ///////////////////////////////////////////
// // export interface ZodOptionalDef<T extends ZodTypeAny = ZodTypeAny>
// //   extends ZodTypeDef {
// //   t: ZodTypes.optional;
// //   innerType: T;
// // }

// // // This type allows for optional flattening
// // export type ZodOptionalType<
// //   T extends ZodTypeAny
// // > = T extends ZodOptional<ZodTypeAny> ? T : ZodOptional<T>;

// // export class ZodOptional<T extends ZodTypeAny> extends ZodType<
// //   T["_output"] | undefined,
// //   ZodOptionalDef<T>,
// //   T["_input"] | undefined
// // > {
// //   // An optional optional is the original optional
// //   // optional: () => ZodOptionalType<this> = () => this as ZodOptionalType<this>;
// //   toJSON = () => ({
// //     t: this._def.t,
// //     innerType: this._def.innerType.toJSON(),
// //   });

// //   static create = <T extends ZodTypeAny>(type: T): ZodOptionalType<T> => {
// //     if (type instanceof ZodOptional) return type as ZodOptionalType<T>;

// //     return new ZodOptional({
// //       t: ZodTypes.optional,
// //       innerType: type,
// //     }) as ZodOptionalType<T>;
// //   };
// // }

// ///////////////////////////////////////////
// ///////////////////////////////////////////
// //////////                       //////////
// //////////      ZodNullable      //////////
// //////////                       //////////
// ///////////////////////////////////////////
// ///////////////////////////////////////////
// export interface ZodNullableDef<T extends ZodTypeAny = ZodTypeAny>
//   extends ZodTypeDef {
//   t: ZodTypes.nullable;
//   innerType: T;
// }

// // This type allows for nullable flattening
// export type ZodNullableType<
//   T extends ZodTypeAny
// > = T extends ZodNullable<ZodTypeAny> ? T : ZodNullable<T>;

// export class ZodNullable<
//   T extends ZodTypeAny
//   //  Output extends T['_output'] | null = T['_output'] | null,
//   //  Input extends T['_input'] | null = T['_input'] | null
// > extends ZodType<T["_output"] | null, ZodNullableDef<T>, T["_input"] | null> {
//   // An nullable nullable is the original nullable
//   // nullable: () => ZodNullableType<this> = () => this as ZodNullableType<this>;
//   toJSON = () => ({
//     t: this._def.t,
//     innerType: this._def.innerType.toJSON(),
//   });

//   static create = <T extends ZodTypeAny>(type: T): ZodNullableType<T> => {
//     if (type instanceof ZodNullable) return type as ZodNullableType<T>;
//     return new ZodNullable({
//       t: ZodTypes.nullable,
//       innerType: type,
//     }) as ZodNullableType<T>;
//   };
// }
export {};
