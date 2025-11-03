import type * as JSONSchema from "./json-schema.js";
import { $ZodRegistry, globalRegistry } from "./registries.js";
import type * as schemas from "./schemas.js";

interface JSONSchemaGeneratorParams {
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

export class JSONSchemaGenerator {
  metadataRegistry: $ZodRegistry<Record<string, any>>;
  target: "draft-4" | "draft-7" | "draft-2020-12" | "openapi-3.0";
  unrepresentable: "throw" | "any";
  override: (ctx: {
    zodSchema: schemas.$ZodTypes;
    jsonSchema: JSONSchema.BaseSchema;
    path: (string | number)[];
  }) => void;
  io: "input" | "output";

  counter = 0;
  seen: Map<schemas.$ZodType, Seen>;

  constructor(params?: JSONSchemaGeneratorParams) {
    this.metadataRegistry = params?.metadata ?? globalRegistry;
    this.target = params?.target ?? "draft-2020-12";
    this.unrepresentable = params?.unrepresentable ?? "throw";
    this.override = params?.override ?? (() => {});
    this.io = params?.io ?? "output";

    this.seen = new Map();
  }

  process(schema: schemas.$ZodType, _params: ProcessParams = { path: [], schemaPath: [] }): JSONSchema.BaseSchema {
    // check for schema in seens
    const seen = this.seen.get(schema);

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
    this.seen.set(schema, result);

    // Call getJSONSchema with inline processor - processor is called inside toJSON
    const processedSchema = schema._zod.getJSONSchema(
      {
        io: this.io,
        target: this.target,
        path: _params.path,
        schemaPath: [..._params.schemaPath, schema],
        unrepresentable: this.unrepresentable,
        processor: (currentSchema, context, getJSONSchemaResult) => {
          // Check for unrepresentable types (indicated by _error property)
          if ("_error" in getJSONSchemaResult) {
            // Handle unrepresentable types according to settings
            if (this.unrepresentable === "throw") {
              throw new Error((getJSONSchemaResult as any)._error as string);
            }
            // For unrepresentable: "any", return empty schema (becomes {})
            return {};
          }

          // Handle custom override methods
          const overrideSchema = currentSchema._zod.toJSONSchema?.();
          if (overrideSchema) {
            const processed = overrideSchema as JSONSchema.BaseSchema;
            // If this is the root schema, assign to result
            if (currentSchema === schema) {
              Object.assign(result.schema, processed);
            }
            return processed;
          }

          // Handle parent relationships
          const parent = currentSchema._zod.parent;
          if (parent && currentSchema === schema) {
            result.ref = parent;
            this.process(parent, {
              path: context.path,
              schemaPath: context.schemaPath,
            });
            this.seen.get(parent)!.isParent = true;
          }

          // Cycle detection
          const schemaPath = context.schemaPath;
          const isCycle = schemaPath.slice(0, -1).includes(currentSchema);
          if (isCycle && currentSchema === schema) {
            result.cycle = context.path;
          }

          // For nested schemas (not the root), process them recursively
          if (currentSchema !== schema) {
            return this.process(currentSchema, {
              path: context.path,
              schemaPath: schemaPath,
            });
          }

          // Normal case: return the schema from getJSONSchema
          return getJSONSchemaResult;
        },
      },
      []
    );

    Object.assign(result.schema, processedSchema);

    // metadata - apply metadata from our registry (may override global registry metadata)
    const meta = this.metadataRegistry.get(schema);
    if (meta) Object.assign(result.schema, meta);

    if (this.io === "input" && isTransforming(schema)) {
      // examples/defaults only apply to output type of pipe
      delete result.schema.examples;
      delete result.schema.default;
    }

    // set prefault as default
    if (this.io === "input" && result.schema._prefault) result.schema.default ??= result.schema._prefault;
    delete result.schema._prefault;

    // pulling fresh from this.seen in case it was overwritten
    const _result = this.seen.get(schema)!;

    return _result.schema;
  }

