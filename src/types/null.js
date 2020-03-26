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
var union_1 = require("./union");
var ZodNull = /** @class */ (function (_super) {
    __extends(ZodNull, _super);
    function ZodNull() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.optional = function () { return union_1.ZodUnion.create([_this, undefined_1.ZodUndefined.create()]); };
        _this.nullable = function () { return union_1.ZodUnion.create([_this, ZodNull.create()]); };
        _this.toJSON = function () { return _this._def; };
        return _this;
    }
    ZodNull.create = function () {
        return new ZodNull({
            t: z.ZodTypes["null"]
        });
    };
    return ZodNull;
}(z.ZodType));
exports.ZodNull = ZodNull;
