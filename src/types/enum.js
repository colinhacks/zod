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
exports.__esModule = true;
var z = require("./base");
var undefined_1 = require("./undefined");
var null_1 = require("./null");
var union_1 = require("./union");
var ZodEnum = /** @class */ (function (_super) {
    __extends(ZodEnum, _super);
    function ZodEnum() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.optional = function () { return union_1.ZodUnion.create([_this, undefined_1.ZodUndefined.create()]); };
        _this.nullable = function () { return union_1.ZodUnion.create([_this, null_1.ZodNull.create()]); };
        _this.toJSON = function () { return _this._def; };
        return _this;
    }
    Object.defineProperty(ZodEnum.prototype, "Values", {
        get: function () {
            var enumValues = {};
            for (var _i = 0, _a = this._def.values; _i < _a.length; _i++) {
                var lit = _a[_i];
                enumValues[lit._def.value] = lit._def.value;
            }
            return enumValues;
        },
        enumerable: true,
        configurable: true
    });
    ZodEnum.create = function (values) {
        return new ZodEnum({
            t: z.ZodTypes["enum"],
            values: values
        });
    };
    return ZodEnum;
}(z.ZodType));
exports.ZodEnum = ZodEnum;
