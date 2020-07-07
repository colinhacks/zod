import * as z from './base';
import { ZodNull } from './null';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';
export interface ZodDateDef extends z.ZodTypeDef {
    t: z.ZodTypes.date;
}
export declare class ZodDate extends z.ZodType<Date, ZodDateDef> {
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    toJSON: () => ZodDateDef;
    static create: () => ZodDate;
}
