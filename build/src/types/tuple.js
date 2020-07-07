"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodTuple = void 0;
const z = require("./base");
const union_1 = require("./union");
const undefined_1 = require("./undefined");
const null_1 = require("./null");
class ZodTuple extends z.ZodType {
    constructor() {
        super(...arguments);
        this.toJSON = () => ({
            t: this._def.t,
            items: this._def.items.map((item) => item.toJSON()),
        });
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
    }
}
exports.ZodTuple = ZodTuple;
ZodTuple.create = (schemas) => {
    return new ZodTuple({
        t: z.ZodTypes.tuple,
        items: schemas,
    });
};
//# sourceMappingURL=tuple.js.map