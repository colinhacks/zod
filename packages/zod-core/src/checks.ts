import type * as err from "./errors.js";
import { type $ZodFailure, getParsedType } from "./parse.js";

import type * as types from "./types.js";

export type $ZodCheckDef<
  T extends $ZodCheck,
  AlsoOmit extends string = never,
  Extra extends object = {},
> = types.flatten<Omit<types.PickProps<T>, "check" | AlsoOmit> & Extra>;

export interface $CheckCtx<T> {
  input: T;
  fail?: $ZodFailure | undefined;
  addIssue(
    issue: err.$ZodIssueData,
    schema?: { error?: err.$ZodErrorMap<never> | undefined }
  ): void;
}

export abstract class $ZodCheck<
  in In = never,
  out Out = In,
  Issues extends err.$ZodIssueBase = never,
> {
  abstract check: string;
  deps?: string[];
  message?: string | err.$ZodErrorMap<Issues> | undefined;
  constructor(def: object) {
    Object.assign(this, def);
  }

  // return T or ZodFailure
  // T cannot occur in signature to maintain contravariance
  abstract run(ctx: $CheckCtx<Out>): void;

  // alternative signature
  // return T or ZodFailure
  // returned value will override input
  // abstract run2: (ctx: In) => Out | ZodFailure;
}

/////////////////////////////////
/////    $ZodCheckEquals    /////
/////////////////////////////////
// export class $ZodCheckEquals<
//   T extends types.Numeric = types.Numeric,
// > extends $ZodCheck<T> {
//   override check = "equals" as const;
//   value!: types.Numeric;
//   constructor(def: $ZodCheckDef<$ZodCheckEquals>) {
//     super(def);
//   }
//   run(ctx: $CheckCtx<T>): void {
//     const type = getParsedType(ctx.input);
//     if (ctx.input !== this.value) {
//       ctx.addIssue({
//         code: "invalid_number",
//         expected: "==",
//         value: this.value,
//         input: ctx.input,
//       });
//     }
//   }
// }

//////////////////////////////////////
/////      $ZodCheckLessThan      /////
//////////////////////////////////////
export class $ZodCheckLessThan<
  T extends types.Numeric = types.Numeric,
> extends $ZodCheck<T> {
  override check = "less_than" as const;
  value!: T;
  inclusive!: boolean;

  constructor(def: $ZodCheckDef<$ZodCheckLessThan>) {
    super(def);
  }
  run(ctx: $CheckCtx<T>): void {
    if (this.inclusive ? this.value <= ctx.input : this.value < ctx.input) {
      ctx.addIssue({
        code: "invalid_number",
        expected: this.inclusive ? "less_than_or_equal" : "less_than",
        maximum: this.value,
        input: ctx.input,
      });
    }
  }
}

/////////////////////////////////////
/////    $ZodCheckGreaterThan    /////
/////////////////////////////////////
export class $ZodCheckGreaterThan<
  T extends types.Numeric = types.Numeric,
> extends $ZodCheck<T> {
  override check = "greater_than" as const;
  declare message?:
    | string
    | err.$ZodErrorMap<err.$ZodIssueGreaterThan>
    | undefined;
  value!: T;
  inclusive!: boolean;

  constructor(def: $ZodCheckDef<$ZodCheckGreaterThan>) {
    super(def);
  }

  run(ctx: $CheckCtx<T>): void {
    if (this.inclusive ? this.value > ctx.input : this.value >= ctx.input) {
      ctx.addIssue({
        code: "invalid_number",
        expected: this.inclusive ? "greater_than_or_equal" : "greater_than",
        minimum: this.value,
        input: ctx.input,
      });
    }
  }
}

/////////////////////////////////////////
/////    $ZodCheckMultipleOf    /////
/////////////////////////////////////////

// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
function floatSafeRemainder(val: number, step: number) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return (valInt % stepInt) / 10 ** decCount;
}
export class $ZodCheckMultipleOf<
  T extends number | bigint = number | bigint,
