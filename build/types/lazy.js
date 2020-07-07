"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodLazy = void 0;
const z = require("./base");
const undefined_1 = require("./undefined");
const null_1 = require("./null");
const union_1 = require("./union");
class ZodLazy extends z.ZodType {
    constructor() {
        super(...arguments);
        this.optional = () => union_1.ZodUnion.create([this, undefined_1.ZodUndefined.create()]);
        this.nullable = () => union_1.ZodUnion.create([this, null_1.ZodNull.create()]);
        this.toJSON = () => {
            throw new Error("Can't JSONify recursive structure");
        };
        //  static recursion = <Rels extends { [k: string]: any }, T extends ZodObject<any>>(
        //    getter: () => T,
        //  ) => {};
    }
    get schema() {
        return this._def.getter();
    }
}
exports.ZodLazy = ZodLazy;
ZodLazy.create = (getter) => {
    return new ZodLazy({
        t: z.ZodTypes.lazy,
        getter,
    });
};
// type
//# sourceMappingURL=lazy.js.map