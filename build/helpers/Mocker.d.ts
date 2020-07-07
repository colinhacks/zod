export declare class Mocker {
    pick: (...args: any[]) => any;
    get string(): string;
    get number(): number;
    get bigint(): bigint;
    get boolean(): boolean;
    get date(): Date;
    get null(): null;
    get undefined(): undefined;
    get stringOptional(): any;
    get stringNullable(): any;
    get numberOptional(): any;
    get numberNullable(): any;
    get booleanOptional(): any;
    get booleanNullable(): any;
}
