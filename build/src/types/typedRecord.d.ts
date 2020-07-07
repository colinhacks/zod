import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
import { ZodString } from './string';
import { ZodNumber } from './number';
declare type RecordKey = ZodString | ZodNumber;
export interface ZodRecordDef<Key extends RecordKey = ZodString, Value extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.record;
    keyType: Key;
    valueType: Value;
}
declare type ZodRecordType<Key extends RecordKey = ZodString, Value extends z.ZodTypeAny = z.ZodTypeAny> = Key extends ZodString ? Key extends ZodNumber ? Record<string | number, Value['_type']> : Record<string, Value['_type']> & {
    [k: number]: never;
} : Key extends ZodNumber ? Record<number, Value['_type']> & {
    [k: string]: never;
} : never;
export declare class ZodRecord<Key extends RecordKey = ZodString, Value extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodType<ZodRecordType<Key, Value>, // { [k in keyof T]: T[k]['_type'] },
ZodRecordDef<Key, Value>> {
    readonly _key: Key;
    readonly _value: Value;
    toJSON: () => {
        t: z.ZodTypes.record;
        keyType: import("./string").ZodStringDef | import("./number").ZodNumberDef;
        valueType: object;
    };
    optional: () => ZodUnion<[this, ZodUndefined]>;
    nullable: () => ZodUnion<[this, ZodNull]>;
    static create: <Key_1 extends ZodNumber | ZodString = ZodString, Value_1 extends z.ZodTypeAny = z.ZodTypeAny>(keyType: Key_1, valueType: Value_1) => ZodRecord<Key_1, Value_1>;
}
export {};
