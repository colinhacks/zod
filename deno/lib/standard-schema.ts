declare namespace v1 {
  /**
   * The Standard Schema interface.
   */
  interface StandardSchema<Input = unknown, Output = Input> {
    /**
     * The Standard Schema properties.
     */
    readonly "~standard": StandardSchemaProps<Input, Output>;
  }
  /**
   * The Standard Schema properties interface.
   */
  interface StandardSchemaProps<Input = unknown, Output = Input> {
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
    readonly validate: (
      value: unknown
    ) => StandardResult<Output> | Promise<StandardResult<Output>>;
    /**
     * Inferred types associated with the schema.
     */
    readonly types?: StandardTypes<Input, Output> | undefined;
  }
  /**
   * The result interface of the validate function.
   */
  type StandardResult<Output> =
    | StandardSuccessResult<Output>
    | StandardFailureResult;
  /**
   * The result interface if validation succeeds.
   */
  interface StandardSuccessResult<Output> {
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
  interface StandardFailureResult {
    /**
     * The issues of failed validation.
     */
    readonly issues: ReadonlyArray<StandardIssue>;
  }
  /**
   * The issue interface of the failure output.
   */
  interface StandardIssue {
    /**
     * The error message of the issue.
     */
    readonly message: string;
    /**
     * The path of the issue, if any.
     */
    readonly path?:
      | ReadonlyArray<PropertyKey | StandardPathSegment>
      | undefined;
  }
  /**
   * The path segment interface of the issue.
   */
  interface StandardPathSegment {
    /**
     * The key representing a path segment.
     */
    readonly key: PropertyKey;
  }
  /**
   * The base types interface of Standard Schema.
   */
  interface StandardTypes<Input, Output> {
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
  type InferInput<Schema extends StandardSchema> = NonNullable<
    Schema["~standard"]["types"]
  >["input"];
  /**
   * Infers the output type of a Standard Schema.
   */
  type InferOutput<Schema extends StandardSchema> = NonNullable<
    Schema["~standard"]["types"]
  >["output"];
}

export type { v1 };
