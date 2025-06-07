import { z } from "zod/v4";

export interface SortItem<T extends string> {
  key: T;
  order: string;
}

export const createSortItemSchema = <T extends z.ZodType<string>>(sortKeySchema: T) =>
  z.object({
    key: sortKeySchema,
    order: z.string(),
  });

const error = <T extends z.ZodType<string>>(sortKeySchema: T, defaultSortBy: SortItem<z.output<T>>[] = []) =>
  createSortItemSchema(sortKeySchema).array().default(defaultSortBy);

const readonlyArray = ["a", "b", "c"] as const;

const literalValidator = z.literal(readonlyArray);

const result = literalValidator.safeParse("d");
console.log(result);
