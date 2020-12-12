import { ZodTransformer } from "../transformer";
import { ZodType } from "./type";

export const inputSchema = (schema: ZodType<any>): ZodType<any> => {
  if (schema instanceof ZodTransformer) {
    return inputSchema(schema._def.input);
  } else {
    return schema;
  }
};

export const outputSchema = (schema: ZodType<any>): ZodType<any> => {
  if (schema instanceof ZodTransformer) {
    return inputSchema(schema._def.output);
  } else {
    return schema;
  }
};
