import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
export interface ZodRecordDef<Value extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.record;
    valueType: Value;
}
export declare class ZodRecord<Value extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodType<Record<string, Value['_type']>, // { [k in keyof T]: T[k]['_type'] },
ZodRecordDef<Value>> {
    readonly _value: Value;
    toJSON: () => {
        t: z.ZodTypes.record;
        valueType: object;
    };
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    static create: <Value_1 extends z.ZodTypeAny = z.ZodTypeAny>(valueType: Value_1) => ZodRecord<Value_1>;
}
