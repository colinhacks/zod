"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodLazyObject = void 0;
const z = require("./base");
class ZodLazyObject extends z.ZodType {
    constructor() {
        super(...arguments);
        this.optional = () => {
            console.log('nullable does nothing on ZodLazyObject');
            return this;
        }; // ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
        this.nullable = () => {
            console.log('nullable does nothing on ZodLazyObject');
            return this;
        }; // ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
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