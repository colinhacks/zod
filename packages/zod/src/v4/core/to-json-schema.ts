import type * as checks from "./checks.js";
import type * as JSONSchema from "./json-schema.js";
import { type $ZodRegistry, globalRegistry } from "./registries.js";
import type * as schemas from "./schemas.js";

type Processor<T extends schemas.$ZodType> = (
  ctx: ToJSONSchemaContext<T>,
  schema: T,
  json: JSONSchema.BaseSchema
) => void;

interface JSONSchemaGeneratorParams<T extends schemas.$ZodType> {
  processors: Record<string, Processor<T>>;
  /** A registry used to look up metadata for each schema. Any schema with an `id` property will be extracted as a $def.
   *  @default globalRegistry */
  metadata?: $ZodRegistry<Record<string, any>>;
  /** The JSON Schema version to target.
   * - `"draft-2020-12"` — Default. JSON Schema Draft 2020-12
   * - `"draft-7"` — JSON Schema Draft 7
   * - `"draft-4"` — JSON Schema Draft 4
   * - `"openapi-3.0"` — OpenAPI 3.0 Schema Object */
  target?: "draft-4" | "draft-7" | "draft-2020-12" | "openapi-3.0";
  /** How to handle unrepresentable types.
   * - `"throw"` — Default. Unrepresentable types throw an error
   * - `"any"` — Unrepresentable types become `{}` */
  unrepresentable?: "throw" | "any";
  /** Arbitrary custom logic that can be used to modify the generated JSON Schema. */
  override?: (ctx: {
    zodSchema: schemas.$ZodTypes;
    jsonSchema: JSONSchema.BaseSchema;
    path: (string | number)[];
  }) => void;
  /** Whether to extract the `"input"` or `"output"` type. Relevant to transforms, Error converting schema to JSONz, defaults, coerced primitives, etc.
   * - `"output"` — Default. Convert the output schema.
   * - `"input"` — Convert the input schema. */
  io?: "input" | "output";
  cycles?: "ref" | "throw";
  reused?: "ref" | "inline";
  external?:
    | {
        registry: $ZodRegistry<{ id?: string | undefined }>;
        uri?: ((id: string) => string) | undefined;
        defs: Record<string, JSONSchema.BaseSchema>;
      }
    | undefined;
}

interface ProcessParams {
  schemaPath: schemas.$ZodType[];
  path: (string | number)[];
}

interface EmitParams {
  /** How to handle cycles.
   * - `"ref"` — Default. Cycles will be broken using $defs
   * - `"throw"` — Cycles will throw an error if encountered */
  cycles?: "ref" | "throw";
  /* How to handle reused schemas.
   * - `"inline"` — Default. Reused schemas will be inlined
   * - `"ref"` — Reused schemas will be extracted as $defs */
  reused?: "ref" | "inline";
  external?:
    | {
        /**  */
        registry: $ZodRegistry<{ id?: string | undefined }>;
        uri?: ((id: string) => string) | undefined;
        defs: Record<string, JSONSchema.BaseSchema>;
      }
    | undefined;
}

interface Seen {
  /** JSON Schema result for this Zod schema */
  schema: JSONSchema.BaseSchema;
  /** A cached version of the schema that doesn't get overwritten during ref resolution */
  def?: JSONSchema.BaseSchema;
  defId?: string | undefined;
  /** Number of times this schema was encountered during traversal */
  count: number;
  /** Cycle path */
  cycle?: (string | number)[] | undefined;
  isParent?: boolean | undefined;
  ref?: schemas.$ZodType | undefined | null;
  /** JSON Schema property path for this schema */
  path?: (string | number)[] | undefined;
}

export interface ToJSONSchemaContext<T extends schemas.$ZodType> {
  processors: Record<string, Processor<T>>;
  metadataRegistry: $ZodRegistry<Record<string, any>>;
  target: "draft-4" | "draft-7" | "draft-2020-12" | "openapi-3.0";
  unrepresentable: "throw" | "any";
  override: (ctx: {
    zodSchema: schemas.$ZodTypes;
    jsonSchema: JSONSchema.BaseSchema;
    path: (string | number)[];
  }) => void;
  io: "input" | "output";
  counter: number;
  seen: Map<schemas.$ZodType, Seen>;
  cycles: "ref" | "throw";
  reused: "ref" | "inline";
  external?:
    | {
        registry: $ZodRegistry<{ id?: string | undefined }>;
        uri?: ((id: string) => string) | undefined;
        defs: Record<string, JSONSchema.BaseSchema>;
      }
    | undefined;
}

// function initializeContext<T extends schemas.$ZodType>(inputs: JSONSchemaGeneratorParams<T>): ToJSONSchemaContext<T> {
//   return {
//     processor: inputs.processor,
//     metadataRegistry: inputs.metadata ?? globalRegistry,
//     target: inputs.target ?? "draft-2020-12",
//     unrepresentable: inputs.unrepresentable ?? "throw",
//   };
// }

