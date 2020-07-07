declare type ZodErrorArray = {
    path: (string | number)[];
    message: string;
}[];
export declare class ZodError extends Error {
    errors: ZodErrorArray;
    constructor();
    static create: (errors: ZodErrorArray) => ZodError;
    get message(): string;
    get empty(): boolean;
    static fromString: (message: string) => ZodError;
    mergeChild: (pathElement: string | number, child: Error) => this;
    bubbleUp: (pathElement: string | number) => this;
    addError: (path: string | number, message: string) => this;
    merge: (error: ZodError) => this;
}
export {};
