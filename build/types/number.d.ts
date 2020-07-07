import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
export interface ZodNumberDef extends z.ZodTypeDef {
    t: z.ZodTypes.number;
}
export declare class ZodNumber extends z.ZodType<number, ZodNumberDef> {
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    toJSON: () => ZodNumberDef;
    static create: () => ZodNumber;
    min: (minimum: number, msg?: string | undefined) => this;
    max: (maximum: number, msg?: string | undefined) => this;
    int: (msg?: string | undefined) => this;
    positive: (msg?: string | undefined) => this;
    negative: (msg?: string | undefined) => this;
    nonpositive: (msg?: string | undefined) => this;
    nonnegative: (msg?: string | undefined) => this;
}
