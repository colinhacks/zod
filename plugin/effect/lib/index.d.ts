import { Effect } from "effect";
import * as z from "zod";
declare module "zod" {
    interface ZodType {
        effect(data: unknown): Effect.Effect<this["_output"], z.ZodError<this["_output"]>, never>;
        effectSync(data: unknown): Effect.Effect<this["_output"], z.ZodError<this["_output"]>, never>;
    }
    interface ZodError {
        _tag: "ZodError";
    }
}
