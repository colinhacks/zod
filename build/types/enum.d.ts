import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
declare type EnumValues = [string, ...string[]];
declare type Values<T extends EnumValues> = {
    [k in T[number]]: k;
};
export interface ZodEnumDef<T extends EnumValues = EnumValues> extends z.ZodTypeDef {
    t: z.ZodTypes.enum;
    values: T;
}
export declare class ZodEnum<T extends [string, ...string[]]> extends z.ZodType<T[number], ZodEnumDef<T>> {
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    toJSON: () => ZodEnumDef<T>;
    get OptionsList(): T;
    get Values(): Values<T>;
    get Enum(): Values<T>;
    static create: <U extends string, T_1 extends [U, ...U[]]>(values: T_1) => ZodEnum<T_1>;
}
export {};
