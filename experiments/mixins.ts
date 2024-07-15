type HasInstance = (instance: any) => boolean;
function checkSymbol(sym: string): (instance: any) => boolean {
  return (instance: any) => instance[sym] === true;
}
function attachTag(c: Constructor, sym: string): void {
  c[Symbol.hasInstance] = checkSymbol(sym);
  (c.prototype as any)[sym] = true;
}

// const $ZOD_TYPE: unique symbol = Symbol.for("{{$ZOD_TYPE}}");
// type $ZOD_TYPE = typeof $ZOD_TYPE;
export abstract class $ZodType<T = unknown> {
  _type: T;
  "{{zod_type_v4}}": true;

  abstract parse(data: unknown): this["_type"];
}
attachTag($ZodType, "{{zod_type_v4}}");

export class $ZodString extends $ZodType<string> {
  "{{ZOD_STRING}}": boolean;
  parse(data: unknown): this["_type"] {
    return "asdf";
  }
}
attachTag($ZodString, "$ZOD_STRING");

const ZOD_OPTIONAL: unique symbol = Symbol.for("{{ZOD_OPTIONAL}}");
type ZOD_OPTIONAL = typeof ZOD_OPTIONAL;
export interface $ZodOptional<T extends $ZodType> {
  [ZOD_OPTIONAL]: boolean;
}
export class $ZodOptional<T extends $ZodType> extends $ZodType<
  T["_type"] | undefined
> {
  "~~~": this["~~~"] & {
    [ZOD_OPTIONAL]: true;
  };
  // static [Symbol.hasInstance: unique symbol]: HasInstance = checkSymbol(ZOD_OPTIONAL) as HasInstance;
  constructor(public inner: T) {
    super();
  }
  // protected [ZOD_OPTIONAL]: boolean;
  parse(_data: unknown): T["_type"] | undefined {
    return "asdf";
  }
}
attachTag($ZodOptional, "ZOD_OPTIONAL");

// declare let x: $ZodOptional<$ZodString>;
// x[$ZOD_TYPE];

// type Constructor<T extends $ZodType> = new (...args: any[]) => T;
type Constructor = abstract new (...args: any[]) => $ZodType;
// const ZOD_TYPE = Symbol.for("{{ZOD_OPTIONAL}}");

const ZodStringMixin: ZodTypeMixed<typeof $ZodType> = ZodTypeMixin($ZodType);
export abstract class ZodType extends ZodStringMixin {
  constructor(..._args: any[]) {
    super();
  }
}
type ZodTypeMixed<T extends Constructor> = {
  new (...args: ConstructorParameters<T>): InstanceType<T> & ZodTypeMixin;
};
export function ZodTypeMixin<T extends Constructor>(
  SuperClass: T
): ZodTypeMixed<T> {
  abstract class $Temp extends SuperClass {
    protected "{{ZOD_OPTIONAL}}": true;
    static [Symbol.hasInstance]: HasInstance = checkSymbol("{{ZOD_OPTIONAL}}");
    // constructor(...args: any[]) {
    //   super(...args);
    // }
    optional() {
      return new $ZodOptional(this);
    }

    constant<T extends string>(val: T): $constant<this, T> {
      return this as any;
    }
    // parse(data: unknown): this["_type"] {
    //   throw new Error("Method not implemented.");
    // }
  }
  return $Temp as any;
}

interface ZodTypeMixin extends $ZodType {
  // optional(): ZodOptional<this>;
  constant<T extends string>(val: T): $constant<this, T>;
}

const ZOD_STRING: unique symbol = Symbol.for("{{ZOD_STRING}}");
type ZOD_STRING = typeof ZOD_STRING;
export const ZodStringBase: ZodTypeMixed<typeof $ZodString> =
  ZodTypeMixin($ZodString);
export class ZodString extends ZodStringBase {
  "~def": {
    [ZOD_STRING]: true;
  };
}
attachTag(ZodString, "$ZOD_STRING");

declare const t: ZodString;

// const asdf = ZodTypeMixin($ZodString);

const s0 = new $ZodString();
const v0 = s0.parse("asdf");
const s1 = new ZodString();
const v1 = s1.parse("asdf");
const s2 = s1.constant("sup");
s2._type;
const v2 = s2.parse("asdf");

s2.parse("asdf");
type $constant<T extends $ZodType, Value extends string> = T & {
  _type: Value;
};
