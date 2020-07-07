import * as z from './base';
import { ZodNull } from './null';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';
export interface ZodUnknownDef extends z.ZodTypeDef {
    t: z.ZodTypes.unknown;
}
export declare class ZodUnknown extends z.ZodType<unknown, ZodUnknownDef> {
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    toJSON: () => ZodUnknownDef;
    static create: () => ZodUnknown;
}
