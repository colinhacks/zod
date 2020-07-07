import * as z from './base';
import { ZodNull } from './null';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';
export interface ZodBigIntDef extends z.ZodTypeDef {
    t: z.ZodTypes.bigint;
}
export declare class ZodBigInt extends z.ZodType<bigint, ZodBigIntDef> {
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    toJSON: () => ZodBigIntDef;
    static create: () => ZodBigInt;
}