function initializeContext<T extends schemas.$ZodType>(params: JSONSchemaGeneratorParams<T>): ToJSONSchemaContext<T> {
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target: params?.target ?? "draft-2020-12",
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {}),
    io: params?.io ?? "output",
    counter: 0,
    seen: new Map(),
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    external: params?.external ?? undefined,
  };
}

const formatMap: Partial<Record<checks.$ZodStringFormats, string | undefined>> = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: "", // do not set
};

function process<T extends schemas.$ZodType>(
  ctx: ToJSONSchemaContext<T>,
  schema: T,
  _params: ProcessParams = { path: [], schemaPath: [] }
): JSONSchema.BaseSchema {
  const def = schema._zod.def as schemas.$ZodTypes["_zod"]["def"];

  // check for schema in seens
  const seen = ctx.seen.get(schema);

  if (seen) {
    seen.count++;

    // check if cycle
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }

    return seen.schema;
  }

  // initialize
  const result: Seen = { schema: {}, count: 1, cycle: undefined, path: _params.path };
  ctx.seen.set(schema, result);

  // custom method overrides default behavior
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result.schema = overrideSchema as any;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path,
    };

    const parent = schema._zod.parent as T;

    if (parent) {
      // schema was cloned from another schema
      result.ref = parent;
      process(ctx, parent, params);
      ctx.seen.get(parent)!.isParent = true;
    } else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error(`Zod Error: No processor found for type: ${def.type}`);
      }
      processor(ctx, schema, _json);
    }
  }

  // metadata
  const meta = ctx.metadataRegistry.get(schema);
  if (meta) Object.assign(result.schema, meta);

  if (ctx.io === "input" && isTransforming(schema)) {
    // examples/defaults only apply to output type of pipe
    delete result.schema.examples;
    delete result.schema.default;
  }

  // set prefault as default
  if (ctx.io === "input" && result.schema._prefault) result.schema.default ??= result.schema._prefault;
  delete result.schema._prefault;

  // pulling fresh from ctx.seen in case it was overwritten
  const _result = ctx.seen.get(schema)!;

  return _result.schema;
}

export function extractDefs<T extends schemas.$ZodType>(
  ctx: ToJSONSchemaContext<T>,
  schema: T
  // params: EmitParams
): void {
  // iterate over seen map;
  const root = ctx.seen.get(schema);

  if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");

  // returns a ref to the schema
  // defId will be empty if the ref points to an external schema (or #)
  const makeURI = (entry: [schemas.$ZodType<unknown, unknown>, Seen]): { ref: string; defId?: string } => {
    // comparing the seen objects because sometimes
    // multiple schemas map to the same seen object.
    // e.g. lazy

    // external is configured
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id; // ?? "__shared";// `__schema${ctx.counter++}`;

      // check if schema is in the external registry
      const uriGenerator = ctx.external.uri ?? ((id) => id);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }

      // otherwise, add to __shared
      const id: string = entry[1].defId ?? (entry[1].schema.id as string) ?? `schema${ctx.counter++}`;
      entry[1].defId = id; // set defId so it will be reused if needed
      return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
    }

    if (entry[1] === root) {
      return { ref: "#" };
    }

    // self-contained schema
    const uriPrefix = `#`;
    const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return { defId, ref: defUriPrefix + defId };
  };

  // stored cached version in `def` property
  // remove all properties, set $ref
  const extractToDef = (entry: [schemas.$ZodType<unknown, unknown>, Seen]): void => {
    // if the schema is already a reference, do not extract it
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);

    seen.def = { ...seen.schema };
    // defId won't be set if the schema is a reference to an external schema
    // or if the schema is the root schema
    if (defId) seen.defId = defId;
    // wipe away all properties except $ref
    const schema = seen.schema;
    for (const key in schema) {
      delete schema[key];
    }
    schema.$ref = ref;
  };

  // throw on cycles

  // break cycles
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error(
          "Cycle detected: " +
            `#/${seen.cycle?.join("/")}/<root>` +
            '\n\nSet the `cycles` parameter to `"ref"` to resolve cyclical schemas with defs.'
        );
      }
    }
  }

  // extract schemas into $defs
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];

    // convert root schema to # $ref
    if (schema === entry[0]) {
      extractToDef(entry); // this has special handling for the root schema
      continue;
    }

    // extract schemas that are in the external registry
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }

    // extract schemas with `id` meta
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }

    // break cycles
    if (seen.cycle) {
      // any
      extractToDef(entry);
      continue;
    }

    // extract reused schemas
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
        // biome-ignore lint:
        continue;
      }
    }
  }
}

