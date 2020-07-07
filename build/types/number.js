"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodNumber = void 0;
const z = require("./base");
const undefined_1 = require("./undefined");
const null_1 = require("./null");
const union_1 = require("./union");
class ZodNumber extends z.ZodType {
    constructor() {
        super(...arguments);
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
        this.toJSON = () => this._def;
        this.min = (minimum, msg) => this.refine((data) => data >= minimum, msg || `Value must be >= ${minimum}`);
        this.max = (maximum, msg) => this.refine((data) => data <= maximum, msg || `Value must be <= ${maximum}`);
        this.int = (msg) => this.refine((data) => Number.isInteger(data), msg || 'Value must be an integer.');
        this.positive = (msg) => this.refine((data) => data > 0, msg || 'Value must be positive');
        this.negative = (msg) => this.refine((data) => data < 0, msg || 'Value must be negative');
        this.nonpositive = (msg) => this.refine((data) => data <= 0, msg || 'Value must be non-positive');
        this.nonnegative = (msg) => this.refine((data) => data >= 0, msg || 'Value must be non-negative');
    }
}
exports.ZodNumber = ZodNumber;
ZodNumber.create = () => {
    return new ZodNumber({
        t: z.ZodTypes.number,
    });
};
//# sourceMappingURL=number.js.map