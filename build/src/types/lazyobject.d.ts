import * as z from './base';
import { ZodObject } from './object';
export interface ZodLazyObjectDef<T extends ZodObject<any> = ZodObject<any>> extends z.ZodTypeDef {
    t: z.ZodTypes.lazyobject;
    getter: () => T;
}
export declare class ZodLazyObject<T extends ZodObject<any>> extends z.ZodType<z.TypeOf<T>, ZodLazyObjectDef<T>> {
    get schema(): T;
    optional: () => this;
    nullable: () => this;
    toJSON: () => never;
    static create: <T_1 extends ZodObject<any, {
        strict: true;
    }>>(getter: () => T_1) => ZodLazyObject<T_1>;
    augment: (arg: any) => ZodLazyObject<ZodObject<{} & {
        [x: string]: any;
    }, {
        strict: true;
    }>>;
}