export function finalize<T extends schemas.$ZodType>(ctx: ToJSONSchemaContext<T>, schema: T): JSONSchema.BaseSchema {
  //

  // iterate over seen map;
  const root = ctx.seen.get(schema);

  if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");

  // flatten _refs
  const flattenRef = (zodSchema: schemas.$ZodType, params: Pick<ToJSONSchemaParams, "target">) => {
    const seen = ctx.seen.get(zodSchema)!;
    const schema = seen.def ?? seen.schema;

    const _cached = { ...schema };

    // already seen
    if (seen.ref === null) {
      return;
    }

    // flatten ref if defined
    const ref = seen.ref;
    seen.ref = null; // prevent recursion
    if (ref) {
      flattenRef(ref, params);

      // merge referenced schema into current
      const refSchema = ctx.seen.get(ref)!.schema;
      if (
        refSchema.$ref &&
        (params.target === "draft-7" || params.target === "draft-4" || params.target === "openapi-3.0")
      ) {
        schema.allOf = schema.allOf ?? [];
        schema.allOf.push(refSchema);
      } else {
        Object.assign(schema, refSchema);
        Object.assign(schema, _cached); // prevent overwriting any fields in the original schema
      }
    }

    // execute overrides
    if (!seen.isParent)
      ctx.override({
        zodSchema: zodSchema as schemas.$ZodTypes,
        jsonSchema: schema,
        path: seen.path ?? [],
      });
  };

  for (const entry of [...ctx.seen.entries()].reverse()) {
    flattenRef(entry[0], { target: ctx.target });
  }

  const result: JSONSchema.BaseSchema = {};
  if (ctx.target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-7") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-4") {
    result.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") {
    // OpenAPI 3.0 schema objects should not include a $schema property
  } else {
    // @ts-ignore
    console.warn(`Invalid target: ${ctx.target}`);
  }

  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id) throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }

  Object.assign(result, root.def ?? root.schema);

  // build defs object
  const defs: JSONSchema.BaseSchema["$defs"] = ctx.external?.defs ?? {};
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (seen.def && seen.defId) {
      defs[seen.defId] = seen.def;
    }
  }

  // set definitions in result
  if (ctx.external) {
  } else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result.$defs = defs;
      } else {
        result.definitions = defs;
      }
    }
  }

  try {
    // this "finalizes" this schema and ensures all cycles are removed
    // each call to finalize() is functionally independent
    // though the seen map is shared
    return JSON.parse(JSON.stringify(result));
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}

interface ToJSONSchemaParams
  extends Omit<JSONSchemaGeneratorParams<schemas.$ZodType> & EmitParams, "external" | "processor"> {}

function isTransforming(
  _schema: schemas.$ZodType,
  _ctx?: {
    seen: Set<schemas.$ZodType>;
  }
): boolean {
  const ctx = _ctx ?? { seen: new Set() };

  if (ctx.seen.has(_schema)) return false;
  ctx.seen.add(_schema);

  const def = (_schema as schemas.$ZodTypes)._zod.def;

  if (def.type === "transform") return true;

  if (def.type === "array") return isTransforming(def.element, ctx);
  if (def.type === "set") return isTransforming(def.valueType, ctx);
  if (def.type === "lazy") return isTransforming(def.getter(), ctx);

  if (
    def.type === "promise" ||
    def.type === "optional" ||
    def.type === "nonoptional" ||
    def.type === "nullable" ||
    def.type === "readonly" ||
    def.type === "default" ||
    def.type === "prefault"
  ) {
    return isTransforming(def.innerType, ctx);
  }

  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }

  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key]!, ctx)) return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx)) return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx)) return true;
    }
    if (def.rest && isTransforming(def.rest, ctx)) return true;
    return false;
  }

  return false;
}

const stringProcessor: Processor<schemas.$ZodString> = (ctx, schema, _json) => {
  const json = _json as JSONSchema.StringSchema;
  json.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding } = schema._zod
    .bag as schemas.$ZodStringInternals<unknown>["bag"];
  if (typeof minimum === "number") json.minLength = minimum;
  if (typeof maximum === "number") json.maxLength = maximum;
  // custom pattern overrides format
  if (format) {
    json.format = formatMap[format as checks.$ZodStringFormats] ?? format;
    if (json.format === "") delete json.format; // empty format is not valid
  }
  if (contentEncoding) json.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const regexes = [...patterns];
    if (regexes.length === 1) json.pattern = regexes[0]!.source;
    else if (regexes.length > 1) {
      json.allOf = [
        ...regexes.map((regex) => ({
          ...(ctx.target === "draft-7" || ctx.target === "draft-4" || ctx.target === "openapi-3.0"
            ? ({ type: "string" } as const)
            : {}),
          pattern: regex.source,
        })),
      ];
    }
  }
};

const _toJSONSchemaSimple =
  (args: { processors: Record<string, Processor<any>> }) =>
  (schema: schemas.$ZodType, params?: ToJSONSchemaParams): JSONSchema.BaseSchema => {
    const ctx = initializeContext({ ...params, processors: args.processors });
    process(ctx, schema);
    return finalize(ctx, schema);
  };

const _toJSONSchemaComposite =
  (args: { processors: Record<string, Processor<schemas.$ZodType>> }) =>
  (schema: schemas.$ZodType, params?: ToJSONSchemaParams): JSONSchema.BaseSchema => {
    const ctx = initializeContext({ ...params, processors: args.processors });
    process(ctx, schema);
    extractDefs(ctx, schema);
    return finalize(ctx, schema);
  };

export const stringToJSONSchema = _toJSONSchemaSimple({ processors: { string: stringProcessor } });
