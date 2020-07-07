import * as z from './types/base';
export declare type ParseParams = {
    seen: {
        schema: any;
        objects: any[];
    }[];
};
export declare const ZodParser: (schemaDef: z.ZodTypeDef) => (obj: any, params?: ParseParams) => any;
