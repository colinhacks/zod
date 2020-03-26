"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var z = require("./base");
var undefined_1 = require("./undefined");
var null_1 = require("./null");
var union_1 = require("./union");
var ZodArray = /** @class */ (function (_super) {
    __extends(ZodArray, _super);
    function ZodArray() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.toJSON = function () {
            return {
                t: _this._def.t,
                nonempty: _this._def.nonempty,
                type: _this._def.type.toJSON()
            };
        };
        _this.optional = function () { return union_1.ZodUnion.create([_this, undefined_1.ZodUndefined.create()]); };
        _this.nullable = function () { return union_1.ZodUnion.create([_this, null_1.ZodNull.create()]); };
        _this.nonempty = function () {
            return new ZodNonEmptyArray(__assign(__assign({}, _this._def), { nonempty: true }));
        };
        return _this;
    }
    ZodArray.create = function (schema) {
        return new ZodArray({
            t: z.ZodTypes.array,
            type: schema,
            nonempty: false
        });
    };
    return ZodArray;
}(z.ZodType));
exports.ZodArray = ZodArray;
var ZodNonEmptyArray = /** @class */ (function (_super) {
    __extends(ZodNonEmptyArray, _super);
    function ZodNonEmptyArray() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.toJSON = function () {
            return {
                t: _this._def.t,
                type: _this._def.type.toJSON()
            };
        };
        _this.optional = function () { return union_1.ZodUnion.create([_this, undefined_1.ZodUndefined.create()]); };
        _this.nullable = function () { return union_1.ZodUnion.create([_this, null_1.ZodNull.create()]); };
        return _this;
    }
    ZodNonEmptyArray.create = function (schema) {
        return new ZodArray({
            t: z.ZodTypes.array,
            nonempty: true,
            type: schema
        });
    };
    return ZodNonEmptyArray;
}(z.ZodType));
exports.ZodNonEmptyArray = ZodNonEmptyArray;
