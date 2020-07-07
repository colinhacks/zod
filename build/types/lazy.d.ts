import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
export interface ZodLazyDef<T extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.lazy;
    getter: () => T;
}
export declare class ZodLazy<T extends z.ZodTypeAny> extends z.ZodType<z.TypeOf<T>, ZodLazyDef<T>> {
    get schema(): T;
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    toJSON: () => never;
    static create: <T_1 extends z.ZodTypeAny>(getter: () => T_1) => ZodLazy<T_1>;
}
