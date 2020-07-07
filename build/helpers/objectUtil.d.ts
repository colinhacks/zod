import { ZodRawShape } from '../types/base';
import { ZodObject } from '../types/object';
export interface ZodObjectParams {
    strict: boolean;
}
export declare type MergeObjectParams<First extends ZodObjectParams, Second extends ZodObjectParams> = {
    strict: First['strict'] extends false ? false : Second['strict'] extends false ? false : true;
};
export declare type MergeShapes<U extends ZodRawShape, V extends ZodRawShape> = {
    [k in Exclude<keyof U, keyof V>]: U[k];
} & V;
export declare type Flatten<T extends object> = {
    [k in keyof T]: T[k];
};
declare type OptionalKeys<T extends object> = {
    [k in keyof T]: undefined extends T[k] ? k : never;
}[keyof T];
declare type RequiredKeys<T extends object> = Exclude<keyof T, OptionalKeys<T>>;
declare type AddQuestionMarks<T extends object> = {
    [k in OptionalKeys<T>]?: T[k];
} & {
    [k in RequiredKeys<T>]: T[k];
};
declare type ObjectIntersection<T extends ZodRawShape> = AddQuestionMarks<{
    [k in keyof T]: T[k]['_type'];
}>;
declare type Identity<T> = T;
declare type FlattenObject<T extends ZodRawShape> = Identity<{
    [k in keyof T]: T[k];
}>;
export declare type NoNeverKeys<T extends object> = {
    [k in keyof T]: T[k] extends never ? never : k;
}[keyof T];
export declare type NoNever<T extends object> = {
    [k in NoNeverKeys<T>]: T[k];
};
export declare type ObjectType<T extends ZodRawShape> = FlattenObject<ObjectIntersection<NoNever<T>>>;
export declare const mergeShapes: <U extends ZodRawShape, T extends ZodRawShape>(first: U, second: T) => T & U;
export declare const mergeObjects: <FirstShape extends ZodRawShape, FirstParams extends ZodObjectParams>(first: ZodObject<FirstShape, FirstParams>) => <SecondShape extends ZodRawShape, SecondParams extends ZodObjectParams>(second: ZodObject<SecondShape, SecondParams>) => ZodObject<FirstShape & SecondShape, MergeObjectParams<FirstParams, SecondParams>>;
export {};
