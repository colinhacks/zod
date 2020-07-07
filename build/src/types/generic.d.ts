import { ZodTypeAny } from '..';
import { ZodType, ZodTypeDef, ZodTypes } from './base';
import { ZodNull } from './null';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';
export interface ZodGenericDef<T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]] = [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]], U extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    t: ZodTypes.generic;
    options: ZodUnion<T>;
    body: (t: T[number]) => U;
}
export declare class ZodGeneric<T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]], U extends ZodTypeAny> extends ZodType<U, ZodGenericDef<T, U>> {
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    static create: <T_1 extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]], U_1 extends ZodTypeAny>(options: ZodUnion<T_1>, body: (t: T_1[number]) => U_1) => ZodGeneric<T_1, U_1>;
    toJSON: () => never;
}
