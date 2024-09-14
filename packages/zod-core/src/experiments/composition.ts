import * as core from "../index.js";

export class $ZodString extends core.$ZodType<string, string> {
  override typeName: "zod.core.string";
  coerce: boolean;
  constructor(def: core.$Def<$ZodString>) {
    super(def);
  }
  "~toJsonSchema"() {}
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

export abstract class ZodType<
  Output = unknown,
  Input = never,
> extends core.$ZodType<Output, Input> {
  /** @internal @deprecated This field is not deprecated, but it is marked with @deprecated to hide it from autocomplete. */
  "~core": core.$ZodType<Output, Input>;
  "~parse"(
    input: core.ParseInput,
    ctx?: core.ParseContext
  ): core.ParseReturnType<this["~core"]["~output"]> {
    return this["~core"]["~parse"](input, ctx) as any;
  }
  constructor(def: core.$Def<ZodType>) {
    super(def);
  }
}

export class ZodString extends ZodType<string, string> {
  override "~core": $ZodString;
  constructor(def: core.$Def<ZodString>) {
    super(def);
  }
  "~toJsonSchema"() {}
}

const str = new $ZodString({
  typeName: "zod.core.string",
  coerce: false,
  checks: [],
});

console.log(str["~parse"]("colin"));

const str2 = new ZodString({
  "~core": str,
  typeName: "zod.string",
  checks: [],
});
console.log(str2["~parse"]("colin"));
