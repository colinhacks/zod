"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodFunction = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const z = require("./base");
const null_1 = require("./null");
const undefined_1 = require("./undefined");
const union_1 = require("./union");
class ZodFunction extends z.ZodType {
    constructor() {
        super(...arguments);
        // implement = this.parse;
        this.implement = (func) => {
            const validatedFunc = (...args) => {
                this._def.args.parse(args);
                const result = func(...args);
                this._def.returns.parse(result);
                return result;
            };
            return validatedFunc;
        };
        this.validate = this.implement;
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
        this.toJSON = () => {
            return {
                t: this._def.t,
                args: this._def.args.toJSON(),
                returns: this._def.returns.toJSON(),
            };
        };
    }
}
exports.ZodFunction = ZodFunction;
ZodFunction.create = (args, returns) => {
    return new ZodFunction({
        t: z.ZodTypes.function,
        args,
        returns,
    });
};
//# sourceMappingURL=function.js.map