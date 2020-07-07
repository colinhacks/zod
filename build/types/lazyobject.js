"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodLazyObject = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const z = require("./base");
class ZodLazyObject extends z.ZodType {
    constructor() {
        super(...arguments);
        this.optional = () => {
            return this;
        };
        this.nullable = () => {
            return this;
        };
        this.toJSON = () => {
            throw new Error("Can't JSONify recursive structure");
        };
        this.augment = (arg) => {
            return ZodLazyObject.create(() => this._def.getter().augment(arg));
        };
        //  static recursion = <Rels extends { [k: string]: any }, T extends ZodObject<any>>(
        //    getter: () => T,
        //  ) => {};
    }
    get schema() {
        return this._def.getter();
    }
}
exports.ZodLazyObject = ZodLazyObject;
ZodLazyObject.create = (getter) => {
    return new ZodLazyObject({
        t: z.ZodTypes.lazyobject,
        getter,
    });
};
// type
//# sourceMappingURL=lazyobject.js.map