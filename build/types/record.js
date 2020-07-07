"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodRecord = void 0;
const z = require("./base");
const undefined_1 = require("./undefined");
const null_1 = require("./null");
const union_1 = require("./union");
class ZodRecord extends z.ZodType {
    constructor() {
        super(...arguments);
        this.toJSON = () => ({
            t: this._def.t,
            valueType: this._def.valueType.toJSON(),
        });
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
    }
}
exports.ZodRecord = ZodRecord;
ZodRecord.create = (valueType) => {
    return new ZodRecord({
        t: z.ZodTypes.record,
        valueType,
    });
};
//# sourceMappingURL=record.js.map