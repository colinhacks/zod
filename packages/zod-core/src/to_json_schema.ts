// import type { $ZodType } from "./base.js";
// import type * as schemas from "./schemas.js";

// function* integers() {
//   let n = 0;
//   while (true) {
//     yield ++n;
//   }
// }

// type asdf = Generator;

// export namespace JSONSchema {
//   export type Schema =
//     // | boolean
//     ObjectSchema | ArraySchema | StringSchema | NumberSchema | IntegerSchema | BooleanSchema | NullSchema;

//   export interface BaseSchema {
//     $id?: string;
//     $schema?: string;
//     $ref?: string;
//     $anchor?: string;
//     $defs?: { [key: string]: Schema };
//     $comment?: string;
//     title?: string;
//     description?: string;
//     default?: unknown;
//     examples?: unknown[];
//     readOnly?: boolean;
//     writeOnly?: boolean;
//     deprecated?: boolean;
//     allOf?: Schema[];
//     anyOf?: Schema[];
//     oneOf?: Schema[];
//     not?: Schema;
//     if?: Schema;
//     then?: Schema;
//     else?: Schema;

//     // Zod-specific
//     // catch?: unknown;
//   }

//   export interface ObjectSchema extends BaseSchema {
//     type: "object";
//     properties?: { [key: string]: Schema };
//     // patternProperties?: { [key: string]: Schema };
//     additionalProperties?: Schema | boolean;
//     required?: string[];
//     // dependentRequired?: { [key: string]: string[] };
//     // propertyNames?: Schema;
//     minProperties?: number;
//     maxProperties?: number;
//     // unevaluatedProperties?: Schema | boolean;
//     // dependentSchemas?: { [key: string]: Schema };
//   }

//   export interface ArraySchema extends BaseSchema {
//     type: "array";
//     items?: Schema;
//     prefixItems?: Schema[];
//     // additionalItems?: Schema | boolean; (deprecated)
//     contains?: Schema;
//     minItems?: number;
//     maxItems?: number;
//     minContains?: number;
//     maxContains?: number;
//     uniqueItems?: boolean;
//     unevaluatedItems?: Schema | boolean;
//   }

//   export interface StringSchema extends BaseSchema {
//     type: "string";
//     minLength?: number;
//     maxLength?: number;
//     pattern?: string;
//     format?: string;
//     // contentEncoding?: string;
//     // contentMediaType?: string;
//   }

//   export interface NumberSchema extends BaseSchema {
//     type: "number";
//     minimum?: number;
//     maximum?: number;
//     exclusiveMinimum?: number;
//     exclusiveMaximum?: number;
//     multipleOf?: number;
//   }

//   export interface IntegerSchema extends BaseSchema {
//     type: "integer";
//     minimum?: number;
//     maximum?: number;
//     exclusiveMinimum?: number;
//     exclusiveMaximum?: number;
//     multipleOf?: number;
//   }

//   export interface BooleanSchema extends BaseSchema {
//     type: "boolean";
//   }

//   export interface NullSchema extends BaseSchema {
//     type: "null";
//   }
// }

// export type $ZodFirstPartyTypes =
//   | schemas.$ZodString
//   // | schemas.$ZodStringFormat
//   // | schemas.$ZodGUID
//   // | schemas.$ZodUUID
//   // | schemas.$ZodEmail
//   // | schemas.$ZodURL
//   // | schemas.$ZodEmoji
//   // | schemas.$ZodNanoID
//   // | schemas.$ZodCUID
//   // | schemas.$ZodCUID2
//   // | schemas.$ZodULID
//   // | schemas.$ZodXID
//   // | schemas.$ZodKSUID
//   // | schemas.$ZodISODateTime
//   // | schemas.$ZodISODate
//   // | schemas.$ZodISOTime
//   // | schemas.$ZodISODuration
//   // | schemas.$ZodIP
//   // | schemas.$ZodBase64
//   // | schemas.$ZodJSONString
//   // | schemas.$ZodE164
//   // | schemas.$ZodJWT
//   | schemas.$ZodNumber
//   | schemas.$ZodNumberFormat
//   | schemas.$ZodBoolean
//   | schemas.$ZodBigInt
//   | schemas.$ZodBigIntFormat
//   | schemas.$ZodSymbol
//   | schemas.$ZodUndefined
//   | schemas.$ZodNull
//   | schemas.$ZodAny
//   | schemas.$ZodUnknown
//   | schemas.$ZodNever
//   | schemas.$ZodVoid
//   | schemas.$ZodDate
//   | schemas.$ZodArray
//   | schemas.$ZodObjectLike
//   // | schemas.$ZodInterface
//   // | schemas.$ZodObject
//   | schemas.$ZodUnion
//   // | schemas.$ZodDiscriminatedUnion
//   | schemas.$ZodIntersection
//   | schemas.$ZodTuple
//   | schemas.$ZodRecord
//   | schemas.$ZodMap
//   | schemas.$ZodSet
//   | schemas.$ZodEnum
//   | schemas.$ZodLiteral
//   | schemas.$ZodFile
//   | schemas.$ZodTransform
//   | schemas.$ZodOptional
//   | schemas.$ZodNullable
//   | schemas.$ZodNonOptional
//   | schemas.$ZodSuccess
//   | schemas.$ZodDefault
//   | schemas.$ZodCatch
//   | schemas.$ZodNaN
//   | schemas.$ZodPipe
//   | schemas.$ZodReadonly
//   | schemas.$ZodTemplateLiteral
//   | schemas.$ZodPromise
//   | schemas.$ZodCustom;

