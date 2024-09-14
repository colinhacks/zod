import * as core from "../index.js";

// type ClassType = { prototype: any; new (...args: string[]): any };
// function merge<A extends ClassType, B extends ClassType>(
//   a: A,
//   b: B
// ): {
//   new (
//     def: ConstructorParameters<A>[0] & ConstructorParameters<B>[0]
//   ): A["prototype"] & B["prototype"];
// } {
//   return class {
//     constructor(def: any) {
//       a.constructor.call(this, def);
//       b.constructor.call(this, def);
//     }
//   };

// export interface $ZodStringDef extends core.$ZodTypeDef {
//   typeName: "zod.core.string";
//   coerce: boolean;
// }

export class $ZodString extends core.$ZodType<string, string> {
  // override typeName: "zod.core.string";
  coerce: boolean;
  constructor(def: core.$Def<$ZodString>) {
    super(def);
  }
  // "~toJsonSchema"() {}
  "~parse"(
    input: core.ParseInput,
    _ctx?: core.ParseContext
  ): core.ParseReturnType<string> {
    if (this.coerce) {
      input = String(input) as string;
    }

    if (typeof input !== "string") {
      return new core.ZodFailure([
        {
          input,
          code: core.ZodIssueCode.invalid_type,
          expected: core.ZodParsedType.string,
          received: core.getParsedType(input),
        },
      ]);
    }

    return input;
  }
}

type $optional<T extends core.$ZodType> = { optional: T };
// interface ZodTypeDef extends core.$ZodTypeDef {}
// interface ZodType<
//   Output = unknown,
//   Def extends ZodTypeDef = ZodTypeDef,
//   Input = never,
// > extends core.$ZodType<Output, Input, Def> {
//   // "~inner": core.$ZodType;
//   refine(): $optional<this>;
// }
abstract class ZodType<out O = unknown, in I = never> extends core.$ZodType<
  O,
  I
> {
  // "zod.type" = true;
  // constructor(def: core.$Def<ZodType>) {
  //   super(def);
  // }
  abstract optional(): $optional<this>;
  abstract nullable(): $optional<this>;
  // "~parse"() {
  //   return {} as any;
  // }
  // prop: string;
  // "~toJsonSchema"() {}
  // "~parse"() {
  //   if (true as boolean) throw new Error("Method not implemented.");
  //   return {} as any;
  // }
}
// ZodType.prototype.prop = "ZODTYPE";
export abstract class _ZodType<
  // Output = unknown,
  // Def extends ZodTypeDef = ZodTypeDef,
  // Input = never,
  Inner extends core.$ZodType,
> {
  constructor(def: Inner) {
    this["~inner"] = def;
  }
  "~inner": Inner;
  // "~def": Inner["~def"];
  "~output": Inner["~output"];
  "~parse"(
    input: core.ParseInput,
    ctx?: core.ParseContext
  ): core.ParseReturnType<this["~output"]> {
    return this["~inner"]["~parse"](input, ctx) as any;
  }
}

// interface ZodStringDef extends $ZodStringDef {
//   // "~inner": $ZodString;
//   extra: string;
// }

// interface ZodType<O, D extends ZodTypeDef, I> extends core.$ZodType<O, I, D> {
//   "~output": O;
//   readonly "~input": core.$input<I>;
// }
// interface ZodTypeMethods extends core.$ZodType {
//   refine(): void;
//   optional(): this;
// }

// type A = ZodTypeMethods
// type _ZodString = $ZodString & ZodTypeMethods;
// type A = _ZodString["~input"];
// type B = $ZodString["~input"];

// interface Something {
//   prototype: core.$ZodType;
//   new (...args: any[]): core.$ZodType;
// }
// function decorate<Cls extends Something>(Cls: Cls) {
//   class Temp extends Cls {
//     constructor(...args: any[]) {
//       super(args[0]);
//     }
//     refine(arg: string): void {}
//   }
//   return Temp;
// }

// export interface ZodString extends _ZodString {}
// export interface ZodString
//   extends $ZodString,
//     ZodTypeMethods<string, ZodStringDef, string> {}
// interface AddMethods<T extends core.$ZodType> {
//   refine(): this["refine"];
// }

