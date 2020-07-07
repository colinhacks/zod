import * as z from './base';
import { ZodUnion } from './union';
import { ZodNull } from './null';
export interface ZodUndefinedDef extends z.ZodTypeDef {
    t: z.ZodTypes.undefined;
}
export declare class ZodUndefined extends z.ZodType<undefined> {
    toJSON: () => z.ZodTypeDef;
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    static create: () => ZodUndefined;
}
