import { ParseParams } from '../parser';
export declare enum ZodTypes {
    string = "string",
    number = "number",
    bigint = "bigint",
    boolean = "boolean",
    date = "date",
    undefined = "undefined",
    null = "null",
    array = "array",
    object = "object",
    union = "union",
    generic = "dependent",
    intersection = "intersection",
    tuple = "tuple",
    record = "record",
    function = "function",
    lazy = "lazy",
    lazyobject = "lazyobject",
    literal = "literal",
    enum = "enum",
    promise = "promise",
    any = "any",
    unknown = "unknown"
}
export declare type ZodTypeAny = ZodType<any>;
export declare type ZodRawShape = {
    [k: string]: ZodTypeAny;
};
declare type Check<T> = {
    message?: string;
    check: (arg: T) => boolean;
};
export interface ZodTypeDef {
    t: ZodTypes;
    checks?: Check<any>[];
}
export declare type TypeOf<T extends {
    _type: any;
}> = T['_type'];
export declare type Infer<T extends {
    _type: any;
}> = T['_type'];
export declare abstract class ZodType<Type, Def extends ZodTypeDef = ZodTypeDef> {
    readonly _type: Type;
    readonly _def: Def;
    parse: (x: Type | unknown, params?: ParseParams) => Type;
    is(u: Type): u is Type;
    check(u: Type | unknown): u is Type;
    refine: <Val extends (arg: this['_type']) => any>(check: Val, message?: string) => this;
    constructor(def: Def);
    abstract toJSON: () => object;
    abstract optional: () => any;
    abstract nullable: () => any;
}
export {};
