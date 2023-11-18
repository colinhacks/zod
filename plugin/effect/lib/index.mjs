import { Effect } from 'effect';
import * as z from 'zod';

function zodEffect(data) {
    return Effect.tryPromise({
        try: async () => this.parseAsync(data),
        catch(error) {
            return error; // only kinda a lie...
        },
    });
}
function zodEffectSync(data) {
    return Effect.try({
        try: () => this.parse(data),
        catch(error) {
            return error; // only kinda a lie...
        },
    });
}
const sym = Symbol.for("zod_effect_executed");
if (!globalThis[sym]) {
    globalThis[sym] = true;
    z.ZodType.prototype.effect = zodEffect;
    z.ZodType.prototype.effectSync = zodEffectSync;
    z.ZodError.prototype._tag = "ZodError";
}
