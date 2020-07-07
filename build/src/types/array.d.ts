import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
export interface ZodArrayDef<T extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.array;
    type: T;
    nonempty: boolean;
}
export declare class ZodArray<T extends z.ZodTypeAny> extends z.ZodType<T['_type'][], ZodArrayDef<T>> {
    toJSON: () => {
        t: z.ZodTypes.array;
        nonempty: boolean;
        type: object;
    };
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    min: (minLength: number, msg?: string | undefined) => this;
    max: (maxLength: number, msg?: string | undefined) => this;
    length: (len: number, msg?: string | undefined) => this;
    nonempty: () => ZodNonEmptyArray<T>;
    static create: <T_1 extends z.ZodTypeAny>(schema: T_1) => ZodArray<T_1>;
}
export declare class ZodNonEmptyArray<T extends z.ZodTypeAny> extends z.ZodType<[T['_type'], ...T['_type'][]], ZodArrayDef<T>> {
    toJSON: () => {
        t: z.ZodTypes.array;
        type: object;
    };
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
}
