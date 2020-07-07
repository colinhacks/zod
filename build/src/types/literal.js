"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodLiteral = void 0;
const z = require("./base");
const undefined_1 = require("./undefined");
const null_1 = require("./null");
const union_1 = require("./union");
class ZodLiteral extends z.ZodType {
    constructor() {
        super(...arguments);
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
        this.toJSON = () => this._def;
    }
}
exports.ZodLiteral = ZodLiteral;
// static create = <U extends Primitive, T extends LiteralValue<U>>(value: T): ZodLiteral<T> => {
ZodLiteral.create = (value) => {
    return new ZodLiteral({
        t: z.ZodTypes.literal,
        value,
    });
};
//# sourceMappingURL=literal.js.map