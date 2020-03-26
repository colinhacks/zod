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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var ZodError = /** @class */ (function (_super) {
    __extends(ZodError, _super);
    function ZodError() {
        var _newTarget = this.constructor;
        var _this = _super.call(this) || this;
        _this.errors = [];
        _this.mergeChild = function (pathElement, child) {
            _this.merge(child.bubbleUp(pathElement));
        };
        _this.bubbleUp = function (pathElement) {
            return ZodError.create(_this.errors.map(function (err) {
                return { path: __spreadArrays([pathElement], err.path), message: err.message };
            }));
        };
        _this.addError = function (path, message) {
            _this.errors = __spreadArrays(_this.errors, [{ path: [path], message: message }]);
        };
        _this.merge = function (error) {
            _this.errors = __spreadArrays(_this.errors, error.errors);
        };
        // restore prototype chain
        var actualProto = _newTarget.prototype;
        Object.setPrototypeOf(_this, actualProto);
        return _this;
    }
    Object.defineProperty(ZodError.prototype, "message", {
        get: function () {
            return this.errors
                .map(function (_a) {
                var path = _a.path, message = _a.message;
                return path.length ? "`" + path.join('.') + "`: " + message : "" + message;
            })
                .join('\n');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ZodError.prototype, "empty", {
        get: function () {
            return this.errors.length === 0;
        },
        enumerable: true,
        configurable: true
    });
    ZodError.create = function (errors) {
        var error = new ZodError();
        error.errors = errors;
        return error;
    };
    ZodError.fromString = function (message) {
        return ZodError.create([
            {
                path: [],
                message: message
            },
        ]);
    };
    return ZodError;
}(Error));
exports.ZodError = ZodError;
