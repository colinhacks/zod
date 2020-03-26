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
var union_1 = require("./union");
var null_1 = require("./null");
var ZodUndefined = /** @class */ (function (_super) {
    __extends(ZodUndefined, _super);
    function ZodUndefined() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.toJSON = function () { return _this._def; };
        _this.optional = function () { return union_1.ZodUnion.create([_this, ZodUndefined.create()]); };
        _this.nullable = function () { return union_1.ZodUnion.create([_this, null_1.ZodNull.create()]); };
        return _this;
    }
    ZodUndefined.create = function () {
        return new ZodUndefined({
            t: z.ZodTypes.undefined
        });
    };
    return ZodUndefined;
}(z.ZodType));
exports.ZodUndefined = ZodUndefined;
