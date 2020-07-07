import * as z from './base';
import { ZodNull } from './null';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';
export interface ZodBooleanDef extends z.ZodTypeDef {
    t: z.ZodTypes.boolean;
}
export declare class ZodBoolean extends z.ZodType<boolean, ZodBooleanDef> {
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    toJSON: () => ZodBooleanDef;
    static create: () => ZodBoolean;
}
