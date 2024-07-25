import {
  type IssueData,
  type ZodCustomIssue,
  ZodError,
  type ZodErrorMap,
  makeIssue,
} from "./errors.js";
import {
  type ParseContext,
  type ParseInput,
  type ParseReturnType,
  type SyncParseReturnType,
  isAborted,
} from "./parse.js";
import type * as util from "./types.js";

export const NEVER = Symbol.for("{{zod.never}}") as never;

export function issuesToZodError(
  ctx: ParseContext,
  issues: IssueData[]
): ZodError {
  return new ZodError(issues.map((issue) => makeIssue(issue, ctx)));
}

export function safeResult<Input, Output>(
  ctx: ParseContext,
  result: SyncParseReturnType<Output>
):
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> } {
  if (isAborted(result)) {
    if (!result.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }

    return {
      success: false,
      get error() {
        if ((this as any)._error) return (this as any)._error as Error;
        const err = issuesToZodError(ctx, result.issues);
        (this as any)._error = err;
        return (this as any)._error;
      },
    };
  }
  return { success: true, data: result as any };
}

export interface $Check {
  deps: (string | number | (string | number)[])[];
  run(check: $CheckCtx): void;
  error?: ZodErrorMap;
}

export interface $CheckCtx {
  addIssue: (data: IssueData) => void;
  input: any;
}

export interface $ZodTypeDef {
  typeName: string;
  errorMap?: ZodErrorMap;
  description?: string;
  // checks: $Check[] | null;
}

export type SafeParseSuccess<Output> = {
  success: true;
  data: Output;
  error?: never;
};
export type SafeParseError<Input> = {
  success: false;
  error: ZodError<Input>;
  data?: never;
};

export type SafeParseReturnType<Input, Output> =
  | SafeParseSuccess<Awaited<Output>>
  | SafeParseError<Awaited<Input>>;

export type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, "code">>;

export abstract class $ZodType<Output = unknown, Input = unknown> {
  readonly _def!: $ZodTypeDef;
  readonly "~output"!: Output;
  readonly "~input"!: Input;
  abstract "~parse"(
    input: ParseInput,
    ctx?: ParseContext
  ): ParseReturnType<Output>;

  constructor(def: $ZodTypeDef) {
    this._def = def;
  }
}

type Infer<T extends $ZodType> = T["~output"];
export type input<T extends $ZodType> = T["~input"];
export type output<T extends $ZodType> = T["~output"];
export type { Infer as infer };
