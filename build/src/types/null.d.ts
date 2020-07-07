import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';
export interface ZodNullDef extends z.ZodTypeDef {
    t: z.ZodTypes.null;
}
export declare class ZodNull extends z.ZodType<null, ZodNullDef> {
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    toJSON: () => ZodNullDef;
    static create: () => ZodNull;
}
