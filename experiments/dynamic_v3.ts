import type * as types from "../packages/zod-core/src/types.js";
export const InnerDynamicBase = class {
  constructor(properties: object) {
    Object.assign(this, properties);
  }
} as new <T extends object>(
  base: T
) => T;

/** @ts-expect-error (needed to extend `t`, but safe given ShallowClone's implementation) **/
export class DynamicBase<T extends object> extends InnerDynamicBase<T> {}

type $Def<T> = types.PickProps<StripInternals<T>>;
type StripInternals<T> = Pick<
  T,
  types.OmitString<keyof T, `~${string}` | `_${string}`>
>;

interface $ZodTypeDef {
  checks: any[];
  readonly description?: string;
  readonly errorMap?: any;
  "~output": unknown;
  "~input": unknown;
}

// type $ZodTypeExt = {
//   key?: string;
// };
type ExtractKeyType<T, K extends string> = T extends { [k in K]: infer U }
  ? U
  : T extends { [k in K]?: infer U }
    ? U
    : never;

////////////////////////////////////////////////
//////////        $ZodType        //////////////
////////////////////////////////////////////////
export abstract class $ZodType<
  Def extends $ZodTypeDef = $ZodTypeDef,
> extends DynamicBase<StripInternals<Def>> {
  "~input": "~input" extends keyof Def ? Def["~input"] : unknown;
  "~output": Def["~output"];
  abstract parse(): this["~output"];
}

////////////////////////////////////////////////
//////////        $ZodString        ////////////
////////////////////////////////////////////////
interface $ZodStringDef extends $ZodTypeDef {
  "~input": unknown;
  "~output": string;
  coerce: boolean;
}
class $ZodString<Def extends $ZodStringDef> extends $ZodType<Def> {
  parse(): this["~output"] {
    return "asdf";
  }
}
const $str = new $ZodString({
  checks: [],
  coerce: false,
});

////////////////////////////////////////////////
//////////        $ZodOptional        //////////
////////////////////////////////////////////////
interface $ZodOptionalDef<T extends $ZodType = $ZodType> extends $ZodTypeDef {
  "~input": T["~input"] | undefined;
  "~output": T["~output"] | undefined;
  element: T;
}
class $ZodOptional<D extends $ZodOptionalDef> extends $ZodType<D> {
  parse(): this["~output"] {
    return "asdf";
  }
}

////////////////////////////////////////////////
//////////        $ZodNullable        //////////
////////////////////////////////////////////////
interface $ZodNullableDef<T extends $ZodType = $ZodType> extends $ZodTypeDef {
  "~input": T["~input"] | undefined;
  "~output": T["~output"] | undefined;
  element: T;
}
class $ZodNullable<D extends $ZodNullableDef> extends $ZodType<D> {
  parse(): this["~output"] {
    return "asdf";
  }
}

/////////////////////////////////////////////
//////////        $ZodArray        //////////
/////////////////////////////////////////////
interface $ZodArrayDef<T extends $ZodType = $ZodType> extends $ZodTypeDef {
  "~input": T["~input"][];
  "~output": T["~output"][];
  element: T;
}
class $ZodArray<D extends $ZodArrayDef> extends $ZodType<D> {
  parse(): this["~output"] {
    return ["asdf"];
  }
}

////////////////////////////////////////////////
//////////        ZodType        ///////////////
////////////////////////////////////////////////
interface ZodTypeDef extends $ZodTypeDef {}
interface ZodType<O = unknown, D extends ZodTypeDef = ZodTypeDef, I = unknown>
  extends $ZodType {
  optional(): ZodOptional<this>;
  nullable(): ZodNullable<this>;
}
//  {
//   /** @deprecated Not deprecated, but for internal use only. */
//   readonly "{zod.type}": true;
//   optional(): ZodOptional<T>;
//   nullable(): ZodOptional<T>;
// }

// abstract class ZodType extends $ZodType<$ZodTypeDef & ZodTypeDef<ZodType>> {
//   parse(): this["~output"] {
//     return "asdf";
//   }
// }

////////////////////////////////////////////////
//////////        ZodString        /////////////
////////////////////////////////////////////////
interface ZodStringDef extends $ZodStringDef {
  // "~output": string;
  // optional: any;
  // nullable: any;
}
// interface ZodString extends ZodType {}

// @ts-ignore
class ZodString
  extends $ZodString<ZodStringDef>
  implements
    ZodType<ZodStringDef["~output"], ZodStringDef, ZodStringDef["~input"]>
{
  constructor(def: ZodStringDef) {
    super(def);
  }
  // optional(): ZodOptional<this> {
  //   throw new Error("Method not implemented.");
  // }
  // nullable(): ZodNullable<this> {
  //   throw new Error("Method not implemented.");
  // }
  /** @deprecated Not deprecated, but for internal use only. */
  readonly "{zod.string}": true;
}
declare const str: ZodString & { stuff: true };

// function ZodString() {}
// ZodString.prototype.sup = () => {
//   console.log("sup");
// };
// class ZodString extends $ZodType<ZodStringDef> {}

////////////////////////////////////////////////
//////////        ZodOptional        ///////////
////////////////////////////////////////////////
interface ZodOptionalDef<T extends ZodType = ZodType>
  extends $ZodOptionalDef<T>,
    ZodTypeDef {
  "~input": T["~input"] | undefined;
  "~output": T["~output"] | undefined;
}
class ZodOptional<T extends ZodType = ZodType>
  extends $ZodOptional<ZodOptionalDef<T>>
  implements
    ZodType<ZodOptionalDef["~output"], ZodOptionalDef, ZodOptionalDef["~input"]>
{
  optional(): ZodOptional<this> {
    throw new Error("Method not implemented.");
  }
  nullable(): ZodNullable<this> {
    throw new Error("Method not implemented.");
  }
}

////////////////////////////////////////////////
//////////        ZodNullable        ///////////
////////////////////////////////////////////////
interface ZodNullableDef<T extends ZodType = ZodType>
  extends $ZodNullableDef<T>,
    ZodTypeDef {
  "~input": T["~input"] | undefined;
  "~output": T["~output"] | undefined;
}
// @ts-ignore
class ZodNullable<T extends ZodType = ZodType>
  extends $ZodNullable<ZodNullableDef<T>>
  implements
    ZodType<
      ZodNullableDef["~output"],
      ZodNullableDef,
      ZodNullableDef["~input"]
    > {}
