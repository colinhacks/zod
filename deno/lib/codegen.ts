// import * as z from './index';

import { util } from "./helpers/util.ts";
import { ZodDef, ZodType, ZodTypes } from "./index.ts";
// import { ZodTypes } from "./ZodTypes";

type TypeResult = { schema: any; id: string; type: string };

const isOptional = (schema: ZodType<any, any>): boolean => {
  // const def: z.ZodDef = schema._def;
  // if (def.t === ZodTypes.undefined) return true;
  // else if (def.t === ZodTypes.intersection) {
  //   return isOptional(def.right) && isOptional(def.left);
  // } else if (def.t === ZodTypes.union) {
  //   return def.options.map(isOptional).some(x => x === true);
  // }
  // return false;

  return schema.isOptional();
};

export class ZodCodeGenerator {
  seen: TypeResult[] = [];
  serial = 0;

  randomId = () => {
    return `IZod${this.serial++}`;
  };

  findBySchema = (schema: ZodType<any, any>) => {
    return this.seen.find((s) => s.schema === schema);
  };

  findById = (id: string) => {
    const found = this.seen.find((s) => s.id === id);
    if (!found) throw new Error(`Unfound ID: ${id}`);
    return found;
  };

  dump = () => {
    return `
type Identity<T> = T;

${this.seen
  .map((item) => `type ${item.id} = Identity<${item.type}>;`)
  .join("\n\n")}
`;
  };

  setType = (id: string, type: string) => {
    const found = this.findById(id);
    found.type = type;
    return found;
  };

  generate = (schema: ZodType<any, any>): TypeResult => {
    const found = this.findBySchema(schema);
    if (found) return found;

    const def: ZodDef = schema._def;

    const id = this.randomId();

    const ty = {
      schema,
      id,
      type: `__INCOMPLETE__`,
    };

    this.seen.push(ty);

    switch (def.t) {
      case ZodTypes.string:
        return this.setType(id, `string`);
      case ZodTypes.number:
        return this.setType(id, `number`);
      case ZodTypes.bigint:
        return this.setType(id, `bigint`);
      case ZodTypes.boolean:
        return this.setType(id, `boolean`);
      case ZodTypes.date:
        return this.setType(id, `Date`);
      case ZodTypes.undefined:
        return this.setType(id, `undefined`);
      case ZodTypes.null:
        return this.setType(id, `null`);
      case ZodTypes.any:
        return this.setType(id, `any`);
      case ZodTypes.unknown:
        return this.setType(id, `unknown`);
      case ZodTypes.never:
        return this.setType(id, `never`);
      case ZodTypes.void:
        return this.setType(id, `void`);
      case ZodTypes.literal:
        const val = def.value;
        const literalType = typeof val === "string" ? `"${val}"` : `${val}`;
        return this.setType(id, literalType);
      case ZodTypes.enum:
        return this.setType(id, def.values.map((v) => `"${v}"`).join(" | "));
      case ZodTypes.object:
        const objectLines: string[] = [];
        const shape = def.shape();

        for (const key in shape) {
          const childSchema = shape[key];
          const childType = this.generate(childSchema);
          const OPTKEY = isOptional(childSchema) ? "?" : "";
          objectLines.push(`${key}${OPTKEY}: ${childType.id}`);
        }
        const baseStruct = `{\n${objectLines
          .map((line) => `  ${line};`)
          .join("\n")}\n}`;
        this.setType(id, `${baseStruct}`);
        break;
      case ZodTypes.tuple:
        const tupleLines: string[] = [];
        for (const elSchema of def.items) {
          const elType = this.generate(elSchema);
          tupleLines.push(elType.id);
        }
        const baseTuple = `[\n${tupleLines
          .map((line) => `  ${line},`)
          .join("\n")}\n]`;
        return this.setType(id, `${baseTuple}`);
      case ZodTypes.array:
        return this.setType(id, `${this.generate(def.type).id}[]`);
      case ZodTypes.function:
        const args = this.generate(def.args);
        const returns = this.generate(def.returns);
        return this.setType(id, `(...args: ${args.id})=>${returns.id}`);
      case ZodTypes.promise:
        const promValue = this.generate(def.type);
        return this.setType(id, `Promise<${promValue.id}>`);
      case ZodTypes.union:
        const unionLines: string[] = [];
        for (const elSchema of def.options) {
          const elType = this.generate(elSchema);
          unionLines.push(elType.id);
        }
        return this.setType(id, unionLines.join(` | `));
      case ZodTypes.intersection:
        return this.setType(
          id,
          `${this.generate(def.left).id} & ${this.generate(def.right).id}`
        );
      case ZodTypes.record:
        return this.setType(
          id,
          `{[k:string]: ${this.generate(def.valueType).id}}`
        );

      case ZodTypes.map:
        return this.setType(
          id,
          `Map<${this.generate(def.keyType).id}, ${
            this.generate(def.valueType).id
          }>`
        );
      case ZodTypes.set:
        return this.setType(id, `Set<${this.generate(def.valueType).id}>`);
      case ZodTypes.lazy:
        const lazyType = def.getter();
        return this.setType(id, this.generate(lazyType).id);
      case ZodTypes.nativeEnum:
        // const lazyType = def.getter();
        return this.setType(id, "asdf");
      case ZodTypes.optional:
        return this.setType(
          id,
          `${this.generate(def.innerType).id} | undefined`
        );
      case ZodTypes.nullable:
        return this.setType(id, `${this.generate(def.innerType).id} | null`);
      case ZodTypes.transformer:
        return this.setType(id, `${this.generate(def.schema).id}`);
      default:
        util.assertNever(def);
    }
    return this.findById(id);
  };

  static create = () => new ZodCodeGenerator();
}
