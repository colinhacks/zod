"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodType = exports.ZodTypes = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const parser_1 = require("../parser");
var ZodTypes;
(function (ZodTypes) {
    ZodTypes["string"] = "string";
    ZodTypes["number"] = "number";
    ZodTypes["bigint"] = "bigint";
    ZodTypes["boolean"] = "boolean";
    ZodTypes["date"] = "date";
    ZodTypes["undefined"] = "undefined";
    ZodTypes["null"] = "null";
    ZodTypes["array"] = "array";
    ZodTypes["object"] = "object";
    // interface = 'interface',
    ZodTypes["union"] = "union";
    ZodTypes["generic"] = "dependent";
    ZodTypes["intersection"] = "intersection";
    ZodTypes["tuple"] = "tuple";
    ZodTypes["record"] = "record";
    ZodTypes["function"] = "function";
    ZodTypes["lazy"] = "lazy";
    ZodTypes["lazyobject"] = "lazyobject";
    ZodTypes["literal"] = "literal";
    ZodTypes["enum"] = "enum";
    ZodTypes["promise"] = "promise";
    ZodTypes["any"] = "any";
    ZodTypes["unknown"] = "unknown";
})(ZodTypes = exports.ZodTypes || (exports.ZodTypes = {}));
class ZodType {
    // mask = <P extends maskUtil.Params<Type>>(_params: P): ZodType<maskUtil.Pick<Type, P>> => {
    //   return Masker(this, _params) as any;
    // };
    // pick = <Params extends maskUtil.Params<Type>>(_params: Params): maskUtil.Mask<Type, Params> => {
    //   return 'asdf' as any;
    // };
    constructor(def) {
        this.refine = (check, message = 'Invalid value.') => {
            // const newChecks = [...this._def.checks || [], { check, message }];
            // console.log((this as any).constructor);
            return new this.constructor({
                ...this._def,
                checks: [...(this._def.checks || []), { check, message }],
            });
            // return this;
        };
        this.parse = parser_1.ZodParser(def);
        this._def = def;
    }
    is(u) {
        try {
            this.parse(u);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    check(u) {
        try {
            this.parse(u);
            return true;
        }
        catch (err) {
            return false;
        }
    }
}
exports.ZodType = ZodType;
//# sourceMappingURL=base.js.map