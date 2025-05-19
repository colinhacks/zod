import type { LanguageModelV1 } from "@ai-sdk/provider";
import { generateObject } from "ai";
import type { z } from "zod";

export function myFn<T>(model: LanguageModelV1, schema: z.Schema<T>) {
  return generateObject({ model, schema });
}

myFn;
