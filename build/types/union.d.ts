import * as z from './base';
import { ZodNull } from './null';
import { ZodUndefined } from './undefined';
export interface ZodUnionDef<T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]] = [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]> extends z.ZodTypeDef {
    t: z.ZodTypes.union;
    options: T;
}
export declare class ZodUnion<T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]> extends z.ZodType<T[number]['_type'], ZodUnionDef<T>> {
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    toJSON: () => {
        t: z.ZodTypes.union;
        options: object[];
    };
    static create: <T_1 extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>(types: T_1) => ZodUnion<T_1>;
    static make: <T_1 extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>(...types: T_1) => ZodUnion<T_1>;
}