// export function toJSONSchema(_schema: $ZodType): JSONSchema.Schema {
//   const schema = _schema as $ZodFirstPartyTypes;

//   // if (schema["_def"].type === "string") {
//   // } else if (schema["_def"].type === "number") {
//   // } else if (schema["_def"].type === "boolean") {
//   // } else if (schema["_def"].type === "bigint") {
//   // } else if (schema["_def"].type === "symbol") {
//   // } else if (schema["_def"].type === "undefined") {
//   // } else if (schema["_def"].type === "null") {
//   // } else if (schema["_def"].type === "any") {
//   // } else if (schema["_def"].type === "unknown") {
//   // } else if (schema["_def"].type === "never") {
//   // } else if (schema["_def"].type === "date") {
//   // } else if (schema["_def"].type === "array") {
//   // } else if (schema["_def"].type === "object") {
//   // } else if (schema["_def"].type === "intersection") {
//   // } else if (schema["_def"].type === "set") {
//   // } else if (schema["_def"].type === "enum") {
//   // }
//   // // else if(schema["_def"].type === "enum") {}
//   // else if (schema["_def"].type === "file") {
//   // } else if (schema["_def"].type === "effect") {
//   // } else if (schema["_def"].type === "optional") {
//   // } else if (schema["_def"].type === "nullable") {
//   // } else if (schema["_def"].type === "required") {
//   // } else if (schema["_def"].type === "success") {
//   // } else if (schema["_def"].type === "default") {
//   // } else if (schema["_def"].type === "catch") {
//   // } else if (schema["_def"].type === "nan") {
//   // } else if (schema["_def"].type === "pipe") {
//   // } else if (schema["_def"].type === "readonly") {
//   // } else if (schema["_def"].type === "template_literal") {
//   // } else if (schema["_def"].type === "promise") {
//   // } else if (schema["_def"].type === "custom") {
//   // } else {
//   //   schema["_def"].type === "";
//   // }
//   const def = schema._def;
//   const jsonSchema: any = {};
//   switch (def.type) {
//     case "string": {
//       jsonSchema.type = "string";
//       if (schema._computed.minimum) jsonSchema.minLength = schema._computed.minimum;
//       if (schema._computed.maximum) jsonSchema.maxLength = schema._computed.maximum;

//       break;
//     }
//     case "number": {
//       return {
//         type: "number",
//       };
//     }
//     case "boolean": {
//       break;
//     }
//     case "bigint": {
//       break;
//     }
//     case "symbol": {
//       break;
//     }
//     case "undefined": {
//       break;
//     }
//     case "null": {
//       break;
//     }
//     case "any": {
//       break;
//     }
//     case "unknown": {
//       break;
//     }
//     case "never": {
//       break;
//     }
//     case "void": {
//       break;
//     }
//     case "date": {
//       break;
//     }
//     case "array": {
//       break;
//     }
//     case "object":
//     case "interface": {
//       break;
//     }
//     case "union": {
//       break;
//     }
//     case "intersection": {
//       break;
//     }
//     case "tuple": {
//       break;
//     }
//     case "record": {
//       break;
//     }
//     case "map": {
//       break;
//     }
//     case "set": {
//       break;
//     }
//     case "enum": {
//       break;
//     }
//     case "literal": {
//       break;
//     }
//     case "file": {
//       break;
//     }
//     case "effect": {
//       break;
//     }
//     case "optional": {
//       break;
//     }
//     case "nullable": {
//       break;
//     }
//     case "required": {
//       break;
//     }
//     case "success": {
//       break;
//     }
//     case "default": {
//       break;
//     }
//     case "catch": {
//       break;
//     }
//     case "nan": {
//       break;
//     }
//     case "pipe": {
//       break;
//     }
//     case "readonly": {
//       break;
//     }
//     case "template_literal": {
//       break;
//     }
//     case "promise": {
//       break;
//     }
//     case "custom": {
//       break;
//     }
//     default: {
//       def satisfies never;
//     }
//   }
//   return {} as any;
// }
