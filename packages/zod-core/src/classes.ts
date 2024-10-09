import * as core from "./core.js";
import type * as err from "./errors_v2.js";
import * as parse from "./parse.js";
// import type * as zsf from "./zsf.js";

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      $ZodCore      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

type $ZodDiscriminators = Array<
  { key: PropertyKey; discs: $ZodDiscriminators } | Set<unknown>
>;

interface ZodCoreTypeDef extends core.$ZodTypeDef {}

export abstract class ZodCoreType<
    out O = unknown,
    out I = unknown,
    out D extends ZodCoreTypeDef = ZodCoreTypeDef,
  >
  extends core.Dynamic<D>
  implements core.$ZodType<O, I, D>
{
  "~standard" = 1;

  declare "~output": O;
  declare "~input": I;
  declare "~types": core.Types<O, I>;

  declare "~meta"?: unknown;
  declare "~optional"?: unknown;
  declare "~async"?: boolean;

  declare def: D;
  declare "~values"?: Set<O>;
  declare "~regex"?: Set<unknown>;

  // overidden for literals, enum, null, undefined, etc.
  get discriminators(): $ZodDiscriminators | undefined {
    return undefined;
  }

  $zod: { version: number } = { version: 4 };

  constructor(def: D) {
    super(def);
    this.def = def;
    // console.log(`base constructor`);
    // console.log(this._parseInput);
    // console.log(this._refineInput);
    // this.$parse = core.ComposeParsers(this._parseInput, this._refineInput);
    if (def.checks) {
      for (const check of def.checks) {
        if ((check as any).__mutate) (check as any).__mutate(this);
      }
    }
  }
  computed?: object;
  refine(
    ...refinements: core.$ZodCheck<O, unknown, core.$ZodCheckDef>[]
  ): this {
    throw new Error("Method not implemented.");
  }

  /** @deprecated Internal API, use with caution. */
  // protected abstract _parseInput: core.$Parser<O>;
  protected abstract _parseInput(
    input: unknown,
    ctx: parse.ParseContext | undefined,
    fail: parse.$ZodFailure | undefined
  ): parse.ParseReturnType<O>;

  // protected _runCheck = (
  //   check: core.$ZodCheck<never, any>,
  //   input: unknown,
  //   ctx?: parse.ParseContext
  // ): parse.ParseReturnType<this["~output"]> => {
  //   const checkCtx = core.makeCheckCtx(input, ctx);
  //   check.run(checkCtx);
  //   return checkCtx.fail ?? (checkCtx.input as this["~output"]);
  // };

  /** @deprecated Internal API, use with caution. */
  protected _refineInput: core.$Parser<O> = core.ChecksParser(
    this.checks || []
  );
  // protected _refineInput = (
  //   input: unknown,
  //   ctx?: parse.ParseContext,
  //   fail?: parse.$ZodFailure,
  //   checks?: core.$ZodCheck<this["~output"]>[]
  // ): parse.ParseReturnType<this["~output"]> => {
  //   console.log("_checks::fail", fail);
  //   const checkCtx = core.makeCheckCtx(input as never, ctx, fail);
  //   for (const check of checks || this.def.checks || []) {
  //     check.run(checkCtx);
  //     if (checkCtx.fail && checkCtx.fail.level === "abort")
  //       return checkCtx.fail;
  //   }

  //   return checkCtx.fail ?? (checkCtx.input as this["~output"]);
  // };

  // $parse!: core.$Parser<O>;
  //  = core.ComposeParsers(
  //   this._parseInput,
  //   this._refineInput
  // );
  $parse(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    const result = this._parseInput(input, ctx, undefined);
    if (!this.def.checks || !this.def.checks.length) return result;
    if (parse.failed(result)) {
      if (parse.aborted(result)) return result;
      return this._refineInput(input, ctx, result);
    }
    return this._refineInput(input, ctx, undefined);
  }

  /** @deprecated Internal API, use with caution. */
  _clone(this: any, def: D): this {
    return new this.constructor(def);
  }

  /** @deprecated Internal API, use with caution. */
  _addCheck = (check: core.$ZodCheck<O, unknown>): this => {
    const def = { ...this.def };
    def.checks = [...(def.checks || []), check];
    return this._clone(def);
    // return clone;
  };
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodString      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////
function virtuals<O, I>(): {
  "~output": O;
  "~input": I;
  "~types": {
    output: O;
    input: I;
  };
} {
  return {} as any;
}

function optional(this: core.$ZodType) {
  return {
    type: "optional",
    inner: this,
  };
}
function process<T>(arg: T): T {
  for (const key in arg) {
    if (typeof arg[key] === "function") {
      (arg as any)[key] = arg[key].bind(arg);
    }
  }
  return arg;
}

function _string(def: core.$ZodStringDef): core.$ZodString {
  const parser = ((input, ctx) => {
    if (typeof input === "string") return input;
    return parse.$ZodFailure.from(
      [
        {
          origin: "string",
          code: "invalid_type",
          received: parse.getParsedType(input),
          input,
        },
      ],
      ctx
    );
  }) satisfies core.$Parser<string>;
  return process({
    ...def,
    ...virtuals<string, string>(),
    "~standard": 1,
    def,
    // $parse: core.StringParser(def),
    optional() {
      console.log("asdf");
    },
    $parse: parser,
    // _optional,
    asdfjkh() {
      this.optional;
    },
    parse,
  }) as core.$ZodString;
}
export class ZodCoreString<
    out O extends string,
    out I,
    out D extends core.$ZodStringDef,
  >
  extends ZodCoreType<O, I, D>
  implements core.$ZodString
{
  computed?: object;
  override type = "string" as const;

  declare min_length?: number;
  declare max_length?: number;
  declare pattern?: string;

  // override _parseInput = core.StringParser(this.def) as core.$Parser<O>;
  override _parseInput(input: unknown, ctx?: parse.ParseContext) {
    if (typeof input === "string") return input as O;
    return parse.$ZodFailure.from(
      [
        {
          origin: "string",
          code: "invalid_type",
          received: parse.getParsedType(input),
          input,
        },
      ],
      ctx,
      this
    );
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodNumber      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

export class ZodCoreNumber<
    out O extends number,
    out I,
    D extends core.$ZodNumberDef,
  >
  extends ZodCoreType<O, I, D>
  implements core.$ZodNumber
{
  constructor(def: D) {
    super(def);
    console.log(`number constructor`);
    console.log(def);
  }
  override type = "number" as const;

  computed!: {
    minimum?: number | bigint;
    maximum?: number | bigint;
    multiple_of?: number;
  };

  override _parseInput = core.NumberParser(this) as core.$Parser<O>;
}

// export class ZodNumber extends ZodCoreNumber<number, number, core.$ZodNumberDef> {}
// export class ZodCoercedNumber extends ZodCoreNumber<number, unknown, core.$ZodNumberDef> {}

//////////////////////////////////////////

export class ZodCoreInteger<
    out O extends number,
    out I,
    out D extends core.$ZodIntegerDef = core.$ZodIntegerDef,
  >
  extends ZodCoreType<O, I, D>
  implements core.$ZodNumber, core.$ZodCheck<number>
{
  override type = "number" as const;
  check = "integer" as const;

  /** @deprecated Internal API, use with caution. */
  override _parseInput = core.IntegerParser(this) as core.$Parser<O>;

  computed: {
    minimum?: number | bigint;
    maximum?: number | bigint;
    multiple_of?: number;
  } = {};

  run: core.$Checker<number> = core.NumberFormatCheck(this).run;
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////                      //////////
//////////      $ZodBigInt      //////////
//////////                      //////////
//////////////////////////////////////////
//////////////////////////////////////////

export class ZodCoreBigInt<
    out O extends bigint,
    out I,
    D extends core.$ZodBigIntDef = core.$ZodBigIntDef,
  >
  extends ZodCoreType<O, I, D>
  implements core.$ZodBigInt
{
  override type = "bigint" as const;
  override _parseInput = core.BigIntParser(this) as core.$Parser<O>;
  // (
  //   input: unknown,
  //   ctx?: parse.ParseContext
  // ): parse.ParseReturnType<this["~output"]> {
  //   if (typeof input === "bigint") return input as this["~output"];
  //   if (this.def.coerce) {
  //     try {
  //       input = BigInt(input as any);
  //     } catch (err) {}
  //   }
  //   if (typeof input !== "bigint") {
  //     return parse.$ZodFailure.from(
  //       [
  //         {
  //           origin: "bigint",
  //           code: "invalid_type",
  //           received: parse.getParsedType(input),
  //           input,
  //         },
  //       ],
  //       ctx,
  //       this
  //     );
  //   }
  //   return input as this["~output"];
  // }
}

///////////////////////////////////////////
///////////////////////////////////////////
//////////                      ///////////
//////////      $ZodBoolean      //////////
//////////                      ///////////
///////////////////////////////////////////
///////////////////////////////////////////

export class ZodCoreBoolean<
    out O extends boolean,
    out I,
    D extends core.$ZodBooleanDef = core.$ZodBooleanDef,
  >
  extends ZodCoreType<O, I, D>
  implements core.$ZodBoolean
{
  override type = "boolean" as const;
  override _parseInput = core.BooleanParser(this) as core.$Parser<O>;
}

// class Bool <
//   O extends boolean,
//   I,
//   D extends core.$ZodBooleanDef = core.$ZodBooleanDef,
// > extends ZodCoreType<O, I, D> {
//   // type = "boolean" as const;

//   _parseInput(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     if (typeof input === "boolean") return input as this["~output"];
//     if (this.def.coerce) input = Boolean(input);

//     if (typeof input !== "boolean") {
//       return parse.$ZodFailure.from(
//         [
//           {
//             origin: "boolean",
//             code: "invalid_type",
//             received: parse.getParsedType(input),
//             input,
//           },
//         ],
//         ctx,
//         this
//       );
//     }

//     return input as this["~output"];
//   }
// }

///////////////////////////////////////
///////////////////////////////////////
//////////                     ////////
//////////      $ZodDate        ////////
//////////                     ////////
///////////////////////////////////////
///////////////////////////////////////

export interface $ZodDateDef extends ZodCoreTypeDef {
  type: "date";
  coerce: boolean;
  // error?:
  //   | err.$ZodErrorMap<
  //       err.$ZodIssueDateInvalidType | err.$ZodIssueDateInvalidDate
  //     >
  //   | undefined;
}

export class ZodCoreDate<
  O extends Date,
  I,
  D extends $ZodDateDef = $ZodDateDef,
> extends ZodCoreType<O, I, D> {
  _parseInput(
    input: unknown,
    ctx: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    if (input instanceof Date && !Number.isNaN(input.getTime()))
      return input as this["~output"];
    if (this.def.coerce) {
      try {
        input = new Date(input as string | number | Date);
      } catch (err) {}
    }

    if (!(input instanceof Date)) {
      return parse.$ZodFailure.from(
        [
          {
            origin: "date",
            code: "invalid_type",
            received: parse.t(input),
            input,
          },
        ],
        ctx,
        this
      );
    }

    if (Number.isNaN(input.getTime())) {
      return parse.$ZodFailure.from(
        [{ origin: "date", code: "invalid_date", input }],
        ctx,
        this
      );
    }

    return new Date(input.getTime()) as this["~output"];
  }
}

// ////////////////////////////////////////////
// ////////////////////////////////////////////
// //////////                        //////////
// //////////       $ZodSymbol       //////////
// //////////                        //////////
// ////////////////////////////////////////////
// ////////////////////////////////////////////
export interface $ZodSymbolDef extends ZodCoreTypeDef {
  error?: err.$ZodErrorMap<err.$ZodIssueSymbolInvalidType> | undefined;
}

export class ZodCoreSymbol<
  D extends $ZodSymbolDef = $ZodSymbolDef,
> extends ZodCoreType<symbol, symbol, D> {
  override type = "symbol" as const;
  _parseInput(
    input: unknown,
    ctx?: parse.ParseContext | undefined
  ): parse.ParseReturnType<this["~output"]> {
    if (typeof input === "symbol") return input as this["~output"];
    return parse.$ZodFailure.from(
      [
        {
          origin: "symbol",
          code: "invalid_type",
          received: parse.getParsedType(input),
          input,
        },
      ],
      ctx,
      this
    );
  }
}

// ////////////////////////////////////////////
// ////////////////////////////////////////////
// //////////                        //////////
// //////////      $ZodUndefined     //////////
// //////////                        //////////
// ////////////////////////////////////////////
// ////////////////////////////////////////////
// export interface $ZodUndefinedDef extends ZodCoreTypeDef {
//   error?: err.$ZodErrorMap<err.$ZodIssueSymbolInvalidType> | undefined;
// }

// export class ZodCoreUndefined<
//   D extends $ZodUndefinedDef = $ZodUndefinedDef,
// > extends ZodCoreType<undefined, undefined, D> {
//   override type = "optional" as const;
//   inner = { $zsf: { version: 1 }, type: "never" } as const;
//   _parseInput(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     if (typeof input === "undefined") return input as this["~output"];
//     return parse.$ZodFailure.from(
//       [
//         {
//           code: "invalid_type",
//           expected: "undefined",
//           received: parse.getParsedType(input),
//           input,
//         },
//       ],
//       ctx,
//       this
//     );
//   }
// }

// ///////////////////////////////////////
// ///////////////////////////////////////
// //////////                   //////////
// //////////      $ZodNull      /////////
// //////////                   //////////
// ///////////////////////////////////////
// ///////////////////////////////////////
// export interface $ZodNullDef extends ZodCoreTypeDef {
//   error?: err.$ZodErrorMap<err.$ZodIssueInvalidTypeBasic> | undefined;
// }

// export class ZodCoreNull<
//   D extends $ZodNullDef = $ZodNullDef,
// > extends ZodCoreType<null, null, D> {
//   override type = "null" as const;
//   _parseInput(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     if (input === null) return input as this["~output"];
//     return parse.$ZodFailure.from(
//       [
//         {
//           code: "invalid_type",
//           expected: "null",
//           received: parse.getParsedType(input),
//           input,
//         },
//       ],
//       ctx,
//       this
//     );
//   }
// }

// //////////////////////////////////////
// //////////////////////////////////////
// //////////                  //////////
// //////////      $ZodAny     //////////
// //////////                  //////////
// //////////////////////////////////////
// //////////////////////////////////////

// interface $ZodAnyDef extends ZodCoreTypeDef {
//   error?: err.$ZodErrorMap<never> | undefined;
// }

// export class ZodCoreAny<D extends $ZodAnyDef = $ZodAnyDef> extends ZodCoreType<
//   any,
//   any,
//   D
// > {
//   override type = "any" as const;
//   protected override _parseInput(
//     input: unknown,
//     _ctx?: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     return input as this["~output"];
//   }
// }

// //////////////////////////////////////////
// //////////////////////////////////////////
// //////////                      //////////
// //////////      $ZodUnknown     //////////
// //////////                      //////////
// //////////////////////////////////////////
// //////////////////////////////////////////
// interface $ZodUnknownDef extends ZodCoreTypeDef {
//   error?: err.$ZodErrorMap<never> | undefined;
// }

// export class ZodCoreUnknown<
//   D extends $ZodUnknownDef = $ZodUnknownDef,
// > extends ZodCoreType<unknown, unknown, D> {
//   override type = "any" as const;
//   _parseInput(
//     input: unknown,
//     _ctx: parse.ParseContext
//   ): parse.ParseReturnType<unknown> {
//     return input as unknown;
//   }
// }

// /////////////////////////////////////////
// /////////////////////////////////////////
// //////////                     //////////
// //////////      $ZodNever      //////////
// //////////                     //////////
// /////////////////////////////////////////
// /////////////////////////////////////////
// interface $ZodNeverDef extends ZodCoreTypeDef {
//   error?: err.$ZodErrorMap<err.$ZodIssueInvalidTypeBasic> | undefined;
// }

// export class ZodCoreNever<
//   D extends $ZodNeverDef = $ZodNeverDef,
// > extends ZodCoreType<never, never, D> {
//   override type = "never" as const;
//   _parseInput(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<never> {
//     return parse.$ZodFailure.from(
//       [
//         {
//           code: "invalid_type",
//           expected: "never",
//           received: parse.getParsedType(input),
//           input,
//         },
//       ],
//       ctx,
//       this
//     );
//   }
// }

// ////////////////////////////////////////
// ////////////////////////////////////////
// //////////                    //////////
// //////////      $ZodVoid      //////////
// //////////                    //////////
// ////////////////////////////////////////
// ////////////////////////////////////////
// interface $ZodVoidDef extends ZodCoreTypeDef {
//   error?: err.$ZodErrorMap<err.$ZodIssueInvalidTypeBasic> | undefined;
// }

// export class ZodCoreVoid<
//   D extends $ZodVoidDef = $ZodVoidDef,
// > extends ZodCoreType<void, void, D> {
//   override type = "optional" as const;
//   inner = { $zsf: { version: 1 }, type: "never" } as const;
//   _parseInput(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<void> {
//     if (typeof input === "undefined") return undefined;
//     return parse.$ZodFailure.from(
//       [
//         {
//           code: "invalid_type",
//           expected: "undefined",
//           received: parse.getParsedType(input),
//           input,
//         },
//       ],
//       ctx,
//       this
//     );
//   }
// }

// /////////////////////////////////////////
// /////////////////////////////////////////
// //////////                     //////////
// //////////      $ZodArray      //////////
// //////////                     //////////
// /////////////////////////////////////////
// /////////////////////////////////////////
// export interface $ZodArrayDef<T extends core.$ZodType = core.$ZodType>
//   extends ZodCoreTypeDef {
//   items: T;
// }

// export class ZodCoreArray<
//   T extends core.$ZodType = core.$ZodType,
// > extends ZodCoreType<T["~output"][], T["~input"][], $ZodArrayDef<T>> {
//   items!: T;

//   override type = "array" as const;
//   prefixItems = [] as [];
//   _parseInput(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     // const parsedType = parse.getParsedType(input);

//     if (!Array.isArray(input)) {
//       return parse.$ZodFailure.from(
//         [
//           {
//             input,
//             code: "invalid_type",
//             expected: parse.ZodParsedType.array,
//             received: parse.getParsedType(input),
//           },
//         ],
//         ctx,
//         this
//       );
//     }

//     // const issues: err.$ZodIssueData[] = [];
//     let fail!: parse.$ZodFailure;
//     let hasPromises = false;
//     const parseResults = Array(input.length);
//     for (const [i, item] of Object.values(input)) {
//       const result = this.items._parse(item, ctx);
//       parseResults[i] = result;
//       if (result instanceof Promise) {
//         hasPromises = true;
//         break;
//       }
//       if (parse.failed(result)) {
//         fail = fail || new parse.$ZodFailure([]);
//         fail.mergeIn(result, i);
//       }
//     }

//     if (!hasPromises) {
//       if (!fail) return parseResults as any;
//       return fail;
//     }

//     // async handling
//     return Promise.all(parseResults).then((results) => {
//       for (const [i, result] of Object.values(results)) {
//         if (parse.failed(result)) {
//           fail = fail || new parse.$ZodFailure([]);
//           fail.mergeIn(result, i);
//         }
//       }
//       return fail ?? results;
//     });
//   }
// }

// //////////////////////////////////////////
// //////////////////////////////////////////
// //////////                      //////////
// //////////      $ZodObject      //////////
// //////////                      //////////
// //////////////////////////////////////////
// //////////////////////////////////////////
// type $ZodRawShape = {
//   [k: string]: core.$ZodType;
// };

// export interface $ZodObjectDef<Shape extends $ZodRawShape = $ZodRawShape>
//   extends ZodCoreTypeDef {
//   properties: Shape;
//   additionalProperties?: core.$ZodType;
// }

// export type ObjectOutputType<Shape extends $ZodRawShape> =
//   types.addQuestionMarks<{
//     [k in keyof Shape]: Shape[k]["~output"];
//   }>;

// export type ObjectInputType<Shape extends $ZodRawShape> =
//   types.addQuestionMarks<{
//     [k in keyof Shape]: Shape[k]["~input"];
//   }>;

// export type mergeTypes<A, B> = {
//   [k in keyof A | keyof B]: k extends keyof B
//     ? B[k]
//     : k extends keyof A
//       ? A[k]
//       : never;
// };

// function handleObjectResults(results: {
//   [k: PropertyKey]: parse.SyncParseReturnType;
// }) {
//   let fail!: parse.$ZodFailure;
//   for (const key in results) {
//     if (parse.failed(results[key])) {
//       fail = fail || new parse.$ZodFailure();
//       fail.mergeIn(results[key], key);
//     }
//   }
//   return fail ?? results;
// }

// // type Public<T> = { [k in keyof T]: T[k] };
// // class Thing {
// //   public name!: string;
// //   private _secret!: string;
// // }

// // const this_works: Public<Thing> = { name: "chappell" };
// // const this_doesnt: Thing = { name: "katy" };
// // // Property '_secret' is missing in type '{ name: string; }' but required in type 'Thing'.

// export class ZodCoreObject<O, I, D extends $ZodObjectDef> extends ZodCoreType<
//   O,
//   I,
//   D
// > {
//   properties: {
//     key: string;
//     value: core.$ZodType;
//     format?: "literal" | "pattern";
//     ordering?: number;
//   }[];

//   override type = "object" as const;
//   _stringProps: Set<string> = new Set(
//     Object.keys(this.properties).filter(
//       (k) => k[0] !== "/" || k[k.length - 1] !== "/"
//     )
//   );

//   _patternProps: Map<RegExp, core.$ZodType> = new Map(
//     Object.entries(this.properties)
//       .filter(([k, _]) => k[0] === "/" && k[k.length - 1] === "/")
//       .map(([k, v]) => [new RegExp(k.slice(1, -1)), v])
//   );

//   /** @deprecated Use the .properties property instead */
//   // get shape(): Shape {
//   //   return this.properties;
//   // }

//   /** @deprecated Use the .additionalProperties property instead */
//   get fallback(): core.$ZodType | undefined {
//     return this.additionalProperties;
//   }

//   override get discriminators(): core.$ZodDiscriminators | undefined {
//     const discs: core.$ZodDiscriminators = [];
//     for (const key in this.properties) {
//       const _discs = this.properties[key].discriminators;
//       if (_discs) discs.push({ key, discs: _discs });
//     }
//     return discs.length ? discs : undefined;
//   }

//   /** @deprecated Internal API, use with caution. */
//   protected override _parseInput(
//     input: unknown,
//     ctx?: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     if (!parse.isPlainObject(input)) {
//       return parse.$ZodFailure.from(
//         [
//           {
//             code: "invalid_type",
//             expected: "object",
//             received: parse.getParsedType(input),
//             input,
//           },
//         ],
//         ctx
//       );
//     }

//     let async = false;
//     // let fail!: parse.$ZodFailure;

//     // in coerce mode, reuse `input` instead of {}
//     const objectResults: any = {};

//     // Validate each key in the shape

//     let unrecognizedKeys!: Set<string>;

//     for (const key in input) {
//       // if key is in _stringProps, parse against associated value schema
//       let valueSchema!: core.$ZodType;
//       if (this._stringProps.has(key)) {
//         valueSchema = this.properties[key];
//       } else {
//         for (const [pattern, schema] of this._patternProps) {
//           if (pattern.test(key)) {
//             valueSchema = schema;
//             break;
//           }
//         }
//       }
//       if (!valueSchema) {
//         unrecognizedKeys = unrecognizedKeys || new Set();
//         unrecognizedKeys.add(key);
//         continue;
//       }

//       const resultValue = valueSchema._parse((input as any)[key], ctx);
//       objectResults[key] = resultValue;

//       if (objectResults[key] instanceof Promise) async = true;

//       // if (parse.failed(objectResults[key])) {
//       //   fail = fail || new parse.$ZodFailure();
//       //   fail.mergeIn(objectResults[key], key);
//       // }
//     }

//     // let inputKeys!: Set<string>;
//     // only initialize if additionalProperties isn't "strip"
//     // if (this.additionalProperties) inputKeys = new Set(Object.keys(input));

//     // for (const key in this.properties) {
//     //   if (this.additionalProperties) inputKeys.delete(key);
//     //   const inputValue = (input as any)[key];
//     //   const resultValue = this.properties[key]._parse(inputValue, ctx);

//     //   // optimization?? this also makes coerce mode much easier
//     //   // if (resultValue !== inputValue)
//     //   parsedObject[key] = resultValue;

//     //   if (parsedObject[key] instanceof Promise) {
//     //     async = true;
//     //     continue;
//     //   }

//     //   if (parse.failed(parsedObject[key])) {
//     //     fail = fail || new parse.$ZodFailure();
//     //     fail.mergeIn(parsedObject[key], key);
//     //   }
//     // }

//     // if (this.additionalProperties) {
//     //   for (const key of inputKeys) {
//     //     const result = this.additionalProperties._parse(
//     //       (input as any)[key],
//     //       ctx
//     //     );
//     //     if (result instanceof Promise) {
//     //       async = true;
//     //       continue;
//     //     }
//     //     if (parse.failed(result)) {
//     //       fail = fail || new parse.$ZodFailure();
//     //       fail.mergeIn(result, key);
//     //     }
//     //   }
//     // }

//     if (!async) return handleObjectResults(objectResults);
//     return util.promiseAllObject(objectResults).then(handleObjectResults);
//   }
// }

// /////////////////////////////////////////
// /////////////////////////////////////////
// //////////                    ///////////
// //////////      $ZodUnion      //////////
// //////////                    ///////////
// /////////////////////////////////////////
// /////////////////////////////////////////
// export interface $ZodUnionDef<T extends core.$ZodType[]>
//   extends ZodCoreTypeDef {
//   elements: T;
// }

// export class ZodCoreUnion<T extends core.$ZodType[]> extends ZodCoreType<
//   T[number]["~output"],
//   T[number]["~input"],
//   $ZodUnionDef<T>
// > {
//   elements!: core.$ZodType[];

//   override type = "union" as const;
//   /** @deprecated Use the .elements property instead. */
//   get options(): T {
//     return this.elements;
//   }

//   /** @deprecated Internal API, use with caution. */
//   protected override _parseInput(
//     input: unknown,
//     ctx?: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const options = this.options;

//     let async = false;
//     const results: any[] = Array(this.options.length);
//     for (const i in options) {
//       const option = options[i];
//       results[i] = option._parse(input, ctx);
//       if (results[i] instanceof Promise) async = true;
//       // do not return if async is true
//       // an earlier Promise may resolve to a valid value
//       if (async) continue;

//       if (!parse.failed(results[i])) {
//         return results[i];
//       }
//     }
//     if (!async)
//       return parse.$ZodFailure.from(
//         [
//           {
//             code: "invalid_type",
//             expected: "union",
//             unionErrors: results,
//             input,
//           },
//         ],
//         ctx,
//         this
//       );

//     // async handling
//     return Promise.all(results).then((results) => {
//       for (const result of results) {
//         if (!parse.failed(result)) {
//           return result;
//         }
//       }
//       return parse.$ZodFailure.from(
//         [
//           {
//             code: "invalid_type",
//             expected: "union",
//             unionErrors: results,
//             input,
//           },
//         ],
//         ctx,
//         this
//       );
//     });
//   }
// }

// //////////////////////////////////////////////////////
// //////////////////////////////////////////////////////
// //////////                                  //////////
// //////////      $ZodDiscriminatedUnion      //////////
// //////////                                  //////////
// //////////////////////////////////////////////////////
// //////////////////////////////////////////////////////

// // interface $ZodDiscriminatedUnionDef<
// //   Options extends core.$ZodType[] = core.$ZodType[],
// // > extends $ZodUnionDef<Options> {}

// function matchDiscriminators(
//   input: any,
//   discs: core.$ZodDiscriminators
// ): boolean {
//   for (const disc of discs) {
//     if (disc instanceof Set) {
//       if (!disc.has(input)) return false;
//     } else if (disc.key !== null) {
//       if (input === undefined) return false;
//       return matchDiscriminators(input[disc.key], disc.discs);
//     }
//   }
//   return true;
// }

// export class ZodCoreDiscriminatedUnion<
//   Options extends core.$ZodType[] = core.$ZodType[],
// > extends $ZodUnion<Options> {
//   protected override _parseInput(
//     input: unknown,
//     ctx?: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const filteredOptions: core.$ZodType[] = [];
//     for (const option of this.elements) {
//       if (!option.discriminators) filteredOptions.push(option);
//       else if (matchDiscriminators(input, option.discriminators)) {
//         filteredOptions.push(option);
//       }
//     }

//     if (filteredOptions.length === 1)
//       return filteredOptions[0]._parse(input, ctx) as this["~output"];
//     for (const option of filteredOptions) {
//       const result = option._parse(input, ctx);
//       if (!parse.failed(result)) return result as this["~output"];
//     }
//     return super._parseInput(input, ctx);
//   }
// }

// ////////////////////////////////////////////////
// ////////////////////////////////////////////////
// //////////                            //////////
// //////////      $ZodIntersection      //////////
// //////////                            //////////
// ////////////////////////////////////////////////
// ////////////////////////////////////////////////

// function mergeValues(
//   a: any,
//   b: any
// ):
//   | { valid: true; data: any }
//   | { valid: false; mergeErrorPath: (string | number)[] } {
//   const aType = parse.getParsedType(a);
//   const bType = parse.getParsedType(b);

//   if (a === b) {
//     return { valid: true, data: a };
//   }
//   if (
//     aType === parse.ZodParsedType.object &&
//     bType === parse.ZodParsedType.object
//   ) {
//     const bKeys = util.objectKeys(b);
//     const sharedKeys = util
//       .objectKeys(a)
//       .filter((key) => bKeys.indexOf(key) !== -1);

//     const newObj: any = { ...a, ...b };
//     for (const key of sharedKeys) {
//       const sharedValue = mergeValues(a[key], b[key]);
//       if (!sharedValue.valid) {
//         return {
//           valid: false,
//           mergeErrorPath: [key, ...sharedValue.mergeErrorPath],
//         };
//       }
//       newObj[key] = sharedValue.data;
//     }

//     return { valid: true, data: newObj };
//   }
//   if (
//     aType === parse.ZodParsedType.array &&
//     bType === parse.ZodParsedType.array
//   ) {
//     if (a.length !== b.length) {
//       return { valid: false, mergeErrorPath: [] };
//     }

//     const newArray: unknown[] = [];
//     for (let index = 0; index < a.length; index++) {
//       const itemA = a[index];
//       const itemB = b[index];
//       const sharedValue = mergeValues(itemA, itemB);

//       if (!sharedValue.valid) {
//         return {
//           valid: false,
//           mergeErrorPath: [index, ...sharedValue.mergeErrorPath],
//         };
//       }

//       newArray.push(sharedValue.data);
//     }

//     return { valid: true, data: newArray };
//   }
//   if (
//     aType === parse.ZodParsedType.date &&
//     bType === parse.ZodParsedType.date &&
//     +a === +b
//   ) {
//     return { valid: true, data: a };
//   }
//   return { valid: false, mergeErrorPath: [] };
// }

// interface $ZodIntersectionDef<
//   A extends core.$ZodType = core.$ZodType,
//   B extends core.$ZodType = core.$ZodType,
// > extends ZodCoreTypeDef {
//   left: A;
//   right: B;
// }

// function handleIntersectionResults(
//   results: [parse.SyncParseReturnType, parse.SyncParseReturnType]
// ): parse.SyncParseReturnType {
//   const [parsedLeft, parsedRight] = results;
//   let fail!: parse.$ZodFailure;
//   if (parse.failed(parsedLeft)) {
//     fail = parsedLeft;
//   }

//   if (parse.failed(parsedRight)) {
//     fail = fail || new parse.$ZodFailure();
//     fail.mergeIn(parsedRight);
//   }

//   if (fail) return fail;

//   const merged = mergeValues(parsedLeft, parsedRight);
//   if (!merged.valid) {
//     throw new Error(
//       `Unmergable intersection types at ${merged.mergeErrorPath.join(".")}: ${parse.getParsedType(parsedLeft)} and ${parse.getParsedType(parsedRight)}`
//     );
//   }

//   return merged.data;
// }

// export class ZodCoreIntersection<
//   A extends core.$ZodType = core.$ZodType,
//   B extends core.$ZodType = core.$ZodType,
// > extends ZodCoreType<
//   A["~output"] & B["~output"],
//   core.input<A> & core.input<B>,
//   $ZodIntersectionDef<A, B>
// > {
//   type = "intersection" as const;
//   elements: core.$ZodType[] = [this.left, this.right];

//   _parseInput(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     const resultLeft = this.left._parse(input, ctx);
//     const resultRight = this.right._parse(input, ctx);
//     const async =
//       resultLeft instanceof Promise || resultRight instanceof Promise;
//     return async
//       ? Promise.all([resultLeft, resultRight]).then(handleIntersectionResults)
//       : handleIntersectionResults([resultLeft, resultRight]);
//   }
// }

// /////////////////////////////////////////
// /////////////////////////////////////////
// //////////                     //////////
// //////////      $ZodTuple      //////////
// //////////                     //////////
// /////////////////////////////////////////
// /////////////////////////////////////////

// export interface $ZodTupleDef<
//   Items extends core.$ZodType[] = core.$ZodType[],
//   Rest extends core.$ZodType | null = null,
// > extends ZodCoreTypeDef {
//   prefixItems: Items;
//   items: Rest;
// }

// type ZodTupleItems = core.$ZodType[];
// type TupleOutputType<
//   T extends ZodTupleItems,
//   Rest extends core.$ZodType | null,
// > = [
//   ...{
//     [k in keyof T]: T[k]["~output"];
//   },
//   ...(Rest extends core.$ZodType ? Rest["~output"][] : []),
// ];
// // type a1 = OutputTypeOfTuple<
// //   [$ZodString<string, string, ZodCoreStringDef>, $ZodNumber<number, number>],
// //   $ZodString<string, string, ZodCoreStringDef>
// // >;
// // type a2 = OutputTypeOfTuple<[], $ZodString<string, string, ZodCoreStringDef>>;
// type TupleInputType<
//   T extends ZodTupleItems,
//   Rest extends core.$ZodType | null,
// > = [
//   ...{
//     [k in keyof T]: T[k]["~input"];
//   },
//   ...(Rest extends core.$ZodType ? Rest["~input"][] : []),
// ];

// function handleTupleResults(results: unknown[]): parse.SyncParseReturnType {
//   let fail!: parse.$ZodFailure;
//   for (const i in results) {
//     const result = results[i];
//     if (parse.failed(result)) {
//       fail = fail || new parse.$ZodFailure();
//       fail.mergeIn(result, i);
//     }
//   }
//   return fail ?? results;
// }

// export class ZodCoreTuple<
//   T extends ZodTupleItems = ZodTupleItems,
//   Rest extends core.$ZodType | null = null,
// > extends ZodCoreType<
//   TupleOutputType<T, Rest>,
//   TupleInputType<T, Rest>,
//   $ZodTupleDef<T, Rest>
// > {
//   override type = "array" as const;

//   _parseInput(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     if (!Array.isArray(input)) {
//       return parse.$ZodFailure.from(
//         [
//           {
//             input,
//             code: "invalid_type",
//             expected: "array",
//             received: parse.getParsedType(input),
//           },
//         ],
//         ctx,
//         this
//       );
//     }

//     if (!this.items && input.length !== this.prefixItems.length) {
//       const tooBig = input.length !== this.prefixItems.length;
//       return parse.$ZodFailure.from(
//         [
//           {
//             input,
//             code: "invalid_size",
//             ...(tooBig
//               ? { received: "too_big", maximum: this.prefixItems.length }
//               : { received: "too_small", minimum: this.prefixItems.length }),
//             domain: "array",
//           },
//         ],
//         ctx,
//         this
//       );
//     }

//     let async = false;

//     const results: any[] = Array(input.length);
//     for (const i in this.prefixItems) {
//       const prefixItem = this.prefixItems[i];
//       results[i] = prefixItem._parse(input[i], ctx);
//       if (results[i] instanceof Promise) async = true;
//     }
//     if (this.items) {
//       const rest = input.slice(this.prefixItems.length);
//       for (const el of rest) {
//         const result = this.items._parse(el, ctx);
//         results.push(result);
//         if (result instanceof Promise) async = true;
//       }
//     }

//     if (!async) return handleTupleResults(results) as this["~output"];
//     return Promise.all(results).then(handleTupleResults) as Promise<
//       this["~output"]
//     >;
//   }
// }

// // //////////////////////////////////////////
// // //////////////////////////////////////////
// // //////////                      //////////
// // //////////      $ZodRecord      //////////
// // //////////                      //////////
// // //////////////////////////////////////////
// // //////////////////////////////////////////

// interface $HasValues extends core.$ZodType<PropertyKey, PropertyKey> {
//   "~values": Set<PropertyKey>;
// }

// interface $HasPattern extends core.$ZodType<PropertyKey, PropertyKey> {
//   "~pattern": RegExp;
// }
// type $ZodRecordKey = $HasValues | $HasPattern;
// interface $ZodRecordDef<
//   K extends $ZodRecordKey = $ZodRecordKey,
//   V extends core.$ZodType = core.$ZodType,
// > extends $ZodObjectDef<Record<core.input<K>, V>> {
//   keySchema: K;
//   valueSchema: V;
// }
// // export type KeySchema = $HasValues | $HasPattern;
// export type RecordType<K extends string | number | symbol, V> = [
//   string,
// ] extends [K]
//   ? Record<K, V>
//   : [number] extends [K]
//     ? Record<K, V>
//     : [symbol] extends [K]
//       ? Record<K, V>
//       : [BRAND<string | number | symbol>] extends [K]
//         ? Record<K, V>
//         : Partial<Record<K, V>>;

// export class ZodCoreRecord<
//   Key extends $ZodRecordKey = $ZodRecordKey,
//   Value extends core.$ZodType = core.$ZodType,
// > extends $ZodObject<
//   RecordType<Key["~output"], Value["~output"]>,
//   RecordType<core.input<Key>, core.input<Value>>,
//   $ZodRecordDef<Key, Value>
// > {
//   constructor(def: $ZodRecordDef<Key, Value>) {
//     const props: any = {};
//     if ("~values" in def.keySchema) {
//       for (const key of def.keySchema["~values"]) {
//         props[key] = def.valueSchema;
//       }
//     } else {
//       props[`/${def.keySchema["~pattern"].source}/`] = def.valueSchema;
//     }
//     def.properties = props;
//     super(def);
//   }
// }

// export function record<Key extends $ZodRecordKey, Value extends core.$ZodType>(
//   keySchema: Key,
//   valueSchema: Value
// ): $ZodRecord<Key, Value> {
//   return new $ZodRecord({
//     keySchema,
//     valueSchema,
//     properties: {} as any,
//     checks: [],
//   });
// }

// ///////////////////////////////////////
// ///////////////////////////////////////
// //////////                   //////////
// //////////      $ZodMap      //////////
// //////////                   //////////
// ///////////////////////////////////////
// ///////////////////////////////////////
// interface $ZodMapDef<
//   Key extends core.$ZodType = core.$ZodType,
//   Value extends core.$ZodType = core.$ZodType,
// > extends ZodCoreTypeDef {
//   keyType: Key;
//   valueType: Value;
// }

// function handleMapResults(
//   results: [parse.SyncParseReturnType, parse.SyncParseReturnType][]
// ): parse.SyncParseReturnType {
//   let fail!: parse.$ZodFailure;
//   for (const [keyResult, valueResult] of results) {
//     if (parse.failed(keyResult)) {
//       fail = fail || new parse.$ZodFailure();
//       fail.mergeIn(keyResult);
//     }
//     if (parse.failed(valueResult)) {
//       fail = fail || new parse.$ZodFailure();
//       fail.mergeIn(valueResult);
//     }
//   }
//   return fail ?? results;
// }
// export class ZodCoreMap<
//   Key extends core.$ZodType = core.$ZodType,
//   Value extends core.$ZodType = core.$ZodType,
// > extends ZodCoreType<
//   Map<Key["~output"], Value["~output"]>,
//   Map<core.input<Key>, core.input<Value>>,
//   $ZodMapDef<Key, Value>
// > {
//   keys: Key;
//   values: Value;

//   type = "map" as const;
//   protected override _parseInput(
//     input: unknown,
//     ctx?: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     if (!(input instanceof Map)) {
//       return parse.$ZodFailure.from(
//         [
//           {
//             input,
//             code: "invalid_type",
//             expected: "map",
//             received: parse.getParsedType(input),
//           },
//         ],
//         ctx,
//         this
//       );
//     }

//     let async = false;
//     const mapResults: [Key["~output"], Value["~output"]][] = [];

//     for (const [k, v] of input.entries()) {
//       const keyResult = this.keyType._parse(k, ctx);
//       const valueResult = this.valueType._parse(v, ctx);
//       if (keyResult instanceof Promise || valueResult instanceof Promise) {
//         async = true;
//         mapResults.push(Promise.all([keyResult, valueResult]) as any);
//         continue;
//       }
//       mapResults.push([keyResult, valueResult]);
//     }

//     if (async)
//       return Promise.all(mapResults).then(handleMapResults) as Promise<
//         this["~output"]
//       >;
//     return handleMapResults(mapResults) as this["~output"];
//   }
// }

// // ///////////////////////////////////////
// // ///////////////////////////////////////
// // //////////                   //////////
// // //////////      $ZodSet      //////////
// // //////////                   //////////
// // ///////////////////////////////////////
// // ///////////////////////////////////////
// // export class ZodCoreSet<Value extends $ZodType = $ZodType> extends ZodCoreType<
// //   Set<Value["~output"]>,
// //   Set<core.input<Value>>
// // > {
// //   override typeName: $ZodFirstPartyTypeKind.ZodSet;
// //   valueType: Value;
// //   minSize: { value: number; message?: string } | null;
// //   maxSize: { value: number; message?: string } | null;
// //   constructor(_def: core.$Def<$ZodSet>) {
// //     super(_def);
// //   }
// //   "~parse"(
// //     input: unknown,
// //     ctx: parse.ParseContext
// //   ): parse.ParseReturnType<this["~output"]> {
// //     const parsedType = parse.getParsedType(input);
// //     if (parsedType !== parse.ZodParsedType.set) {
// //       return new parse.ZodFailure([
// //         {
// //           input,
// //           code: err.ZodIssueCode.invalid_type,
// //           expected: parse.ZodParsedType.set,
// //           received: parsedType,
// //         },
// //       ]);
// //     }

// //     const issues: err.ZodIssueData[] = [];

// //     if (this.minSize !== null) {
// //       if (input.size < this.minSize.value) {
// //         issues.push({
// //           input,
// //           code: err.ZodIssueCode.too_small,
// //           minimum: this.minSize.value,
// //           type: "set",
// //           inclusive: true,
// //           exact: false,
// //           message: this.minSize.message,
// //         });
// //       }
// //     }

// //     if (this.maxSize !== null) {
// //       if (input.size > this.maxSize.value) {
// //         issues.push({
// //           input,
// //           code: err.ZodIssueCode.too_big,
// //           maximum: this.maxSize.value,
// //           type: "set",
// //           inclusive: true,
// //           exact: false,
// //           message: this.maxSize.message,
// //         });
// //       }
// //     }

// //     const valueType = this.valueType;

// //     function finalizeSet(elements: parse.SyncParseReturnType<any>[]) {
// //       const parsedSet = new Set();
// //       for (let i = 0; i < elements.length; i++) {
// //         const element = elements[i];
// //         if (parse.failed(element)) {
// //           issues.push(
// //             ...element.issues.map((issue) => ({
// //               ...issue,
// //               path: [i, ...(issue.path || [])],
// //             }))
// //           );
// //         } else {
// //           parsedSet.add(element);
// //         }
// //       }

// //       if (issues.length) {
// //         return new parse.ZodFailure(issues);
// //       }

// //       return parsedSet;
// //     }

// //     let hasPromises = false;

// //     const elements = [...(input as Set<unknown>).values()].map((item) => {
// //       const result = valueType["~parse"](item, ctx);
// //       if (result instanceof Promise) {
// //         hasPromises = true;
// //       }
// //       return result;
// //     });

// //     if (hasPromises) {
// //       return Promise.all(elements).then(finalizeSet);
// //     }
// //     return finalizeSet(elements as parse.SyncParseReturnType[]);
// //   }

// //   min(minSize: number, message?: types.ErrMessage): this {
// //     return new $ZodSet({
// //       ...this,
// //       minSize: { value: minSize, message: util.errToString(message) },
// //     }) as any;
// //   }

// //   max(maxSize: number, message?: types.ErrMessage): this {
// //     return new $ZodSet({
// //       ...this,
// //       maxSize: { value: maxSize, message: util.errToString(message) },
// //     }) as any;
// //   }

// //   size(size: number, message?: types.ErrMessage): this {
// //     return this.min(size, message).max(size, message) as any;
// //   }

// //   nonempty(message?: types.ErrMessage): $ZodSet<Value> {
// //     return this.min(1, message) as any;
// //   }

// //   static create<Value extends $ZodType = $ZodType>(
// //     valueType: Value,
// //     params?: RawCreateParams
// //   ): $ZodSet<Value> {
// //     return new $ZodSet({
// //       valueType,
// //       minSize: null,
// //       maxSize: null,
// //       typeName: $ZodFirstPartyTypeKind.ZodSet,
// //       checks: [],
// //       ...processCreateParams(params),
// //     });
// //   }
// // }

// // ////////////////////////////////////////////
// // ////////////////////////////////////////////
// // //////////                        //////////
// // //////////      $ZodFunction      //////////
// // //////////                        //////////
// // ////////////////////////////////////////////
// // ////////////////////////////////////////////

// // export type OuterTypeOfFunction<
// //   Args extends $ZodTuple,
// //   Returns extends $ZodType,
// // > = core.input<Args> extends Array<any>
// //   ? (...args: core.input<Args>) => Returns["~output"]
// //   : never;

// // export type InnerTypeOfFunction<
// //   Args extends $ZodTuple,
// //   Returns extends $ZodType,
// // > = Args["~output"] extends Array<any>
// //   ? (...args: Args["~output"]) => core.input<Returns>
// //   : never;

// // export class ZodCoreFunction<
// //   Args extends $ZodTuple = $ZodTuple,
// //   Returns extends $ZodType = $ZodType,
// // > extends ZodCoreType<
// //   OuterTypeOfFunction<Args, Returns>,
// //   InnerTypeOfFunction<Args, Returns>
// // > {
// //   override typeName: $ZodFirstPartyTypeKind.ZodFunction;
// //   args: Args;
// //   returns: Returns;
// //   constructor(_def: core.$Def<$ZodFunction>) {
// //     super(_def);
// //   }
// //   "~parse"(
// //     input: unknown,
// //     ctx: parse.ParseContext
// //   ): parse.ParseReturnType<any> {
// //     const parsedType = parse.getParsedType(input);
// //     if (parsedType !== parse.ZodParsedType.function) {
// //       return new parse.ZodFailure([
// //         {
// //           input,
// //           code: err.ZodIssueCode.invalid_type,
// //           expected: parse.ZodParsedType.function,
// //           received: parsedType,
// //         },
// //       ]);
// //     }

// //     function makeArgsIssue(args: any, error: err.ZodError): err.ZodIssue {
// //       return err.makeIssue(
// //         {
// //           input: args,
// //           code: err.ZodIssueCode.invalid_arguments,
// //           argumentsError: error,
// //         },
// //         ctx
// //       );
// //     }

// //     function makeReturnsIssue(returns: any, error: err.ZodError): err.ZodIssue {
// //       return err.makeIssue(
// //         {
// //           input: returns,
// //           code: err.ZodIssueCode.invalid_return_type,
// //           returnTypeError: error,
// //         },
// //         ctx
// //       );
// //     }

// //     const params = { errorMap: ctx.contextualErrorMap };
// //     const fn = input;

// //     if (this.returns instanceof $ZodPromise) {
// //       // Would love a way to avoid disabling this rule, but we need
// //       // an alias (using an arrow function was what caused 2651).
// //       const me = this;
// //       return async function (this: any, ...args: any[]) {
// //         const error = new err.ZodError([]);
// //         const parsedArgs = await me._def.args
// //           .parseAsync(args, params)
// //           .catch((e) => {
// //             error.addIssue(makeArgsIssue(args, e));
// //             throw error;
// //           });
// //         const result = await Reflect.apply(fn, this, parsedArgs as any);
// //         const parsedReturns = await (
// //           me._def.returns as unknown as $ZodPromise<$ZodType>
// //         )._def.type
// //           .parseAsync(result, params)
// //           .catch((e) => {
// //             error.addIssue(makeReturnsIssue(result, e));
// //             throw error;
// //           });
// //         return parsedReturns;
// //       };
// //     }
// //     // Would love a way to avoid disabling this rule, but we need
// //     // an alias (using an arrow function was what caused 2651).
// //     const me = this;
// //     return function (this: any, ...args: any[]) {
// //       const parsedArgs = me._def.args.safeParse(args, params);
// //       if (!parsedArgs.success) {
// //         throw new err.ZodError([makeArgsIssue(args, parsedArgs.error)]);
// //       }
// //       const result = Reflect.apply(fn, this, parsedArgs.data);
// //       const parsedReturns = me._def.returns.safeParse(result, params);
// //       if (!parsedReturns.success) {
// //         throw new err.ZodError([makeReturnsIssue(result, parsedReturns.error)]);
// //       }
// //       return parsedReturns.data;
// //     } as any;
// //   }

// //   parameters(): Args {
// //     return this.args;
// //   }

// //   returnType(): Returns {
// //     return this.returns;
// //   }

// //   implement<F extends InnerTypeOfFunction<Args, Returns>>(
// //     func: F
// //   ): ReturnType<F> extends Returns["~output"]
// //     ? (...args: core.input<Args>) => ReturnType<F>
// //     : OuterTypeOfFunction<Args, Returns> {
// //     const validatedFunc = this.parse(func);
// //     return validatedFunc as any;
// //   }

// //   strictImplement(
// //     func: InnerTypeOfFunction<Args, Returns>
// //   ): InnerTypeOfFunction<Args, Returns> {
// //     const validatedFunc = this.parse(func);
// //     return validatedFunc as any;
// //   }

// //   validate: (typeof this)["implement"] = this.implement;

// //   static create(): $ZodFunction<$ZodTuple<[], $ZodUnknown>, $ZodUnknown>;
// //   static create<T extends Any$ZodTuple = $ZodTuple<[], $ZodUnknown>>(
// //     args: T
// //   ): $ZodFunction<T, $ZodUnknown>;
// //   static create<T extends Any$ZodTuple, U extends $ZodType>(
// //     args: T,
// //     returns: U
// //   ): $ZodFunction<T, U>;
// //   static create<
// //     T extends Any$ZodTuple = $ZodTuple<[], $ZodUnknown>,
// //     U extends $ZodType = $ZodUnknown,
// //   >(args: T, returns: U, params?: RawCreateParams): $ZodFunction<T, U>;
// //   static create(
// //     args?: Any$ZodTuple,
// //     returns?: $ZodType,
// //     params?: RawCreateParams
// //   ) {
// //     return new $ZodFunction({
// //       args: (args
// //         ? args
// //         : $ZodTuple.create([]).rest(ZodUnknown.create())) as any,
// //       returns: returns || $ZodUnknown.create(),
// //       typeName: $ZodFirstPartyTypeKind.ZodFunction,
// //       checks: [],
// //       ...processCreateParams(params),
// //     }) as any;
// //   }
// // }

// // ////////////////////////////////////////
// // ////////////////////////////////////////
// // //////////                    //////////
// // //////////      $ZodLazy      //////////
// // //////////                    //////////
// // ////////////////////////////////////////
// // ////////////////////////////////////////
// // export class ZodCoreLazy<T extends $ZodType = $ZodType> extends ZodCoreType<
// //   core.output<T>,
// //   core.input<T>
// // > {
// //   override typeName: $ZodFirstPartyTypeKind.ZodLazy;
// //   getter: () => T;
// //   constructor(_def: core.$Def<$ZodLazy>) {
// //     super(_def);
// //   }
// //   get schema(): T {
// //     return this.getter();
// //   }

// //   "~parse"(
// //     input: unknown,
// //     ctx: parse.ParseContext
// //   ): parse.ParseReturnType<this["~output"]> {
// //     const lazySchema = this.getter();
// //     return lazySchema["~parse"](input, ctx);
// //   }

// //   static create<T extends $ZodType>(
// //     getter: () => T,
// //     params?: RawCreateParams
// //   ): $ZodLazy<T> {
// //     return new $ZodLazy({
// //       getter: getter,
// //       typeName: $ZodFirstPartyTypeKind.ZodLazy,
// //       checks: [],
// //       ...processCreateParams(params),
// //     });
// //   }
// // }

// ///////////////////////////////////////////
// ///////////////////////////////////////////
// //////////                       //////////
// //////////      $ZodLiteral      //////////
// //////////                       //////////
// ///////////////////////////////////////////
// ///////////////////////////////////////////
// interface $ZodLiteralDef<T> extends ZodCoreTypeDef {
//   schema: core.$ZodType<T, T>;
//   value: T;
// }
// export class ZodCoreLiteral<
//   O extends types.Primitive = types.Primitive,
//   I extends types.Primitive = types.Primitive,
//   D extends $ZodLiteralDef<O> = $ZodLiteralDef<O>,
// > extends ZodCoreType<O, I, D> {
//   schema: core.$ZodType;
//   value: unknown;

//   type = "literal" as const;
//   override "~values": Set<D["value"]> = new Set([this.value]);
//   _parseInput(
//     input: unknown,
//     ctx: parse.ParseContext
//   ): parse.ParseReturnType<this["~output"]> {
//     if (input !== this.value) {
//       return parse.$ZodFailure.from(
//         [
//           {
//             input,
//             code: "invalid_type",
//             expected: "literal",
//             literalValues: [this.value],
//           },
//         ],
//         ctx,
//         this
//       );
//     }
//     return input as this["~output"];
//   }
// }

// // ////////////////////////////////////////
// // ////////////////////////////////////////
// // //////////                    //////////
// // //////////      $ZodEnum      //////////
// // //////////                    //////////
// // ////////////////////////////////////////
// // ////////////////////////////////////////
// // export type ArrayKeys = keyof any[];
// // export type Indices<T> = Exclude<keyof T, ArrayKeys>;

// // export type EnumValues<T extends string = string> = readonly [T, ...T[]];

// // export type Values<T extends EnumValues> = {
// //   [k in T[number]]: k;
// // };

// // export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

// // export type FilterEnum<Values, ToExclude> = Values extends []
// //   ? []
// //   : Values extends [infer Head, ...infer Rest]
// //     ? Head extends ToExclude
// //       ? FilterEnum<Rest, ToExclude>
// //       : [Head, ...FilterEnum<Rest, ToExclude>]
// //     : never;

// // export type typecast<A, T> = A extends T ? A : never;

// // export class ZodCoreEnum<
// //   T extends [string, ...string[]] = [string, ...string[]],
// // > extends ZodCoreType<T[number], T[number]> {
// //   override typeName: $ZodFirstPartyTypeKind.ZodEnum;
// //   values: T;
// //   constructor(_def: core.$Def<$ZodEnum>) {
// //     super(_def);
// //   }
// //   #cache: Set<T[number]> | undefined;

// //   "~parse"(
// //     input: unknown,
// //     _ctx: parse.ParseContext
// //   ): parse.ParseReturnType<this["~output"]> {
// //     if (typeof input !== "string") {
// //       const parsedType = parse.getParsedType(input);
// //       const expectedValues = this.values;
// //       return new parse.ZodFailure([
// //         {
// //           input,
// //           expected: core.joinValues(expectedValues) as "string",
// //           received: parsedType,
// //           code: err.ZodIssueCode.invalid_type,
// //         },
// //       ]);
// //     }

// //     if (!this.#cache) {
// //       this.#cache = new Set(this.values);
// //     }

// //     if (!this.#cache.has(input)) {
// //       const expectedValues = this.values;

// //       return new parse.ZodFailure([
// //         {
// //           input,
// //           received: input,
// //           code: err.ZodIssueCode.invalid_enum_value,
// //           options: expectedValues,
// //         },
// //       ]);
// //     }

// //     return input;
// //   }

// //   get options(): T {
// //     return this.values;
// //   }

// //   get enum(): Values<T> {
// //     const enumValues: any = {};
// //     for (const val of this.values) {
// //       enumValues[val] = val;
// //     }
// //     return enumValues as any;
// //   }

// //   get Values(): Values<T> {
// //     const enumValues: any = {};
// //     for (const val of this.values) {
// //       enumValues[val] = val;
// //     }
// //     return enumValues as any;
// //   }

// //   get Enum(): Values<T> {
// //     const enumValues: any = {};
// //     for (const val of this.values) {
// //       enumValues[val] = val;
// //     }
// //     return enumValues as any;
// //   }

// //   extract<ToExtract extends readonly [T[number], ...T[number][]]>(
// //     values: ToExtract,
// //     newDef: RawCreateParams = this
// //   ): $ZodEnum<Writeable<ToExtract>> {
// //     return $ZodEnum.create(values, {
// //       ...this,
// //       ...newDef,
// //     }) as any;
// //   }

// //   exclude<ToExclude extends readonly [T[number], ...T[number][]]>(
// //     values: ToExclude,
// //     newDef: RawCreateParams = this
// //   ): $ZodEnum<
// //     typecast<Writeable<FilterEnum<T, ToExclude[number]>>, [string, ...string[]]>
// //   > {
// //     return $ZodEnum.create(
// //       this.options.filter((opt) => !values.includes(opt)) as FilterEnum<
// //         T,
// //         ToExclude[number]
// //       >,
// //       {
// //         ...this,
// //         ...newDef,
// //       }
// //     ) as any;
// //   }

// //   static create<U extends string, T extends Readonly<[U, ...U[]]>>(
// //     values: T,
// //     params?: RawCreateParams
// //   ): $ZodEnum<Writeable<T>>;
// //   static create<U extends string, T extends [U, ...U[]]>(
// //     values: T,
// //     params?: RawCreateParams
// //   ): $ZodEnum<T>;
// //   static create(values: [string, ...string[]], params?: RawCreateParams) {
// //     return new $ZodEnum({
// //       values,
// //       typeName: $ZodFirstPartyTypeKind.ZodEnum,
// //       checks: [],
// //       ...processCreateParams(params),
// //     });
// //   }
// // }

// // //////////////////////////////////////////////
// // //////////////////////////////////////////////
// // //////////                          //////////
// // //////////      $ZodNativeEnum      //////////
// // //////////                          //////////
// // //////////////////////////////////////////////
// // //////////////////////////////////////////////
// // export type EnumLike = { [k: string]: string | number; [nu: number]: string };

// // export class ZodCoreNativeEnum<
// //   T extends EnumLike = EnumLike,
// // > extends ZodCoreType<T[keyof T], T[keyof T]> {
// //   override typeName: $ZodFirstPartyTypeKind.ZodNativeEnum;
// //   values: T;
// //   constructor(_def: core.$Def<$ZodNativeEnum>) {
// //     super(_def);
// //   }
// //   #cache: Set<T[keyof T]> | undefined;
// //   "~parse"(
// //     input: unknown,
// //     _ctx: parse.ParseContext
// //   ): parse.ParseReturnType<T[keyof T]> {
// //     const nativeEnumValues = util.getValidEnumValues(this.values);

// //     const parsedType = parse.getParsedType(input);
// //     if (
// //       parsedType !== parse.ZodParsedType.string &&
// //       parsedType !== parse.ZodParsedType.number
// //     ) {
// //       const expectedValues = util.objectValues(nativeEnumValues);
// //       return new parse.ZodFailure([
// //         {
// //           input,
// //           expected: core.joinValues(expectedValues) as "string",
// //           received: parsedType,
// //           code: err.ZodIssueCode.invalid_type,
// //         },
// //       ]);
// //     }

// //     if (!this.#cache) {
// //       this.#cache = new Set(util.getValidEnumValues(this.values));
// //     }

// //     if (!this.#cache.has(input)) {
// //       const expectedValues = util.objectValues(nativeEnumValues);

// //       return new parse.ZodFailure([
// //         {
// //           input,
// //           received: input,
// //           code: err.ZodIssueCode.invalid_enum_value,
// //           options: expectedValues,
// //         },
// //       ]);
// //     }

// //     return input as any;
// //   }

// //   get enum(): T {
// //     return this.values;
// //   }

// //   static create<T extends EnumLike>(
// //     values: T,
// //     params?: RawCreateParams
// //   ): $ZodNativeEnum<T> {
// //     return new $ZodNativeEnum({
// //       values: values,
// //       typeName: $ZodFirstPartyTypeKind.ZodNativeEnum,
// //       checks: [],
// //       ...processCreateParams(params),
// //     });
// //   }
// // }

// //////////////////////////////////////////
// //////////////////////////////////////////
// //////////                      //////////
// //////////      $ZodFile         //////////
// //////////                      //////////
// //////////////////////////////////////////
// //////////////////////////////////////////

// // interface $ZodFileDef extends ZodCoreTypeDef {}

// // export class ZodCoreFile<
// //   O extends File,
// //   I,
// //   D extends $ZodFileDef,
// // > extends ZodCoreType<O, I, D> {
// //   override type = "file" as const;
// //   __meta?: object & {};

// //   /** @deprecated Internal API, use with caution. */
// //   override _parseInput(
// //     input: unknown,
// //     ctx?: parse.ParseContext
// //   ): parse.ParseReturnType<this["~output"]> {
// //     if (input instanceof File) return input as this["~output"];

// //     return parse.$ZodFailure.from(
// //       [
// //         {
// //           code: "invalid_type",
// //           expected: "file",
// //           received: parse.getParsedType(input),
// //           input,
// //         },
// //       ],
// //       ctx
// //     );
// //   }
// // }

// // ///////////////////////////////////////////
// // ///////////////////////////////////////////
// // //////////                       //////////
// // //////////      $ZodPromise      //////////
// // //////////                       //////////
// // ///////////////////////////////////////////
// // ///////////////////////////////////////////
// // export class ZodCorePromise<T extends $ZodType = $ZodType> extends ZodCoreType<
// //   Promise<T["~output"]>,
// //   Promise<core.input<T>>
// // > {
// //   type: T;
// //   override typeName: $ZodFirstPartyTypeKind.ZodPromise;
// //   constructor(_def: core.$Def<$ZodPromise>) {
// //     super(_def);
// //   }
// //   unwrap(): T {
// //     return this.type;
// //   }

// //   "~parse"(
// //     input: unknown,
// //     ctx: parse.ParseContext
// //   ): parse.ParseReturnType<this["~output"]> {
// //     const parsedType = parse.getParsedType(input);

// //     if (parsedType !== parse.ZodParsedType.promise) {
// //       return new parse.ZodFailure([
// //         {
// //           input,
// //           code: err.ZodIssueCode.invalid_type,
// //           expected: parse.ZodParsedType.promise,
// //           received: parsedType,
// //         },
// //       ]);
// //     }

// //     return input.then((inner: any) => {
// //       return this.type["~parse"](inner, ctx);
// //     });
// //   }

// //   static create<T extends $ZodType>(
// //     schema: T,
// //     params?: RawCreateParams
// //   ): $ZodPromise<T> {
// //     return new $ZodPromise({
// //       type: schema,
// //       typeName: $ZodFirstPartyTypeKind.ZodPromise,
// //       checks: [],
// //       ...processCreateParams(params),
// //     });
// //   }
// // }

// // //////////////////////////////////////////////
// // //////////////////////////////////////////////
// // //////////                          //////////
// // //////////        $ZodEffects        //////////
// // //////////                          //////////
// // //////////////////////////////////////////////
// // //////////////////////////////////////////////

// // export type Refinement<T> = (arg: T, ctx: $RefinementCtx) => any;
// // export type SuperRefinement<T> = (
// //   arg: T,
// //   ctx: $RefinementCtx
// // ) => void | Promise<void>;

// // export type RefinementEffect<T> = {
// //   type: "refinement";
// //   refinement: (arg: T, ctx: $RefinementCtx) => any;
// // };
// // export type TransformEffect<T> = {
// //   type: "transform";
// //   transform: (arg: T, ctx: $RefinementCtx) => any;
// // };
// // export type PreprocessEffect<T> = {
// //   type: "preprocess";
// //   transform: (arg: T, ctx: $RefinementCtx) => any;
// // };
// // export type Effect<T> =
// //   | RefinementEffect<T>
// //   | TransformEffect<T>
// //   | PreprocessEffect<T>;

// // export class ZodCoreEffects<
// //   T extends $ZodType = $ZodType,
// //   Output = core.output<T>,
// //   Input = core.input<T>,
// // > extends ZodCoreType<Output, Input> {
// //   schema: T;
// //   override typeName: $ZodFirstPartyTypeKind.ZodEffects;
// //   effect: Effect<any>;
// //   constructor(_def: core.$Def<$ZodEffects>) {
// //     super(_def);
// //   }
// //   innerType(): T {
// //     return this.schema;
// //   }

// //   sourceType(): T {
// //     return this.schema._def.typeName === $ZodFirstPartyTypeKind.ZodEffects
// //       ? (this.schema as unknown as $ZodEffects<T>).sourceType()
// //       : (this.schema as T);
// //   }

// //   "~parse"(
// //     input: unknown,
// //     ctx: parse.ParseContext
// //   ): parse.ParseReturnType<this["~output"]> {
// //     const effect = this.effect || null;

// //     const issues: err.ZodIssueData[] = [];

// //     const checkCtx: $RefinementCtx = {
// //       addIssue: (arg: err.ZodIssueData) => {
// //         issues.push(arg);
// //       },
// //     };

// //     checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);

// //     if (effect.type === "preprocess") {
// //       const processed = effect.transform(input, checkCtx);

// //       if (processed instanceof Promise) {
// //         return processed.then((processed) => {
// //           if (issues.some((i) => i.fatal)) {
// //             return new parse.ZodFailure(issues);
// //           }
// //           const result = this.schema["~parse"](processed, ctx);
// //           if (result instanceof Promise) {
// //             return result.then((r) => {
// //               if (parse.failed(r)) {
// //                 issues.push(...r.issues);
// //               }
// //               if (issues.length) return new parse.ZodFailure(issues);
// //               return r;
// //             });
// //           }

// //           if (parse.failed(result)) {
// //             issues.push(...result.issues);
// //             return new parse.ZodFailure(issues);
// //           }

// //           return issues.length ? new parse.ZodFailure(issues) : result;
// //         }) as any;
// //       }
// //       if (issues.some((i) => i.fatal)) {
// //         return new parse.ZodFailure(issues);
// //       }
// //       const result = this.schema["~parse"](processed, ctx);

// //       if (result instanceof Promise) {
// //         return result.then((r) => {
// //           if (parse.failed(r)) {
// //             issues.push(...r.issues);
// //           }
// //           if (issues.length) return new parse.ZodFailure(issues);
// //           return r;
// //         });
// //       }

// //       if (parse.failed(result)) {
// //         issues.push(...result.issues);
// //         return new parse.ZodFailure(issues);
// //       }

// //       return issues.length ? new parse.ZodFailure(issues) : (result as any);
// //     }

// //     if (effect.type === "refinement") {
// //       const executeRefinement = (acc: unknown): any => {
// //         const result = effect.refinement(acc, checkCtx);
// //         if (result instanceof Promise) {
// //           return Promise.resolve(result);
// //         }
// //         return acc;
// //       };

// //       const inner = this.schema["~parse"](input, ctx);

// //       if (!(inner instanceof Promise)) {
// //         if (parse.failed(inner)) {
// //           issues.push(...inner.issues);
// //         }

// //         const value = parse.failed(inner)
// //           ? inner.value !== symbols.NOT_SET
// //             ? inner.value
// //             : input // if valid, use parsed value
// //           : inner;
// //         // else, check parse.ZodFailure for `.value` (set after transforms)
// //         // then fall back to original input
// //         if (issues.some((i) => i.fatal)) {
// //           return new parse.ZodFailure(issues, value);
// //         }

// //         // return value is ignored
// //         const executed = executeRefinement(value);

// //         if (executed instanceof Promise) {
// //           return executed.then(() => {
// //             if (issues.length) return new parse.ZodFailure(issues, inner);
// //             return inner;
// //           }) as any;
// //         }

// //         if (issues.length) return new parse.ZodFailure(issues, inner);
// //         return inner as any;
// //       }
// //       return inner.then((inner) => {
// //         if (parse.failed(inner)) {
// //           issues.push(...inner.issues);
// //         }

// //         if (issues.some((i) => i.fatal)) {
// //           return new parse.ZodFailure(issues, inner);
// //         }

// //         const value = parse.failed(inner)
// //           ? inner.value !== symbols.NOT_SET
// //             ? inner.value
// //             : input // if valid, use parsed value
// //           : inner;

// //         const executed = executeRefinement(value);

// //         if (executed instanceof Promise) {
// //           return executed.then(() => {
// //             if (issues.length) return new parse.ZodFailure(issues, inner);
// //             return inner;
// //           });
// //         }

// //         if (issues.length) return new parse.ZodFailure(issues, inner);
// //         return inner;
// //       });
// //     }

// //     if (effect.type === "transform") {
// //       const inner = this.schema["~parse"](input, ctx);
// //       if (!(inner instanceof Promise)) {
// //         if (parse.failed(inner)) {
// //           issues.push(...inner.issues);
// //         }

// //         // do not execute transform if any issues exist
// //         if (issues.length) return new parse.ZodFailure(issues);

// //         const value = parse.failed(inner)
// //           ? inner.value === symbols.NOT_SET
// //             ? input
// //             : inner.value
// //           : inner;

// //         const result = effect.transform(value, checkCtx);
// //         if (result instanceof Promise) {
// //           return result.then((result) => {
// //             if (issues.length) return new parse.ZodFailure(issues, result);
// //             return result;
// //           });
// //         }

// //         if (issues.length) return new parse.ZodFailure(issues, result);
// //         return result;
// //       }
// //       return inner.then((inner) => {
// //         if (parse.failed(inner)) {
// //           issues.push(...inner.issues);
// //         }

// //         if (issues.length) return new parse.ZodFailure(issues, inner);

// //         const value = parse.failed(inner)
// //           ? inner.value === symbols.NOT_SET
// //             ? input
// //             : inner.value
// //           : inner;

// //         const result = effect.transform(value, checkCtx);

// //         if (result instanceof Promise) {
// //           return result.then((result) => {
// //             if (issues.length) return new parse.ZodFailure(issues, result);
// //             return result;
// //           });
// //         }

// //         if (issues.length) return new parse.ZodFailure(issues, result);
// //         return result;
// //       });
// //     }

// //     util.assertNever(effect);
// //   }

// //   static create<I extends $ZodType>(
// //     schema: I,
// //     effect: Effect<I["~output"]>,
// //     params?: RawCreateParams
// //   ): $ZodEffects<I, I["~output"]> {
// //     return new $ZodEffects({
// //       schema,
// //       typeName: $ZodFirstPartyTypeKind.ZodEffects,
// //       effect,
// //       checks: [],
// //       ...processCreateParams(params),
// //     });
// //   }

// //   static createWithPreprocess<I extends $ZodType>(
// //     preprocess: (arg: unknown, ctx: $RefinementCtx) => unknown,
// //     schema: I,
// //     params?: RawCreateParams
// //   ): $ZodEffects<I, I["~output"], unknown> {
// //     return new $ZodEffects({
// //       schema,
// //       effect: { type: "preprocess", transform: preprocess },
// //       typeName: $ZodFirstPartyTypeKind.ZodEffects,
// //       checks: [],
// //       ...processCreateParams(params),
// //     });
// //   }
// // }

// // export { $ZodEffects as $ZodTransformer };

// // ////////////////////////////////////////////
// // ////////////////////////////////////////////
// // //////////                        //////////
// // //////////      $ZodOptional      //////////
// // //////////                        //////////
// // ////////////////////////////////////////////
// // ////////////////////////////////////////////
// // export type $ZodOptionalType<T extends $ZodType> = $ZodOptional<T>;

// // export class ZodCoreOptional<T extends $ZodType = $ZodType> extends ZodCoreType<
// //   T["~output"] | undefined,
// //   core.input<T> | undefined
// // > {
// //   override typeName: $ZodFirstPartyTypeKind.ZodOptional;
// //   innerType: T;
// //   constructor(_def: core.$Def<$ZodOptional>) {
// //     super(_def);
// //   }
// //   "~parse"(
// //     input: unknown,
// //     ctx: parse.ParseContext
// //   ): parse.ParseReturnType<this["~output"]> {
// //     const parsedType = parse.getParsedType(input);
// //     if (parsedType === parse.ZodParsedType.undefined) {
// //       return undefined;
// //     }
// //     return this.innerType["~parse"](input, ctx);
// //   }

// //   unwrap(): T {
// //     return this.innerType;
// //   }

// //   static create<T extends $ZodType>(
// //     type: T,
// //     params?: RawCreateParams
// //   ): $ZodOptional<T> {
// //     return new $ZodOptional({
// //       innerType: type,
// //       typeName: $ZodFirstPartyTypeKind.ZodOptional,
// //       checks: [],
// //       ...processCreateParams(params),
// //     }) as any;
// //   }
// // }

// // ////////////////////////////////////////////
// // ////////////////////////////////////////////
// // //////////                        //////////
// // //////////      $ZodNullable      //////////
// // //////////                        //////////
// // ////////////////////////////////////////////
// // ////////////////////////////////////////////
// // export type $ZodNullableType<T extends $ZodType> = $ZodNullable<T>;

// // type adjklf = core.$Def<$ZodNullable>;
// // export class ZodCoreNullable<T extends $ZodType = $ZodType> extends ZodCoreType<
// //   T["~output"] | null,
// //   core.input<T> | null
// // > {
// //   override typeName: $ZodFirstPartyTypeKind.ZodNullable;
// //   innerType: T;
// //   constructor(_def: core.$Def<$ZodNullable>) {
// //     super(_def);
// //   }
// //   "~parse"(
// //     input: unknown,
// //     ctx: parse.ParseContext
// //   ): parse.ParseReturnType<this["~output"]> {
// //     const parsedType = parse.getParsedType(input);
// //     if (parsedType === parse.ZodParsedType.null) {
// //       return null;
// //     }

// //     return this.innerType["~parse"](input, ctx);
// //   }

// //   unwrap(): T {
// //     return this.innerType;
// //   }

// //   static create<T extends $ZodType>(
// //     type: T,
// //     params?: RawCreateParams
// //   ): $ZodNullable<T> {
// //     return new $ZodNullable({
// //       innerType: type,
// //       typeName: $ZodFirstPartyTypeKind.ZodNullable,
// //       checks: [],
// //       ...processCreateParams(params),
// //     }) as any;
// //   }
// // }

// // ////////////////////////////////////////////
// // ////////////////////////////////////////////
// // //////////                        //////////
// // //////////       $ZodDefault       //////////
// // //////////                        //////////
// // ////////////////////////////////////////////
// // ////////////////////////////////////////////
// // export class ZodCoreDefault<T extends $ZodType = $ZodType> extends ZodCoreType<
// //   types.noUndefined<T["~output"]>,
// //   core.input<T> | undefined
// // > {
// //   override typeName: $ZodFirstPartyTypeKind.ZodDefault;
// //   innerType: T;
// //   defaultValue: () => types.noUndefined<core.input<T>>;
// //   constructor(_def: core.$Def<$ZodDefault>) {
// //     super(_def);
// //   }
// //   "~parse"(
// //     input: unknown,
// //     ctx: parse.ParseContext
// //   ): parse.ParseReturnType<this["~output"]> {
// //     const parsedType = parse.getParsedType(input);
// //     if (parsedType === parse.ZodParsedType.undefined) {
// //       input = this.defaultValue();
// //     }
// //     this.def;
// //     return this.innerType["~parse"](input, ctx) as any;
// //   }

// //   removeDefault(): T {
// //     return this.innerType;
// //   }

// //   static create<T extends $ZodType>(
// //     type: T,
// //     params: RawCreateParams & {
// //       default: core.input<T> | (() => types.noUndefined<core.input<T>>);
// //     }
// //   ): $ZodDefault<T> {
// //     return new $ZodDefault({
// //       innerType: type,
// //       typeName: $ZodFirstPartyTypeKind.ZodDefault,
// //       defaultValue:
// //         typeof params.default === "function"
// //           ? params.default
// //           : ((() => params.default) as any),
// //       checks: [],
// //       ...processCreateParams(params),
// //     }) as any;
// //   }
// // }

// // //////////////////////////////////////////
// // //////////////////////////////////////////
// // //////////                      //////////
// // //////////       $ZodCatch       //////////
// // //////////                      //////////
// // //////////////////////////////////////////
// // //////////////////////////////////////////
// // export class ZodCoreCatch<T extends $ZodType = $ZodType> extends ZodCoreType<
// //   T["~output"],
// //   unknown // any input will pass validation // core.input<T>
// // > {
// //   override typeName: $ZodFirstPartyTypeKind.ZodCatch;
// //   innerType: T;
// //   catchValue: (ctx: { error: err.ZodError; input: unknown }) => core.input<T>;
// //   constructor(_def: core.$Def<$ZodCatch>) {
// //     super(_def);
// //   }
// //   "~parse"(
// //     input: unknown,
// //     ctx: parse.ParseContext
// //   ): parse.ParseReturnType<this["~output"]> {
// //     const result = this.innerType["~parse"](input, ctx);

// //     if (parse.isAsync(result)) {
// //       return result.then((result) => {
// //         return {
// //           status: "valid",
// //           value: parse.failed(result)
// //             ? this.catchValue({
// //                 get error() {
// //                   return new err.ZodError(
// //                     result.issues.map((issue) => err.makeIssue(issue, ctx))
// //                   );
// //                 },
// //                 input,
// //               })
// //             : result,
// //         };
// //       });
// //     }
// //     return parse.failed(result)
// //       ? this.catchValue({
// //           get error() {
// //             return new err.ZodError(
// //               result.issues.map((issue) => err.makeIssue(issue, ctx))
// //             );
// //           },
// //           input,
// //         })
// //       : result;
// //   }

// //   removeCatch(): T {
// //     return this.innerType;
// //   }

// //   static create<T extends $ZodType>(
// //     type: T,
// //     params: RawCreateParams & {
// //       catch: T["~output"] | (() => T["~output"]);
// //     }
// //   ): $ZodCatch<T> {
// //     return new $ZodCatch({
// //       innerType: type,
// //       typeName: $ZodFirstPartyTypeKind.ZodCatch,
// //       catchValue:
// //         typeof params.catch === "function"
// //           ? params.catch
// //           : ((() => params.catch) as any),
// //       checks: [],
// //       ...processCreateParams(params),
// //     });
// //   }
// // }

// // //////////////////////////////////////////
// // //////////////////////////////////////////
// // //////////                      //////////
// // //////////      $ZodNaN         //////////
// // //////////                      //////////
// // //////////////////////////////////////////
// // //////////////////////////////////////////
// // export class ZodCoreNaN extends core.$ZodType<number, number> {
// //   override typeName: $ZodFirstPartyTypeKind.ZodNaN;
// //   constructor(_def: core.$Def<$ZodNaN>) {
// //     super(_def);
// //   }
// //   "~parse"(
// //     input: unknown,
// //     _ctx: parse.ParseContext
// //   ): parse.ParseReturnType<any> {
// //     const parsedType = parse.getParsedType(input);
// //     if (parsedType !== parse.ZodParsedType.nan) {
// //       return new parse.ZodFailure([
// //         {
// //           input,
// //           code: err.ZodIssueCode.invalid_type,
// //           expected: parse.ZodParsedType.nan,
// //           received: parsedType,
// //         },
// //       ]);
// //     }

// //     return input;
// //   }

// //   static create(params?: RawCreateParams): $ZodNaN {
// //     return new $ZodNaN({
// //       typeName: $ZodFirstPartyTypeKind.ZodNaN,
// //       checks: [],
// //       ...processCreateParams(params),
// //     });
// //   }
// // }

// // ///////////////////////////////////////////
// // ///////////////////////////////////////////
// // //////////                       //////////
// // //////////      $ZodBranded      //////////
// // //////////                       //////////
// // ///////////////////////////////////////////
// // ///////////////////////////////////////////
// export const BRAND: unique symbol = Symbol("zod_brand");
// export type BRAND<T extends string | number | symbol> = {
//   [BRAND]: { [k in T]: true };
// };

// // export class ZodCoreBranded<
// //   T extends $ZodType = $ZodType,
// //   B extends string | number | symbol = string | number | symbol,
// // > extends ZodCoreType<T["~output"] & BRAND<B>, core.input<T>> {
// //   override typeName: $ZodFirstPartyTypeKind.ZodBranded;
// //   type: T;
// //   constructor(_def: core.$Def<$ZodBranded>) {
// //     super(_def);
// //   }
// //   "~parse"(
// //     input: unknown,
// //     ctx: parse.ParseContext
// //   ): parse.ParseReturnType<any> {
// //     return this.type["~parse"](input, ctx);
// //   }

// //   unwrap(): T {
// //     return this.type;
// //   }
// // }

// // /////////////////////////////////////////////
// // /////////////////////////////////////////////
// // //////////                         //////////
// // //////////      $ZodPipeline       //////////
// // //////////                         //////////
// // /////////////////////////////////////////////
// // /////////////////////////////////////////////
// // export class ZodCorePipeline<
// //   A extends $ZodType = $ZodType,
// //   B extends $ZodType = $ZodType,
// // > extends ZodCoreType<B["~output"], core.input<A>> {
// //   override typeName: $ZodFirstPartyTypeKind.ZodPipeline;
// //   in: A;
// //   out: B;
// //   constructor(_def: core.$Def<$ZodPipeline>) {
// //     super(_def);
// //   }
// //   "~parse"(
// //     input: unknown,
// //     ctx: parse.ParseContext
// //   ): parse.ParseReturnType<any> {
// //     const result = this.in["~parse"](input, ctx);
// //     if (result instanceof Promise) {
// //       return result.then((inResult) => {
// //         if (parse.failed(inResult)) return inResult;

// //         return this.out["~parse"](inResult, ctx);
// //       });
// //     }
// //     if (parse.failed(result)) return result;

// //     return this.out["~parse"](result, ctx);
// //   }

// //   static create<A extends $ZodType, B extends $ZodType>(
// //     a: A,
// //     b: B
// //   ): $ZodPipeline<A, B> {
// //     return new $ZodPipeline({
// //       in: a,
// //       out: b,
// //       typeName: $ZodFirstPartyTypeKind.ZodPipeline,
// //     });
// //   }
// // }

// // ////////////////////////////////////////////
// // ////////////////////////////////////////////
// // //////////                        //////////
// // //////////      $ZodReadonly      //////////
// // //////////                        //////////
// // ////////////////////////////////////////////
// // ////////////////////////////////////////////
// // type BuiltIn =
// //   | (((...args: any[]) => any) | (new (...args: any[]) => any))
// //   | { readonly [Symbol.toStringTag]: string }
// //   | Date
// //   | Error
// //   | Generator
// //   | Promise<unknown>
// //   | RegExp;

// // type MakeReadonly<T> = T extends Map<infer K, infer V>
// //   ? ReadonlyMap<K, V>
// //   : T extends Set<infer V>
// //     ? ReadonlySet<V>
// //     : T extends [infer Head, ...infer Tail]
// //       ? readonly [Head, ...Tail]
// //       : T extends Array<infer V>
// //         ? ReadonlyArray<V>
// //         : T extends BuiltIn
// //           ? T
// //           : Readonly<T>;

// // export class ZodCoreReadonly<T extends $ZodType = $ZodType> extends ZodCoreType<
// //   MakeReadonly<T["~output"]>,
// //   MakeReadonly<core.input<T>>
// // > {
// //   override typeName: $ZodFirstPartyTypeKind.ZodReadonly;
// //   innerType: T;
// //   constructor(_def: core.$Def<$ZodReadonly>) {
// //     super(_def);
// //   }
// //   "~parse"(
// //     input: unknown,
// //     ctx: parse.ParseContext
// //   ): parse.ParseReturnType<this["~output"]> {
// //     const result = this.innerType["~parse"](input, ctx);
// //     const freeze = (data: unknown) => {
// //       if (parse.isValid(data)) {
// //         data = Object.freeze(data) as any;
// //       }
// //       return data;
// //     };
// //     return parse.isAsync(result)
// //       ? result.then((data) => freeze(data))
// //       : (freeze(result) as any);
// //   }

// //   static create<T extends $ZodType>(
// //     type: T,
// //     params?: RawCreateParams
// //   ): $ZodReadonly<T> {
// //     return new $ZodReadonly({
// //       innerType: type,
// //       typeName: $ZodFirstPartyTypeKind.ZodReadonly,
// //       checks: [],
// //       ...processCreateParams(params),
// //     }) as any;
// //   }

// //   unwrap(): T {
// //     return this.innerType;
// //   }
// // }

// // //////////////////////////////////////////
// // //////////////////////////////////////////
// // //////////                      //////////
// // //////////  $ZodTemplateLiteral  //////////
// // //////////                      //////////
// // //////////////////////////////////////////
// // //////////////////////////////////////////

// // type TemplateLiteralPrimitive = string | number | boolean | null | undefined;

// // type TemplateLiteralInterpolatedPosition = $ZodType<
// //   TemplateLiteralPrimitive | bigint
// // >;
// // type TemplateLiteralPart =
// //   | TemplateLiteralPrimitive
// //   | TemplateLiteralInterpolatedPosition;

// // type appendToTemplateLiteral<
// //   Template extends string,
// //   Suffix extends TemplateLiteralPrimitive | $ZodType,
// // > = Suffix extends TemplateLiteralPrimitive
// //   ? `${Template}${Suffix}`
// //   : Suffix extends $ZodOptional<infer UnderlyingType>
// //     ? Template | appendToTemplateLiteral<Template, UnderlyingType>
// //     : Suffix extends $ZodBranded<infer UnderlyingType, any>
// //       ? appendToTemplateLiteral<Template, UnderlyingType>
// //       : Suffix extends core.$ZodType<infer Output, any>
// //         ? Output extends TemplateLiteralPrimitive | bigint
// //           ? `${Template}${Output}`
// //           : never
// //         : never;

// // type partsToTemplateLiteral<Parts extends TemplateLiteralPart[]> =
// //   [] extends Parts
// //     ? ``
// //     : Parts extends [
// //           ...infer Rest extends TemplateLiteralPart[],
// //           infer Last extends TemplateLiteralPart,
// //         ]
// //       ? appendToTemplateLiteral<partsToTemplateLiteral<Rest>, Last>
// //       : never;

// // export class ZodCoreTemplateLiteral<
// //   Template extends string = "",
// // > extends ZodCoreType<Template, Template> {
// //   override typeName: $ZodFirstPartyTypeKind.ZodTemplateLiteral;
// //   coerce: boolean;
// //   parts: readonly TemplateLiteralPart[];
// //   regexString: string;
// //   constructor(_def: core.$Def<$ZodTemplateLiteral>) {
// //     super(_def);
// //   }
// //   interpolated<I extends TemplateLiteralInterpolatedPosition>(
// //     type: Exclude<
// //       I,
// //       $ZodNever | $ZodNaN | $ZodPipeline<any, any> | $ZodLazy<any>
// //     >
// //   ): $ZodTemplateLiteral<appendToTemplateLiteral<Template, I>> {
// //     // TODO: check for invalid types at runtime
// //     return this._addPart(type) as any;
// //   }

// //   literal<L extends TemplateLiteralPrimitive>(
// //     literal: L
// //   ): $ZodTemplateLiteral<appendToTemplateLiteral<Template, L>> {
// //     return this._addPart(literal) as any;
// //   }

// //   "~parse"(
// //     input: unknown,
// //     _ctx: parse.ParseContext
// //   ): parse.ParseReturnType<Template> {
// //     if (this.def.coerce) {
// //       input = String(input);
// //     }

// //     const parsedType = parse.getParsedType(input);

// //     if (parsedType !== parse.ZodParsedType.string) {
// //       return new parse.ZodFailure([
// //         {
// //           input,
// //           code: err.ZodIssueCode.invalid_type,
// //           expected: parse.ZodParsedType.string,
// //           received: parsedType,
// //         },
// //       ]);
// //     }

// //     if (!new RegExp(this.regexString).test(input)) {
// //       return new parse.ZodFailure([
// //         {
// //           input,
// //           code: err.ZodIssueCode.custom,
// //           message: `String does not match template literal`,
// //         },
// //       ]);
// //     }

// //     return input;
// //   }

// //   protected _addParts(parts: TemplateLiteralPart[]): $ZodTemplateLiteral {
// //     let r = this.regexString;
// //     for (const part of parts) {
// //       r = this._appendToRegexString(r, part);
// //     }
// //     return new $ZodTemplateLiteral({
// //       ...this,
// //       parts: [...this.parts, ...parts],
// //       regexString: r,
// //     });
// //   }

// //   protected _addPart(
// //     part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
// //   ): $ZodTemplateLiteral {
// //     const parts = [...this.parts, part];

// //     return new $ZodTemplateLiteral({
// //       ...this,
// //       parts,
// //       regexString: this._appendToRegexString(this.regexString, part),
// //     });
// //   }

// //   protected _appendToRegexString(
// //     regexString: string,
// //     part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
// //   ): string {
// //     return `^${this._unwrapRegExp(
// //       regexString
// //     )}${this._transformPartToRegexString(part)}$`;
// //   }

// //   protected _transformPartToRegexString(
// //     part: TemplateLiteralPrimitive | TemplateLiteralInterpolatedPosition
// //   ): string {
// //     if (!(part instanceof core.$ZodType)) {
// //       return this._escapeRegExp(part);
// //     }

// //     if (part instanceof $ZodLiteral) {
// //       return this._escapeRegExp(part._def.value);
// //     }

// //     if (part instanceof $ZodString) {
// //       return this._transformZodStringPartToRegexString(part);
// //     }

// //     if (part instanceof $ZodEnum || part instanceof $ZodNativeEnum) {
// //       const values =
// //         part instanceof $ZodEnum
// //           ? part._def.values
// //           : util.getValidEnumValues(part._def.values);

// //       return `(${values.map(this._escapeRegExp).join("|")})`;
// //     }

// //     if (part instanceof $ZodUnion) {
// //       return `(${(part._def.options as any[])
// //         .map((option) => this._transformPartToRegexString(option))
// //         .join("|")})`;
// //     }

// //     if (part instanceof $ZodNumber) {
// //       return this._transformZodNumberPartToRegexString(part);
// //     }

// //     if (part instanceof $ZodOptional) {
// //       return `(${this._transformPartToRegexString(part.unwrap())})?`;
// //     }

// //     if (part instanceof $ZodTemplateLiteral) {
// //       return this._unwrapRegExp(part._def.regexString);
// //     }

// //     if (part instanceof $ZodBigInt) {
// //       // FIXME: include/exclude '-' based on min/max values after https://github.com/colinhacks/zod/pull/1711 is merged.
// //       return "\\-?\\d+";
// //     }

// //     if (part instanceof $ZodBoolean) {
// //       return "(true|false)";
// //     }

// //     if (part instanceof $ZodNullable) {
// //       do {
// //         part = part.unwrap();
// //       } while (part instanceof $ZodNullable);

// //       return `(${this._transformPartToRegexString(part)}|null)${
// //         part instanceof $ZodOptional ? "?" : ""
// //       }`;
// //     }

// //     if (part instanceof $ZodBranded) {
// //       return this._transformPartToRegexString(part.unwrap());
// //     }

// //     if (part instanceof $ZodAny) {
// //       return ".*";
// //     }

// //     if (part instanceof $ZodNull) {
// //       return "null";
// //     }

// //     if (part instanceof $ZodUndefined) {
// //       return "undefined";
// //     }

// //     throw new err.ZodTemplateLiteralUnsupportedTypeError();
// //   }

// //   // FIXME: we don't support transformations, so `.trim()` is not supported.
// //   protected _transformZodStringPartToRegexString(part: $ZodString): string {
// //     let maxLength = Number.POSITIVE_INFINITY;
// //     let minLength = 0;
// //     let endsWith = "";
// //     let startsWith = "";

// //     for (const ch of part._def.checks) {
// //       const regex = this._resolveRegexForStringCheck(ch);

// //       if (regex) {
// //         return this._unwrapRegExp(regex);
// //       }

// //       if (ch.kind === "endsWith") {
// //         endsWith = ch.value;
// //       } else if (ch.kind === "length") {
// //         minLength = maxLength = ch.value;
// //       } else if (ch.kind === "max") {
// //         maxLength = Math.max(0, Math.min(maxLength, ch.value));
// //       } else if (ch.kind === "min") {
// //         minLength = Math.max(minLength, ch.value);
// //       } else if (ch.kind === "startsWith") {
// //         startsWith = ch.value;
// //       } else {
// //         throw new err.ZodTemplateLiteralUnsupportedCheckError(
// //           $ZodFirstPartyTypeKind.ZodString,
// //           ch.kind
// //         );
// //       }
// //     }

// //     const constrainedMinLength = Math.max(
// //       0,
// //       minLength - startsWith.length - endsWith.length
// //     );
// //     const constrainedMaxLength = Number.isFinite(maxLength)
// //       ? Math.max(0, maxLength - startsWith.length - endsWith.length)
// //       : Number.POSITIVE_INFINITY;

// //     if (
// //       constrainedMaxLength === 0 ||
// //       constrainedMinLength > constrainedMaxLength
// //     ) {
// //       return `${startsWith}${endsWith}`;
// //     }

// //     return `${startsWith}.${this._resolveRegexWildcardLength(
// //       constrainedMinLength,
// //       constrainedMaxLength
// //     )}${endsWith}`;
// //   }

// //   protected _resolveRegexForStringCheck(check: $ZodStringCheck): RegExp | null {
// //     return {
// //       [check.kind]: null,
// //       cuid: cuidRegex,
// //       cuid2: cuid2Regex,
// //       datetime: check.kind === "datetime" ? datetimeRegex(check) : null,
// //       email: emailRegex,
// //       ip:
// //         check.kind === "ip"
// //           ? {
// //               any: new RegExp(
// //                 `^(${this._unwrapRegExp(
// //                   ipv4Regex.source
// //                 )})|(${this._unwrapRegExp(ipv6Regex.source)})$`
// //               ),
// //               v4: ipv4Regex,
// //               v6: ipv6Regex,
// //             }[check.version || "any"]
// //           : null,
// //       regex: check.kind === "regex" ? check.regex : null,
// //       ulid: ulidRegex,
// //       uuid: uuidRegex,
// //     }[check.kind];
// //   }

// //   protected _resolveRegexWildcardLength(
// //     minLength: number,
// //     maxLength: number
// //   ): string {
// //     if (minLength === maxLength) {
// //       return minLength === 1 ? "" : `{${minLength}}`;
// //     }

// //     if (maxLength !== Number.POSITIVE_INFINITY) {
// //       return `{${minLength},${maxLength}}`;
// //     }

// //     if (minLength === 0) {
// //       return "*";
// //     }

// //     if (minLength === 1) {
// //       return "+";
// //     }

// //     return `{${minLength},}`;
// //   }

// //   // FIXME: we do not support exponent notation (e.g. 2e5) since it conflicts with `.int()`.
// //   protected _transformZodNumberPartToRegexString(part: $ZodNumber): string {
// //     let canBeNegative = true;
// //     let canBePositive = true;
// //     let min = Number.NEGATIVE_INFINITY;
// //     let max = Number.POSITIVE_INFINITY;
// //     let canBeZero = true;
// //     let finite = false;
// //     let isInt = false;
// //     let acc = "";

// //     for (const ch of part._def.checks) {
// //       if (ch.kind === "finite") {
// //         finite = true;
// //       } else if (ch.kind === "int") {
// //         isInt = true;
// //       } else if (ch.kind === "max") {
// //         max = Math.min(max, ch.value);

// //         if (ch.value <= 0) {
// //           canBePositive = false;

// //           if (ch.value === 0 && !ch.inclusive) {
// //             canBeZero = false;
// //           }
// //         }
// //       } else if (ch.kind === "min") {
// //         min = Math.max(min, ch.value);

// //         if (ch.value >= 0) {
// //           canBeNegative = false;

// //           if (ch.value === 0 && !ch.inclusive) {
// //             canBeZero = false;
// //           }
// //         }
// //       } else {
// //         throw new err.ZodTemplateLiteralUnsupportedCheckError(
// //           $ZodFirstPartyTypeKind.ZodNumber,
// //           ch.kind
// //         );
// //       }
// //     }

// //     if (Number.isFinite(min) && Number.isFinite(max)) {
// //       finite = true;
// //     }

// //     if (canBeNegative) {
// //       acc = `${acc}\\-`;

// //       if (canBePositive) {
// //         acc = `${acc}?`;
// //       }
// //     } else if (!canBePositive) {
// //       return "0+";
// //     }

// //     if (!finite) {
// //       acc = `${acc}(Infinity|(`;
// //     }

// //     if (!canBeZero) {
// //       if (!isInt) {
// //         acc = `${acc}((\\d*[1-9]\\d*(\\.\\d+)?)|(\\d+\\.\\d*[1-9]\\d*))`;
// //       } else {
// //         acc = `${acc}\\d*[1-9]\\d*`;
// //       }
// //     } else if (isInt) {
// //       acc = `${acc}\\d+`;
// //     } else {
// //       acc = `${acc}\\d+(\\.\\d+)?`;
// //     }

// //     if (!finite) {
// //       acc = `${acc}))`;
// //     }

// //     return acc;
// //   }

// //   protected _unwrapRegExp(regex: RegExp | string): string {
// //     const flags = typeof regex === "string" ? "" : regex.flags;
// //     const source = typeof regex === "string" ? regex : regex.source;

// //     if (flags.includes("i")) {
// //       return this._unwrapRegExp(this._makeRegexStringCaseInsensitive(source));
// //     }

// //     return source.replace(/(^\^)|(\$$)/g, "");
// //   }

// //   protected _makeRegexStringCaseInsensitive(regexString: string): string {
// //     const isAlphabetic = (char: string) => char.match(/[a-z]/i) != null;

// //     let caseInsensitive = "";
// //     let inCharacterSet = false;
// //     for (let i = 0; i < regexString.length; i++) {
// //       const char = regexString.charAt(i);
// //       const nextChar = regexString.charAt(i + 1);

// //       if (char === "\\") {
// //         caseInsensitive += `${char}${nextChar}`;
// //         i++;
// //         continue;
// //       }

// //       if (char === "[") {
// //         inCharacterSet = true;
// //       } else if (inCharacterSet && char === "]") {
// //         inCharacterSet = false;
// //       }

// //       if (!isAlphabetic(char)) {
// //         caseInsensitive += char;
// //         continue;
// //       }

// //       if (!inCharacterSet) {
// //         caseInsensitive += `[${char.toLowerCase()}${char.toUpperCase()}]`;
// //         continue;
// //       }

// //       const charAfterNext = regexString.charAt(i + 2);

// //       if (nextChar !== "-" || !isAlphabetic(charAfterNext)) {
// //         caseInsensitive += `${char.toLowerCase()}${char.toUpperCase()}`;
// //         continue;
// //       }

// //       caseInsensitive += `${char.toLowerCase()}-${charAfterNext.toLowerCase()}${char.toUpperCase()}-${charAfterNext.toUpperCase()}`;
// //       i += 2;
// //     }

// //     return caseInsensitive;
// //   }

// //   protected _escapeRegExp(str: unknown): string {
// //     if (typeof str !== "string") {
// //       str = `${str}`;
// //     }

// //     return (str as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// //   }

// //   static empty = (
// //     params?: RawCreateParams & { coerce?: true }
// //   ): $ZodTemplateLiteral => {
// //     return new $ZodTemplateLiteral({
// //       checks: [],
// //       ...processCreateParams(params),
// //       coerce: params?.coerce ?? false,
// //       parts: [],
// //       regexString: "^$",
// //       typeName: $ZodFirstPartyTypeKind.ZodTemplateLiteral,
// //     });
// //   };

// //   static create<
// //     Part extends TemplateLiteralPart,
// //     Parts extends [] | [Part, ...Part[]],
// //   >(
// //     parts: Parts,
// //     params?: RawCreateParams & { coerce?: true }
// //   ): $ZodTemplateLiteral<partsToTemplateLiteral<Parts>>;
// //   static create(
// //     parts: TemplateLiteralPart[],
// //     params?: RawCreateParams & { coerce?: true }
// //   ) {
// //     return $ZodTemplateLiteral.empty(params)._addParts(parts) as any;
// //   }
// // }

// // export enum $ZodFirstPartyTypeKind {
// //   ZodString = "ZodString",
// //   ZodNumber = "ZodNumber",
// //   ZodNaN = "ZodNaN",
// //   ZodBigInt = "ZodBigInt",
// //   ZodBoolean = "ZodBoolean",
// //   ZodDate = "ZodDate",
// //   ZodFile = "ZodFile",
// //   ZodSymbol = "ZodSymbol",
// //   ZodUndefined = "ZodUndefined",
// //   ZodNull = "ZodNull",
// //   ZodAny = "ZodAny",
// //   ZodUnknown = "ZodUnknown",
// //   ZodNever = "ZodNever",
// //   ZodVoid = "ZodVoid",
// //   ZodArray = "ZodArray",
// //   ZodObject = "ZodObject",
// //   ZodUnion = "ZodUnion",
// //   ZodDiscriminatedUnion = "ZodDiscriminatedUnion",
// //   ZodIntersection = "ZodIntersection",
// //   ZodTuple = "ZodTuple",
// //   ZodRecord = "ZodRecord",
// //   ZodMap = "ZodMap",
// //   ZodSet = "ZodSet",
// //   ZodFunction = "ZodFunction",
// //   ZodLazy = "ZodLazy",
// //   ZodLiteral = "ZodLiteral",
// //   ZodEnum = "ZodEnum",
// //   ZodEffects = "ZodEffects",
// //   ZodNativeEnum = "ZodNativeEnum",
// //   ZodOptional = "ZodOptional",
// //   ZodNullable = "ZodNullable",
// //   ZodDefault = "ZodDefault",
// //   ZodCatch = "ZodCatch",
// //   ZodPromise = "ZodPromise",
// //   ZodBranded = "ZodBranded",
// //   ZodPipeline = "ZodPipeline",
// //   ZodReadonly = "ZodReadonly",
// //   ZodTemplateLiteral = "ZodTemplateLiteral",
// // }

// // export type ZodFirstPartySchemaTypes =
// //   | $ZodString
// //   | $ZodNumber
// //   | $ZodNaN
// //   | $ZodBigInt
// //   | $ZodBoolean
// //   | $ZodDate
// //   | $ZodFile
// //   | $ZodUndefined
// //   | $ZodNull
// //   | $ZodAny
// //   | $ZodUnknown
// //   | $ZodNever
// //   | $ZodVoid
// //   | $ZodArray
// //   | $ZodObject
// //   | $ZodUnion
// //   | $ZodDiscriminatedUnion
// //   | $ZodIntersection
// //   | $ZodTuple
// //   | $ZodRecord
// //   | $ZodMap
// //   | $ZodSet
// //   | $ZodFunction
// //   | $ZodLazy
// //   | $ZodLiteral
// //   | $ZodEnum
// //   | $ZodEffects
// //   | $ZodNativeEnum
// //   | $ZodOptional
// //   | $ZodNullable
// //   | $ZodDefault
// //   | $ZodCatch
// //   | $ZodPromise
// //   | $ZodBranded
// //   | $ZodPipeline
// //   | $ZodReadonly
// //   | $ZodSymbol
// //   | $ZodTemplateLiteral;
