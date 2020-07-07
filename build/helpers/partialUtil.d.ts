import * as z from '..';
import { ZodTypeAny } from '../types/base';
export declare type RootDeepPartial<T extends ZodTypeAny> = {
    object: T extends z.ZodObject<infer Shape, infer Params> ? z.ZodObject<{
        [k in keyof Shape]: DeepPartial<Shape[k]>;
    }, Params> : never;
    rest: z.ZodUnion<[T, z.ZodUndefined]>;
}[T extends z.ZodObject<any> ? 'object' : 'rest'];
export declare type DeepPartial<T extends ZodTypeAny> = {
    object: T extends z.ZodObject<infer Shape, infer Params> ? z.ZodUnion<[z.ZodObject<{
        [k in keyof Shape]: DeepPartial<Shape[k]>;
    }, Params>, z.ZodUndefined]> : never;
    rest: z.ZodUnion<[T, z.ZodUndefined]>;
}[T extends z.ZodObject<any> ? 'object' : 'rest'];