> extends $ZodCheck<T> {
  override check = "multiple_of" as const;
  value!: T;
  constructor(def: $ZodCheckDef<$ZodCheckMultipleOf>) {
    super(def);
  }
  run(ctx: $CheckCtx<T>): void {
    if (typeof ctx.input !== typeof this.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    // the casts are safe because we know the types are the same
    const isMultiple =
      typeof ctx.input === "bigint"
        ? ctx.input % (this.value as bigint) === BigInt(0)
        : floatSafeRemainder(ctx.input, this.value as number);

    if (!isMultiple) {
      ctx.addIssue({
        code: "invalid_number",
        expected: "multiple_of",
        value: this.value,
        input: ctx.input,
      });
    }
  }
}

// //////////////////////////////////////
// /////    $ZodCheckMaxSize    /////
// //////////////////////////////////////
export type $ZodSizable = string | Array<unknown> | Set<unknown> | File;

function getSize(input: any): {
  type: "string" | "array" | "set" | "file";
  size: number;
} {
  if (typeof input === "string") return { type: "string", size: input.length };
  if (Array.isArray(input)) return { type: "array", size: input.length };
  if (input instanceof Set) return { type: "set", size: input.size };
  if (input instanceof File) return { type: "file", size: input.size };
  throw new Error(`Invalid input for size check: ${getParsedType(input)}`);
}

export class $ZodCheckMaxSize<
  T extends types.Sizeable = types.Sizeable,
> extends $ZodCheck<T> {
  override check = "max_size" as const;
  maximum!: number;
  declare message?: string | err.$ZodErrorMap<err.$ZodIssueMaxSize>;
  constructor(def: $ZodCheckDef<$ZodCheckMaxSize>) {
    super(def);
  }

  run(ctx: $CheckCtx<T>): void {
    const size = getSize(ctx.input);
    if (size.size > this.maximum) {
      ctx.addIssue({
        code: "size_out_of_range",
        expected: "<",
        size: this.maximum,
        domain: size.type,
        input: ctx.input,
      });
    }
  }
}

// /////////////////////////////////////
// /////    $ZodCheckMinSize    /////
// /////////////////////////////////////

export class $ZodCheckMinSize<
  T extends types.Sizeable = types.Sizeable,
> extends $ZodCheck<T> {
  override check = "size_greater_than" as const;
  minimum!: number;
  constructor(def: $ZodCheckDef<$ZodCheckMinSize>) {
    super(def);
  }

  run(ctx: $CheckCtx<T>): void {
    const size = getSize(ctx.input);
    if (size.size < this.minimum) {
      ctx.addIssue({
        code: "size_out_of_range",
        expected: ">",
        size: this.minimum,
        domain: size.type,
        input: ctx.input,
      });
    }
  }
}

// /////////////////////////////////
// /////    $ZodCheckFormat    /////
// /////////////////////////////////
type $ZodCheckStringFormatDef<T extends $ZodCheck> = $ZodCheckDef<
  T,
  "pattern",
  { pattern?: RegExp }
>;

export abstract class $ZodCheckStringFormat extends $ZodCheck<string, string> {
  abstract override check: err.$ZodStringFormats;
  pattern?: RegExp;
  override run(ctx: $CheckCtx<string>): void {
    if (!this.pattern) throw new Error("Not implemented.");
    if (!this.pattern.test(ctx.input)) {
      ctx.addIssue({
        code: "invalid_string",
        format: this.check,
        pattern: this.pattern,
        input: ctx.input,
      } as err.$ZodIssueData);
    }
  }
}

// export class $ZodCheckRegex extends $ZodCheckStringFormat {
//   override check = "regex" as const;
//   override pattern!: RegExp;
//   constructor(def: $ZodCheckStringFormatDef<$ZodCheckRegex>) {
//     super(def);
//   }
// }

export class $ZodCheckIncludes extends $ZodCheckStringFormat {
  override check = "includes" as const;
  includes!: string;

  constructor(def: $ZodCheckDef<$ZodCheckIncludes>) {
    super(def);
  }

  override run(ctx: $CheckCtx<string>): void {
    if (!ctx.input.includes(this.includes)) {
      ctx.addIssue({
        code: "invalid_string",
        format: this.check,
        includes: this.includes,
        input: ctx.input,
      });
    }
  }
}

export class $ZodCheckTrim extends $ZodCheck<string, string> {
  override check = "trim" as const;
  override run(ctx: $CheckCtx<string>): void {
    ctx.input = ctx.input.trim();
  }
}

export class $ZodCheckToLowerCase extends $ZodCheck<string, string> {
  override check = "to_lowercase" as const;
  override run(ctx: $CheckCtx<string>): void {
    ctx.input = ctx.input.toLowerCase();
  }
}

export class $ZodCheckToUpperCase extends $ZodCheck<string, string> {
  override check = "to_uppercase" as const;
  override run(ctx: $CheckCtx<string>): void {
    ctx.input = ctx.input.toUpperCase();
  }
}

export class $ZodCheckNormalize extends $ZodCheck<string, string> {
  override check = "normalize" as const;
  override run(ctx: $CheckCtx<string>): void {
    ctx.input = ctx.input.normalize();
  }
}

export class $ZodCheckStartsWith extends $ZodCheckStringFormat {
  override check = "starts_with" as const;
  starts_with!: string;
  constructor(def: $ZodCheckDef<$ZodCheckStartsWith>) {
    super(def);
  }
  override run(ctx: $CheckCtx<string>): void {
    if (!ctx.input.startsWith(this.starts_with)) {
      ctx.addIssue({
        code: "invalid_string",
        format: this.check,
        starts_with: this.starts_with,
        input: ctx.input,
      });
    }
  }
}

export class $ZodCheckEndsWith extends $ZodCheckStringFormat {
  override check = "ends_with" as const;
  ends_with!: string;
  constructor(def: $ZodCheckDef<$ZodCheckEndsWith>) {
    super(def);
  }
  override run(ctx: $CheckCtx<string>): void {
    if (!ctx.input.endsWith(this.ends_with)) {
      ctx.addIssue({
        code: "invalid_string",
        format: this.check,
        ends_with: this.ends_with,
        input: ctx.input,
      });
    }
  }
}

export class $ZodCheckFileType extends $ZodCheck<File, File> {
  override check = "file_type" as const;
  fileTypes!: types.MimeTypes[];
  constructor(def: $ZodCheckDef<$ZodCheckFileType>) {
    super(def);
  }
  override run(ctx: $CheckCtx<File>): void {
    if (this.fileTypes.indexOf(ctx.input.type)) {
      ctx.addIssue({
        code: "invalid_type",
        expected: "literal",
        literalValues: this.fileTypes,
        input: ctx.input,
        path: ["type"],
      });
    }
  }
}

export class $ZodCheckFileName extends $ZodCheck<File, File> {
  override check = "file_name" as const;
  fileName!: string;
  constructor(def: $ZodCheckDef<$ZodCheckFileName>) {
    super(def);
  }
  override run(ctx: $CheckCtx<File>): void {
    if (this.fileName !== ctx.input.name) {
      ctx.addIssue({
        code: "invalid_type",
        expected: "literal",
        literalValues: [this.fileName],
        input: ctx.input,
        path: ["name"],
      });
    }
  }
}
