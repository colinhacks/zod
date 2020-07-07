"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodAny = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const z = require("./base");
const null_1 = require("./null");
const undefined_1 = require("./undefined");
const union_1 = require("./union");
class ZodAny extends z.ZodType {
    constructor() {
        super(...arguments);
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
        this.toJSON = () => this._def;
    }
}
exports.ZodAny = ZodAny;
ZodAny.create = () => {
    return new ZodAny({
        t: z.ZodTypes.any,
    });
};
//# sourceMappingURL=any.js.map