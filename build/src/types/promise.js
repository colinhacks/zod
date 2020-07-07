"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodPromise = void 0;
const z = require("./base");
const undefined_1 = require("./undefined");
const null_1 = require("./null");
const union_1 = require("./union");
class ZodPromise extends z.ZodType {
    constructor() {
        super(...arguments);
        this.toJSON = () => {
            return {
                t: this._def.t,
                type: this._def.type.toJSON(),
            };
        };
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
    }
}
exports.ZodPromise = ZodPromise;
ZodPromise.create = (schema) => {
    return new ZodPromise({
        t: z.ZodTypes.promise,
        type: schema,
    });
};
//# sourceMappingURL=promise.js.map