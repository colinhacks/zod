import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
import { Primitive } from '../helpers/primitive';
export interface ZodLiteralDef<T extends any = any> extends z.ZodTypeDef {
    t: z.ZodTypes.literal;
    value: T;
}
export declare class ZodLiteral<T extends any> extends z.ZodType<T, ZodLiteralDef<T>> {
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    toJSON: () => ZodLiteralDef<T>;
    static create: <T_1 extends Primitive>(value: T_1) => ZodLiteral<T_1>;
}
