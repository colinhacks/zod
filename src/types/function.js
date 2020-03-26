"use strict";
exports.__esModule = true;
var z = require("./base");
var ZodFunction = /** @class */ (function () {
    function ZodFunction(def) {
        var _this = this;
        this.validate = function (func) {
            var validatedFunc = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                try {
                    _this._def.args.parse(args);
                    var result = func.apply(void 0, args);
                    _this._def.returns.parse(result);
                    return result;
                }
                catch (err) {
                    throw err;
                }
            };
            return validatedFunc;
        };
        this._def = def;
    }
    ZodFunction.create = function (args, returns) {
        return new ZodFunction({
            t: z.ZodTypes["function"],
            args: args,
            returns: returns
        });
    };
    return ZodFunction;
}());
exports.ZodFunction = ZodFunction;
