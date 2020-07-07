import * as z from './base';
import { ZodNull } from './null';
import { ZodTuple } from './tuple';
import { ZodUndefined } from './undefined';
import { ZodUnion } from './union';
export interface ZodFunctionDef<Args extends ZodTuple<any> = ZodTuple<any>, Returns extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.function;
    args: Args;
    returns: Returns;
}
export declare type TypeOfFunction<Args extends ZodTuple<any>, Returns extends z.ZodTypeAny> = Args['_type'] extends any[] ? (...args: Args['_type']) => Returns['_type'] : never;
export declare class ZodFunction<Args extends ZodTuple<any>, Returns extends z.ZodTypeAny> extends z.ZodType<TypeOfFunction<Args, Returns>, ZodFunctionDef> {
    readonly _def: ZodFunctionDef<Args, Returns>;
    readonly _type: TypeOfFunction<Args, Returns>;
    implement: (func: TypeOfFunction<Args, Returns>) => TypeOfFunction<Args, Returns>;
    validate: (func: TypeOfFunction<Args, Returns>) => TypeOfFunction<Args, Returns>;
    static create: <T extends ZodTuple<any>, U extends z.ZodTypeAny>(args: T, returns: U) => ZodFunction<T, U>;
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    toJSON: () => {
        t: z.ZodTypes.function;
        args: {
            t: z.ZodTypes.tuple;
            items: any[];
        };
        returns: object;
    };
}
