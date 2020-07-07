import * as objectUtil from '../helpers/objectUtil';
import * as partialUtil from '../helpers/partialUtil';
import * as z from './base';
import { ZodNull } from './null';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';
declare type Mask<T extends z.ZodRawShape> = true | {
    [k in keyof T]?: T[k] extends ZodObjectType<infer S, infer _> ? Mask<S> : true;
};
declare type MaskPick<T extends z.ZodRawShape, M extends Mask<T>> = M extends true ? T : {
    [k in keyof M]: k extends keyof T ? M[k] extends true ? T[k] : T[k] extends ZodObjectType<infer S, infer _> ? M[k] extends infer Y ? Y extends Mask<S> ? MaskPick<S, Y> : never : never : never : never;
};
declare type MaskOmit<T extends z.ZodRawShape, M extends Mask<T>> = M extends true ? never : {
    [k in keyof T]: k extends keyof M ? M[k] extends true ? never : T[k] extends ZodObjectType<infer S, infer _> ? M[k] extends infer Y ? Y extends Mask<S> ? MaskOmit<S, Y> : T[k] : T[k] : T[k] : T[k];
};
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
    pick: <M extends Mask<T>>(mask: M) => ZodObject<MaskPick<T, M>, Params>;
    omit: <M extends Mask<T>>(mask: M) => ZodObject<MaskOmit<T, M>, Params>;
    partial: () => ZodObject<{ [k in keyof T]: ZodUnion<[T[k], ZodUndefined]>; }, Params>;
    deepPartial: () => partialUtil.RootDeepPartial<ZodObject<T>>;
    static create: <T_1 extends z.ZodRawShape>(shape: T_1) => ZodObject<T_1, {
        strict: true;
    }>;
}
export {};
