import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
export interface ZodStringDef extends z.ZodTypeDef {
    t: z.ZodTypes.string;
    validation: {
        uuid?: true;
        custom?: ((val: any) => boolean)[];
    };
}
export declare class ZodString extends z.ZodType<string, ZodStringDef> {
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    toJSON: () => ZodStringDef;
    min: (minLength: number, msg?: string | undefined) => this;
    max: (maxLength: number, msg?: string | undefined) => this;
    length: (len: number, msg?: string | undefined) => this;
    email: (msg?: string | undefined) => this;
    url: (msg?: string | undefined) => this;
    nonempty: (msg?: string | undefined) => this;
    static create: () => ZodString;
}
