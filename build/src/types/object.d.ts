import * as objectUtil from '../helpers/objectUtil';
import * as partialUtil from '../helpers/partialUtil';
import * as z from './base';
import { ZodNull } from './null';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';
export interface ZodObjectDef<T extends z.ZodRawShape = z.ZodRawShape, Params extends ZodObjectParams = ZodObjectParams> extends z.ZodTypeDef {
    t: z.ZodTypes.object;
    shape: T;
    params: Params;
}
interface ZodObjectParams {
    strict: boolean;
}
declare type SetKey<Target extends object, Key extends string, Value extends any> = objectUtil.Flatten<{
    [k in Exclude<keyof Target, Key>]: Target[k];
} & {
    [k in Key]: Value;
}>;
declare type ZodObjectType<T extends z.ZodRawShape, Params extends ZodObjectParams> = Params['strict'] extends true ? objectUtil.ObjectType<T> : objectUtil.Flatten<objectUtil.ObjectType<T> & {
    [k: string]: any;
}>;
export declare class ZodObject<T extends z.ZodRawShape, Params extends ZodObjectParams = {
    strict: true;
}> extends z.ZodType<ZodObjectType<T, Params>, // { [k in keyof T]: T[k]['_type'] },
ZodObjectDef<T, Params>> {
    readonly _shape: T;
    private readonly _params;
    get shape(): T;
    get params(): Params;
    toJSON: () => {
        t: z.ZodTypes.object;
        shape: {
            [x: string]: any;
        }[];
    };
    nonstrict: () => ZodObject<T, SetKey<Params, 'strict', false>>;
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    augment: <Augmentation extends z.ZodRawShape>(augmentation: Augmentation) => ZodObject<{ [k in Exclude<keyof T, keyof Augmentation>]: T[k]; } & { [k_1 in keyof Augmentation]: Augmentation[k_1]; }, Params>;
    extend: <Augmentation extends z.ZodRawShape>(augmentation: Augmentation) => ZodObject<{ [k in Exclude<keyof T, keyof Augmentation>]: T[k]; } & { [k_1 in keyof Augmentation]: Augmentation[k_1]; }, Params>;
    /**
     * Prior to zod@1.0.12 there was a bug in the
     * inferred type of merged objects. Please
     * upgrade if you are experiencing issues.
     */
    merge: <MergeShape extends z.ZodRawShape, MergeParams extends ZodObjectParams>(other: ZodObject<MergeShape, MergeParams>) => ZodObject<T & MergeShape, objectUtil.MergeObjectParams<Params, MergeParams>>;
    pick: <Mask extends { [k in keyof T]?: true | undefined; }>(mask: Mask) => ZodObject<{ [k_1 in keyof Mask]: k_1 extends keyof T ? T[k_1] : never; }, Params>;
    omit: <Mask extends { [k in keyof T]?: true | undefined; }>(mask: Mask) => ZodObject<{ [k_1 in keyof T]: k_1 extends keyof Mask ? never : T[k_1]; }, Params>;
    partial: () => ZodObject<{ [k in keyof T]: ZodUnion<[T[k], ZodUndefined]>; }, Params>;
    deepPartial: () => partialUtil.RootDeepPartial<ZodObject<T>>;
    static create: <T_1 extends z.ZodRawShape>(shape: T_1) => ZodObject<T_1, {
        strict: true;
    }>;
}
export {};
