import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
export interface ZodPromiseDef<T extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.promise;
    type: T;
}
export declare class ZodPromise<T extends z.ZodTypeAny> extends z.ZodType<Promise<T['_type']>, ZodPromiseDef<T>> {
    toJSON: () => {
        t: z.ZodTypes.promise;
        type: object;
    };
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    static create: <T_1 extends z.ZodTypeAny>(schema: T_1) => ZodPromise<T_1>;
}
