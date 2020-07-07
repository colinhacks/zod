import * as z from './base';
import { ZodNull } from './null';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';
export interface ZodAnyDef extends z.ZodTypeDef {
    t: z.ZodTypes.any;
}
export declare class ZodAny extends z.ZodType<any, ZodAnyDef> {
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    toJSON: () => ZodAnyDef;
    static create: () => ZodAny;
}
