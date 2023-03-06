import { z } from "./src";

async function stripOuter<TData extends z.ZodTypeAny>(
  schema: TData,
  url: string
): Promise<TData["_output"]> {
  const zStrippedResponse = z
    .object({
      topLevelKey: schema,
    })
    .transform((data) => {
      return data.topLevelKey;
    });

  return fetch(url)
    .then((response) => response.json())
    .then((data) => zStrippedResponse.parse(data));
}

type asdf = Omit<{ a: string }, "b">;
