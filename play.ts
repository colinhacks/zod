/**
 * The Standard Schema interface.
 */
export type StandardSchemaV1<Input = unknown, Output = Input> = {
  /**
   * The Standard Schema properties.
   */
  readonly "~standard": StandardSchemaV1.Props<Input, Output>;
};

/** Standard JSON Schema payload augmented with type information.
 *  Libraries still provide their own JSON Schema conversion methods/functions with full customizability/options
 *  No prescribed method name
 *  These methods/functions return a "JSON Schema payload" that's augmented with a virtual "~types" property containing type information, should it exist.
 *  Brings TypeBox into the fold (possibly)
 */
export type StandardJSONSchemaPayloadV1<Input = unknown, Output = Input> = Record<string, unknown> & {
  "~types"?: StandardSchemaV1.Types<Input, Output> | undefined;
};

export type StandardSchemaWithJsonSchemaV1<Input = unknown, Output = Input> = {
  /**
   * The Standard Schema properties.
   */
  readonly "~standard": StandardSchemaV1.PropsWithJsonSchema<Input, Output>;
};

export declare namespace StandardSchemaV1 {
  export interface PropsWithJsonSchema<Input = unknown, Output = Input> extends Props<Input, Output> {
    readonly jsonSchema: StandardJSONSchemaPayloadV1<Input, Output>;
  }

  /**
   * The Standard Schema properties interface.
   */
  export interface Props<Input = unknown, Output = Input> {
    /**
     * The version number of the standard.
     */
    readonly version: 1;
    /**
     * The vendor name of the schema library.
     */
    readonly vendor: string;
    /**
     * Validates unknown input values.
     */
    readonly validate: (value: unknown) => Result<Output> | Promise<Result<Output>>;
    /**
     * Inferred types associated with the schema.
     */
    readonly types?: Types<Input, Output> | undefined;
  }

  /**
   * The result interface of the validate function.
   */
  export type Result<Output> = SuccessResult<Output> | FailureResult;

  /**
   * The result interface if validation succeeds.
   */
  export interface SuccessResult<Output> {
    /**
     * The typed output value.
     */
    readonly value: Output;
    /**
     * The non-existent issues.
     */
    readonly issues?: undefined;
  }

  /**
   * The result interface if validation fails.
   */
  export interface FailureResult {
    /**
     * The issues of failed validation.
     */
    readonly issues: ReadonlyArray<Issue>;
  }

  /**
   * The issue interface of the failure output.
   */
  export interface Issue {
    /**
     * The error message of the issue.
     */
    readonly message: string;
    /**
     * The path of the issue, if any.
     */
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
  }

  /**
   * The path segment interface of the issue.
   */
  export interface PathSegment {
    /**
     * The key representing a path segment.
     */
    readonly key: PropertyKey;
  }

  /**
   * The Standard Schema types interface.
   */
  export interface Types<Input = unknown, Output = Input> {
    /**
     * The input type of the schema.
     */
    readonly input: Input;
    /**
     * The output type of the schema.
     */
    readonly output: Output;
  }

  /**
   * Infers the input type of a Standard Schema.
   */
  export type InferInput<Schema extends StandardSchemaV1> = NonNullable<Schema["~standard"]["types"]>["input"];

  /**
   * Infers the output type of a Standard Schema.
   */
  export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<Schema["~standard"]["types"]>["output"];

  // biome-ignore lint/complexity/noUselessEmptyExport: needed for granular visibility control of TS namespace
  export {};
}
