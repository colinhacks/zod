import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
export interface ZodIntersectionDef<T extends z.ZodTypeAny = z.ZodTypeAny, U extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.intersection;
    left: T;
    right: U;
}
export declare class ZodIntersection<T extends z.ZodTypeAny, U extends z.ZodTypeAny> extends z.ZodType<T['_type'] & U['_type'], ZodIntersectionDef<T, U>> {
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    toJSON: () => {
        t: z.ZodTypes.intersection;
        left: object;
        right: object;
    };
    static create: <T_1 extends z.ZodTypeAny, U_1 extends z.ZodTypeAny>(left: T_1, right: U_1) => ZodIntersection<T_1, U_1>;
}
