export declare type AssertEqual<T, Expected> = T extends Expected ? (Expected extends T ? true : false) : false;
export declare function assertNever(_: never): never;
export declare const getObjectType: (value: unknown) => string | undefined;
