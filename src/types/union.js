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
var ZodUnion = /** @class */ (function (_super) {
    __extends(ZodUnion, _super);
    function ZodUnion() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.optional = function () { return ZodUnion.create([_this, undefined_1.ZodUndefined.create()]); };
        _this.nullable = function () { return ZodUnion.create([_this, null_1.ZodNull.create()]); };
        _this.toJSON = function () { return ({
            t: _this._def.t,
            options: _this._def.options.map(function (x) { return x.toJSON(); })
        }); };
        return _this;
    }
    ZodUnion.create = function (types) {
        return new ZodUnion({
            t: z.ZodTypes.union,
            options: types
        });
    };
    return ZodUnion;
}(z.ZodType));
exports.ZodUnion = ZodUnion;