// function decorate(target) {
//   for (const key of Reflect.ownKeys(ZodType.prototype)) {
//     Reflect.defineProperty(
//       target.prototype,
//       key,
//       Reflect.getOwnPropertyDescriptor(ZodType.prototype, key)
//     );
//   }
// }

// interface ShittyMethods {
//   refine(...arg: any[]): any;
// }
// export interface ZodString extends ShittyMethods {
// Other methods and properties
// }

console.log(`================`);
type ClassType = { prototype: any; new (props: any): any };
function merge<A extends ClassType, B extends ClassType>(
  ClassA: A,
  ClassB: B
): {
  prototype: A["prototype"] & B["prototype"];
  new (
    def: ConstructorParameters<A>[0] & ConstructorParameters<B>[0]
  ): A["prototype"] & B["prototype"];
} {
  const cProto: any = {};
  let aProto = ClassA.prototype;
  while (aProto !== Object.prototype) {
    // console.log(Object.getOwnPropertyDescriptors(aProto));
    Object.defineProperties(cProto, Object.getOwnPropertyDescriptors(aProto));
    aProto = Object.getPrototypeOf(aProto);
  }

  let bProto = ClassB.prototype;
  while (bProto !== Object.prototype) {
    Object.defineProperties(cProto, Object.getOwnPropertyDescriptors(bProto));
    bProto = Object.getPrototypeOf(bProto);
  }

  delete cProto["constructor"];
  delete cProto["prototype"];
  cProto.prototype = Object.constructor;

  function C(this: any, def: any) {
    // console.log(def);
    const _a = new ClassA(def);
    const _b = new ClassB(def);
    Object.assign(this, _a);
    Object.assign(this, _b);
    // ClassA.constructor.bind(this)(def);
    // ClassB.constructor.bind(this)(def);
  }
  C.prototype = cProto;
  // cProto.constructor = C;
  return C as any;
}

// console.log(Object.getOwnPropertyDescriptors($ZodString.prototype));
type _ZodString = $ZodString & ZodType;
// {
//   optional(): $optional<this>;
// }
export interface ZodString extends $ZodString, ZodType {}
export class ZodString extends $ZodString {
  min(min: number) {
    const clone = this["~clone"]();
    clone.checks = [...clone.checks, { kind: "min", value: min } as any];
    return clone;
  }
}

// type lkjsdf = ZodString2['']
const str = new ZodString({
  checks: [],

  // "zod.type": true,
  // typeName: "zod.core.string",
  coerce: false,

  class: new Set(),
});

str["~toJsonSchema"];
console.log(str.min(5));
console.log(str.optional());
// console.log(str["~clone"]());
// console.log(str.checks);
// console.log(str.optional());
// export interface ZodString extends ZodType<ZodString> {}
// export class ZodString extends $ZodString {
//   // implements ZodType<ZodString>
//   // override "~def": ZodStringDef;
//   constructor(def: core.$Def<ZodString>) {
//     super(def);
//     // this.refine = zproto.refine.bind(this);
//   }
//   // Object.assign(this, {});
//   // refine = zproto.prototype.refine.bind(this);
//   // refine: ZodType<this>["refine"];
//   declare optional: ZodType<this>["optional"];
//   declare nullable: ZodType<this>["nullable"];
// }
// decorate(ZodString);
// assign ZodType methods to ZodString
// Object.assign(ZodString.prototype, zproto);

// const str = new $ZodString({
//   typeName: "zod.core.string",
//   coerce: false,
//   checks: [],
// });

// console.log(str["~parse"]("colin"));

// const str2 = new ZodString({
//   typeName: "zod.core.string",
//   coerce: false,
//   checks: [],
//   extra: "asdf",
// });

// console.log(str2["~parse"]("colin"));
// console.log(str2.optional());
// console.log(str2.nullable());
// console.log(str2.prop);

// const ZodBase = ZodType;

// const arrr = {} instanceof ZodType;
// // declare const arg: (input: string) => void = (input: string | number) => {};
// // declare const arg2: (input: string | number) => void = (input: string) => {};
// // type IsSubtypeOf<S, P> = S extends P ? true : false;
// // type arg2 = IsSubtypeOf<
// //   (input: string) => void,
// //   (input: string & { _tag: true }) => void
// // >;
