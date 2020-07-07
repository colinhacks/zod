"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodIntersection = void 0;
const z = require("./base");
const undefined_1 = require("./undefined");
const null_1 = require("./null");
const union_1 = require("./union");
class ZodIntersection extends z.ZodType {
    constructor() {
        super(...arguments);
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
        this.toJSON = () => ({
            t: this._def.t,
            left: this._def.left.toJSON(),
            right: this._def.right.toJSON(),
        });
    }
}
exports.ZodIntersection = ZodIntersection;
ZodIntersection.create = (left, right) => {
    return new ZodIntersection({
        t: z.ZodTypes.intersection,
        left,
        right,
    });
};
//# sourceMappingURL=intersection.js.map