  emit(schema: schemas.$ZodType, _params?: EmitParams): JSONSchema.BaseSchema {
    const params = {
      cycles: _params?.cycles ?? "ref",
      reused: _params?.reused ?? "inline",
      // unrepresentable: _params?.unrepresentable ?? "throw",
      // uri: _params?.uri ?? ((id) => `${id}`),
      external: _params?.external ?? undefined,
    } satisfies EmitParams;

    // iterate over seen map;
    const root = this.seen.get(schema);

    if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");

    // initialize result with root schema fields
    // Object.assign(result, seen.cached);

    // returns a ref to the schema
    // defId will be empty if the ref points to an external schema (or #)
    const makeURI = (entry: [schemas.$ZodType<unknown, unknown>, Seen]): { ref: string; defId?: string } => {
      // comparing the seen objects because sometimes
      // multiple schemas map to the same seen object.
      // e.g. lazy

      // external is configured
      const defsSegment = this.target === "draft-2020-12" ? "$defs" : "definitions";
      if (params.external) {
        const externalId = params.external.registry.get(entry[0])?.id; // ?? "__shared";// `__schema${this.counter++}`;

        // check if schema is in the external registry
        const uriGenerator = params.external.uri ?? ((id) => id);
        if (externalId) {
          return { ref: uriGenerator(externalId) };
        }

        // otherwise, add to __shared
        const id: string = entry[1].defId ?? (entry[1].schema.id as string) ?? `schema${this.counter++}`;
        entry[1].defId = id; // set defId so it will be reused if needed
        return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
      }

      if (entry[1] === root) {
        return { ref: "#" };
      }

      // self-contained schema
      const uriPrefix = `#`;
      const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
      const defId = entry[1].schema.id ?? `__schema${this.counter++}`;
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
    if (params.cycles === "throw") {
      for (const entry of this.seen.entries()) {
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
    for (const entry of this.seen.entries()) {
      const seen = entry[1];

      // convert root schema to # $ref
      if (schema === entry[0]) {
        extractToDef(entry); // this has special handling for the root schema
        continue;
      }

      // extract schemas that are in the external registry
      if (params.external) {
        const ext = params.external.registry.get(entry[0])?.id;
        if (schema !== entry[0] && ext) {
          extractToDef(entry);
          continue;
        }
      }

      // extract schemas with `id` meta
      const id = this.metadataRegistry.get(entry[0])?.id;
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
        if (params.reused === "ref") {
          extractToDef(entry);
          // biome-ignore lint:
          continue;
        }
      }
    }

    // flatten _refs
    const flattenRef = (zodSchema: schemas.$ZodType, params: Pick<ToJSONSchemaParams, "target">) => {
      const seen = this.seen.get(zodSchema)!;
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
        const refSchema = this.seen.get(ref)!.schema;
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
        this.override({
          zodSchema: zodSchema as schemas.$ZodTypes,
          jsonSchema: schema,
          path: seen.path ?? [],
        });
    };

    for (const entry of [...this.seen.entries()].reverse()) {
      flattenRef(entry[0], { target: this.target });
    }

    const result: JSONSchema.BaseSchema = {};
    if (this.target === "draft-2020-12") {
      result.$schema = "https://json-schema.org/draft/2020-12/schema";
    } else if (this.target === "draft-7") {
      result.$schema = "http://json-schema.org/draft-07/schema#";
    } else if (this.target === "draft-4") {
      result.$schema = "http://json-schema.org/draft-04/schema#";
    } else if (this.target === "openapi-3.0") {
      // OpenAPI 3.0 schema objects should not include a $schema property
    } else {
      // @ts-ignore
      console.warn(`Invalid target: ${this.target}`);
    }

    if (params.external?.uri) {
      const id = params.external.registry.get(schema)?.id;
      if (!id) throw new Error("Schema is missing an `id` property");
      result.$id = params.external.uri(id);
    }

    Object.assign(result, root.def);

    // build defs object
    const defs: JSONSchema.BaseSchema["$defs"] = params.external?.defs ?? {};
    for (const entry of this.seen.entries()) {
      const seen = entry[1];
      if (seen.def && seen.defId) {
        defs[seen.defId] = seen.def;
      }
    }

    // set definitions in result
    if (params.external) {
    } else {
      if (Object.keys(defs).length > 0) {
        if (this.target === "draft-2020-12") {
          result.$defs = defs;
        } else {
          result.definitions = defs;
        }
      }
    }

    try {
      // this "finalizes" this schema and ensures all cycles are removed
      // each call to .emit() is functionally independent
      // though the seen map is shared
      return JSON.parse(JSON.stringify(result));
    } catch (_err) {
      throw new Error("Error converting schema to JSON.");
    }
  }
}

interface ToJSONSchemaParams extends Omit<JSONSchemaGeneratorParams & EmitParams, "external"> {}
interface RegistryToJSONSchemaParams extends Omit<JSONSchemaGeneratorParams & EmitParams, "external"> {
  uri?: (id: string) => string;
}

export function toJSONSchema(schema: schemas.$ZodType, _params?: ToJSONSchemaParams): JSONSchema.BaseSchema;
export function toJSONSchema(
  registry: $ZodRegistry<{ id?: string | undefined }>,
  _params?: RegistryToJSONSchemaParams
): { schemas: Record<string, JSONSchema.BaseSchema> };
export function toJSONSchema(
  input: schemas.$ZodType | $ZodRegistry<{ id?: string | undefined }>,
  _params?: ToJSONSchemaParams
): any {
  if (input instanceof $ZodRegistry) {
    const gen = new JSONSchemaGenerator(_params);
    const defs: any = {};
    for (const entry of input._idmap.entries()) {
      const [_, schema] = entry;
      gen.process(schema);
    }

    const schemas: Record<string, JSONSchema.BaseSchema> = {};
    const external = {
      registry: input,
      uri: (_params as RegistryToJSONSchemaParams)?.uri,
      defs,
    };
    for (const entry of input._idmap.entries()) {
      const [key, schema] = entry;
      schemas[key] = gen.emit(schema, {
        ..._params,
        external,
      });
    }

    if (Object.keys(defs).length > 0) {
      const defsSegment = gen.target === "draft-2020-12" ? "$defs" : "definitions";
      schemas.__shared = {
        [defsSegment]: defs,
      };
    }

    return { schemas };
  }

  const gen = new JSONSchemaGenerator(_params);
  gen.process(input);

  return gen.emit(input, _params);
}

function isTransforming(
  _schema: schemas.$ZodType,
  _ctx?: {
    seen: Set<schemas.$ZodType>;
  }
): boolean {
  const ctx = _ctx ?? { seen: new Set() };

  if (ctx.seen.has(_schema)) return false;
  ctx.seen.add(_schema);

  const schema = _schema as schemas.$ZodTypes;
  const def = schema._zod.def;
  switch (def.type) {
    case "string":
    case "number":
    case "bigint":
    case "boolean":
    case "date":
    case "symbol":
    case "undefined":
    case "null":
    case "any":
    case "unknown":
    case "never":
    case "void":
    case "literal":
    case "enum":
    case "nan":
    case "file":
    case "template_literal":
      return false;
    case "array": {
      return isTransforming(def.element, ctx);
    }
    case "object": {
      for (const key in def.shape) {
        if (isTransforming(def.shape[key]!, ctx)) return true;
      }
      return false;
    }
    case "union": {
      for (const option of def.options) {
        if (isTransforming(option, ctx)) return true;
      }
      return false;
    }
    case "intersection": {
      return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
    }
    case "tuple": {
      for (const item of def.items) {
        if (isTransforming(item, ctx)) return true;
      }
      if (def.rest && isTransforming(def.rest, ctx)) return true;
      return false;
    }
    case "record": {
      return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
    }
    case "map": {
      return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
    }
    case "set": {
      return isTransforming(def.valueType, ctx);
    }

    // inner types
    case "promise":
    case "optional":
    case "nonoptional":
    case "nullable":
    case "readonly":
      return isTransforming(def.innerType, ctx);
    case "lazy":
      return isTransforming(def.getter(), ctx);
    case "default": {
      return isTransforming(def.innerType, ctx);
    }
    case "prefault": {
      return isTransforming(def.innerType, ctx);
    }
    case "custom": {
      return false;
    }
    case "transform": {
      return true;
    }
    case "pipe": {
      return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
    }
    case "success": {
      return false;
    }
    case "catch": {
      return false;
    }
    case "function": {
      return false;
    }

    default:
      def satisfies never;
  }
  throw new Error(`Unknown schema type: ${(def as any).type}`);
}
