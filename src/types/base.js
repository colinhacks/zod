"use strict";
exports.__esModule = true;
var parser_1 = require("../parser");
var ZodTypes;
(function (ZodTypes) {
    ZodTypes["string"] = "string";
    ZodTypes["number"] = "number";
    ZodTypes["boolean"] = "boolean";
    ZodTypes["undefined"] = "undefined";
    ZodTypes["null"] = "null";
    ZodTypes["array"] = "array";
    ZodTypes["object"] = "object";
    ZodTypes["interface"] = "interface";
    ZodTypes["union"] = "union";
    ZodTypes["intersection"] = "intersection";
    ZodTypes["tuple"] = "tuple";
    ZodTypes["function"] = "function";
    ZodTypes["lazy"] = "lazy";
    ZodTypes["literal"] = "literal";
    ZodTypes["enum"] = "enum";
})(ZodTypes = exports.ZodTypes || (exports.ZodTypes = {}));
//   interface Assertable<T> {
//     is(value: any): value is T;
//     assert(value: any): asserts value is T;
// }
var ZodType = /** @class */ (function () {
    // assert: zodAssertion<Type> = (value: unknown) => zodAssert(this, value);
    //  (u: unknown) => asserts u is Type = u => {
    //   try {
    //     this.parse(u);
    //   } catch (err) {
    //     throw new Error(err.message);
    //   }
    // };
    function ZodType(def) {
        this.parse = parser_1.ZodParser(def);
        this._def = def;
        // this._type = null as any as Type;
    }
    ZodType.prototype.is = function (u) {
        try {
            this.parse(u);
            return true;
        }
        catch (err) {
            return false;
        }
    };
    ZodType.prototype.check = function (u) {
        try {
            this.parse(u);
            return true;
        }
        catch (err) {
            return false;
        }
    };
    return ZodType;
}());
exports.ZodType = ZodType;
