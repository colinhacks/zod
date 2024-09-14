/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodBoolean     //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

interface $ZodBooleanDef extends core.$ZodTypeDef {
  coerce: boolean;
}

export class $ZodBoolean<
  O extends boolean,
  I,
  D extends $ZodBooleanDef,
> extends core.$ZodType<O, I, D> {
  override type = "boolean" as const;

  /** @deprecated Internal API, use with caution. */
  override _typeCheck(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<O> {
    if (typeof input === "boolean") return input as O;
    if (this.coerce) return Boolean(input) as O;

    return parse.$ZodFailure.from(
      [
        {
          code: "invalid_type",
          expected: "boolean",
          received: parse.getParsedType(input),
          input,
        },
      ],
      ctx
    );
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodDate        //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

interface $ZodDateDef extends core.$ZodTypeDef {
  coerce: boolean;
}

export class $ZodDate<
  O extends Date,
  I,
  D extends $ZodDateDef,
> extends core.$ZodType<O, I, D> {
  override type = "date" as const;

  /** @deprecated Internal API, use with caution. */
  override _typeCheck(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<O> {
    if (input instanceof Date && !Number.isNaN(input.getTime()))
      return input as O;
    if (this.coerce) return new Date(input as any) as O;

    return parse.$ZodFailure.from(
      [
        {
          code: "invalid_type",
          expected: "date",
          received: parse.getParsedType(input),
          input,
        },
      ],
      ctx
    );
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////    $ZodUndefined     //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

interface $ZodUndefinedDef extends core.$ZodTypeDef {}

export class $ZodUndefined<
  O extends undefined,
  I,
  D extends $ZodUndefinedDef,
> extends core.$ZodType<O, I, D> {
  override type = "undefined" as const;

  /** @deprecated Internal API, use with caution. */
  override _typeCheck(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<O> {
    if (input === undefined) return input as O;

    return parse.$ZodFailure.from(
      [
        {
          code: "invalid_type",
          expected: "undefined",
          received: parse.getParsedType(input),
          input,
        },
      ],
      ctx
    );
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodNull        //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

interface $ZodNullDef extends core.$ZodTypeDef {}

export class $ZodNull<
  O extends null,
  I,
  D extends $ZodNullDef,
> extends core.$ZodType<O, I, D> {
  override type = "null" as const;

  /** @deprecated Internal API, use with caution. */
  override _typeCheck(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<O> {
    if (input === null) return input as O;

    return parse.$ZodFailure.from(
      [
        {
          code: "invalid_type",
          expected: "null",
          received: parse.getParsedType(input),
          input,
        },
      ],
      ctx
    );
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      $ZodAny         //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

interface $ZodAnyDef extends core.$ZodTypeDef {}

export class $ZodAny<
  O = any,
  I = unknown,
  D extends $ZodAnyDef = $ZodAnyDef,
> extends core.$ZodType<O, I, D> {
  override type = "any" as const;

  /** @deprecated Internal API, use with caution. */
  override _typeCheck(
    input: unknown,
    _ctx?: parse.ParseContext
  ): parse.ParseReturnType<O> {
    return input as O; // $ZodAny accepts any input
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////    $ZodUnknown       //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

interface $ZodUnknownDef extends core.$ZodTypeDef {}

export class $ZodUnknown<
  O = unknown,
  I = unknown,
  D extends $ZodUnknownDef = $ZodUnknownDef,
> extends core.$ZodType<O, I, D> {
  override type = "unknown" as const;

  /** @deprecated Internal API, use with caution. */
  override _typeCheck(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<O> {
    return input as O; // $ZodUnknown accepts any input but treats it as unknown
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////     $ZodNever        //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

interface $ZodNeverDef extends core.$ZodTypeDef {}

export class $ZodNever<
  O = never,
  I = unknown,
  D extends $ZodNeverDef = $ZodNeverDef,
> extends core.$ZodType<O, I, D> {
  override type = "never" as const;

  /** @deprecated Internal API, use with caution. */
  override _typeCheck(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<O> {
    return parse.$ZodFailure.from(
      [
        {
          code: "invalid_type",
          expected: "never",
          received: parse.getParsedType(input),
          input,
        },
      ],
      ctx
    );
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////     $ZodVoid         //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

interface $ZodVoidDef extends core.$ZodTypeDef {}

export class $ZodVoid<
  O = void,
  I = unknown,
  D extends $ZodVoidDef = $ZodVoidDef,
> extends core.$ZodType<O, I, D> {
  override type = "void" as const;

  /** @deprecated Internal API, use with caution. */
  override _typeCheck(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<O> {
    if (input === undefined) return input as O;

    return parse.$ZodFailure.from(
      [
        {
          code: "invalid_type",
          expected: "void",
          received: parse.getParsedType(input),
          input,
        },
      ],
      ctx
    );
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////     $ZodArray        //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

interface $ZodArrayDef<T extends core.$ZodType<any, any>>
  extends core.$ZodTypeDef {
  items: T;
}

export class $ZodArray<O, I, D extends $ZodArrayDef<any>> extends core.$ZodType<
  O[],
  I[],
  D
> {
  override type = "array" as const;

  /** @deprecated Internal API, use with caution. */
  override _typeCheck(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<O[]> {
    if (!Array.isArray(input)) {
      return parse.$ZodFailure.from(
        [
          {
            code: "invalid_type",
            expected: "array",
            received: parse.getParsedType(input),
            input,
          },
        ],
        ctx
      );
    }

    let fail!: parse.$ZodFailure;
    const parsedArray: O[] = Array(input.length);

    // Validate each item in the array
    for (let index = 0; index < input.length; index++) {
      const item = input[index];
      const result = this.items._typeCheck(item, ctx);

      if (result instanceof parse.$ZodFailure) {
        fail = fail || new parse.$ZodFailure();

        for (const issue of result.issues) {
          fail.issues.push({
            ...issue,
            path: [index, ...issue.path], // Update the path to reflect the index in the array
          });
        }
      } else {
        parsedArray.push(result as O);
      }
    }

    return fail ?? parsedArray;
  }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////     $ZodObject       //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

type InferOutput<S extends { [k: string]: core.$ZodType<unknown, never> }> = {
  [K in keyof S]: S[K]["~output"];
};

type InferInput<S extends { [k: string]: core.$ZodType<unknown, never> }> = {
  [K in keyof S]: S[K]["~input"];
};

interface $ZodObjectDef<
  Shape extends { [k: string]: core.$ZodType<unknown, never> },
> extends core.$ZodTypeDef {
  properties: Shape;
  additionalProperties?: core.$ZodType<unknown, never>; // For handling unknown keys
  // unknownKeys?:  "passthrough" | "strict" | "strip";
  error?: err.$ZodErrorMap<err.$ZodInvalidTypeIssues> | undefined;
}

export class $ZodObject<
  Shape extends { [k: string]: core.$ZodType<unknown, never> },
  D extends $ZodObjectDef<Shape>,
> extends core.$ZodType<InferOutput<Shape>, InferInput<Shape>, D> {
  override type = "object" as const;

  private get keySet(): Set<string> {
    const value = new Set(Object.keys(this.properties));
    Object.defineProperty(this, "keySet", { value });
    return value;
  }

  /** @deprecated Internal API, use with caution. */
  override _typeCheck(
    input: unknown,
    ctx?: parse.ParseContext
  ): parse.ParseReturnType<this["~output"]> {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return parse.$ZodFailure.from(
        [
          {
            code: "invalid_type",
            expected: "object",
            received: parse.getParsedType(input),
            input,
          },
        ],
        ctx
      );
    }

    let fail!: parse.$ZodFailure;
    const parsedObject: InferOutput<Shape> = {} as InferOutput<Shape>;

    // Validate each key in the shape
    const unhandledKeys = new Set(Object.keys(input));
    for (const key in this.properties) {
      unhandledKeys.delete(key);
      const value = (input as InferInput<Shape>)[key];
      const result = this.properties[key]._typeCheck(value, ctx);

      if (result instanceof parse.$ZodFailure) {
        fail = fail || new parse.$ZodFailure();
        fail.mergeIn(result, key);
      } else {
        parsedObject[key] = result as InferOutput<Shape>[typeof key];
      }
    }

    if (unhandledKeys.size === 0) return parsedObject;
    if (this.unknownKeys === "strict") {
      fail = fail || new parse.$ZodFailure();
      fail.addIssue(
        {
          code: "invalid_type",
          expected: "object",
          received: "object",
          unrecognized_keys: [...unhandledKeys],
          input: input,
        },
        this
      );
      return fail;
    }

    if (this.unknownKeys === "strip") return fail ?? parsedObject;
    if (this.unknownKeys === "passthrough") {
      for (const key of unhandledKeys) {
        (parsedObject as any)[key] = (input as any)[key];
      }
      return parsedObject;
    }

    if (unhandledKeys.size) {
      if (this.unknownKeys === "passthrough") {
        for (const key of unhandledKeys) {
          // @ts-ignore
          parsedObject[key] = input[key];
        }
      } else if (this.unknownKeys === "strict") {
        fail = fail || new parse.$ZodFailure();
        fail.addIssue(
          {
            code: "invalid_type",
            expected: "object",
            received: "object",
            unrecognized_keys: [...unhandledKeys],
            input: input,
          },
          this
        );
      } else {
        // "strip" (do nothing)
      }
    }

    // Apply `catchall` validation for remaining unknown keys
    if (this.additionalProperties) {
      for (const key in input) {
        if (!this.shape[key]) {
          const result = this.catchall._typeCheck((input as any)[key], ctx);

          if (result instanceof parse.$ZodFailure) {
            fail = fail || new parse.$ZodFailure();

            for (const issue of result.issues) {
              fail.issues.push({
                ...issue,
                path: [key, ...issue.path],
              });
            }
          } else {
            (parsedObject as any)[key] = result;
          }
        }
      }
    }

    return fail ?? parsedObject;
  }
  get shape(): Shape {
    return this.properties;
  }
}
