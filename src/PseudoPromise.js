var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { INVALID } from "./helpers/util";
import { ZodError } from "./ZodError";
export var NOSET = Symbol("no_set");
var PseudoPromise = /** @class */ (function () {
    function PseudoPromise(funcs) {
        var _this = this;
        if (funcs === void 0) { funcs = []; }
        this.all = function (func) {
            return _this.then(function (arg, ctx) {
                var pps = func(arg, ctx);
                if (ctx.async) {
                    var allValues = Promise.all(pps.map(function (pp) { return __awaiter(_this, void 0, void 0, function () {
                        var err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, pp.getValueAsync()];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2:
                                    err_1 = _a.sent();
                                    return [2 /*return*/, INVALID];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })).then(function (vals) {
                        return vals;
                    });
                    return allValues;
                }
                else {
                    return pps.map(function (pp) { return pp.getValueSync(); });
                }
            });
        };
        this.then = function (func) {
            return new PseudoPromise(__spread(_this.items, [
                { type: "function", function: func },
            ]));
        };
        // parallel = <
        //   NewFunc extends (arg: PayloadType, ctx: { async: boolean }) => any,
        //   ParallelArgs extends [NewFunc, ...NewFunc[]]
        // >(
        //   ...funcs: ParallelArgs
        // ): PseudoPromise<
        //   {
        //     [k in keyof ParallelArgs]: ParallelArgs[k] extends (
        //       ...args: any
        //     ) => infer R
        //       ? R extends Promise<infer U>
        //         ? U
        //         : R
        //       : never;
        //   }
        // > => {
        //   return new PseudoPromise([
        //     ...this.items,
        //     { type: "function", function: func },
        //   ]);
        // };
        this.catch = function (catcher) {
            return new PseudoPromise(__spread(_this.items, [
                { type: "catcher", catcher: catcher },
            ]));
        };
        this.getValueSync = function () {
            var val = undefined;
            var _loop_1 = function (index) {
                try {
                    var item = _this.items[index];
                    if (item.type === "function") {
                        val = item.function(val, { async: false });
                    }
                }
                catch (err) {
                    var catcherIndex = _this.items.findIndex(function (x, i) { return x.type === "catcher" && i > index; });
                    var catcherItem = _this.items[catcherIndex];
                    if (!catcherItem || catcherItem.type !== "catcher") {
                        throw err;
                    }
                    else {
                        index = catcherIndex;
                        val = catcherItem.catcher(err, { async: false });
                    }
                }
                out_index_1 = index;
            };
            var out_index_1;
            for (var index = 0; index < _this.items.length; index++) {
                _loop_1(index);
                index = out_index_1;
            }
            return val;
        };
        this.getValueAsync = function () { return __awaiter(_this, void 0, void 0, function () {
            var val, _loop_2, this_1, out_index_2, index;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        val = undefined;
                        _loop_2 = function (index) {
                            var item, err_2, catcherIndex, catcherItem;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        item = this_1.items[index];
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 4, , 8]);
                                        if (!(item.type === "function")) return [3 /*break*/, 3];
                                        return [4 /*yield*/, item.function(val, { async: true })];
                                    case 2:
                                        val = _a.sent();
                                        _a.label = 3;
                                    case 3: return [3 /*break*/, 8];
                                    case 4:
                                        err_2 = _a.sent();
                                        catcherIndex = this_1.items.findIndex(function (x, i) { return x.type === "catcher" && i > index; });
                                        catcherItem = this_1.items[catcherIndex];
                                        if (!(!catcherItem || catcherItem.type !== "catcher")) return [3 /*break*/, 5];
                                        throw err_2;
                                    case 5:
                                        index = catcherIndex;
                                        return [4 /*yield*/, catcherItem.catcher(err_2, { async: true })];
                                    case 6:
                                        val = _a.sent();
                                        _a.label = 7;
                                    case 7: return [3 /*break*/, 8];
                                    case 8:
                                        if (val instanceof PseudoPromise) {
                                            throw new Error("ASYNC: DO NOT RETURN PSEUDOPROMISE FROM FUNCTIONS");
                                        }
                                        if (val instanceof Promise) {
                                            throw new Error("ASYNC: DO NOT RETURN PROMISE FROM FUNCTIONS");
                                        }
                                        out_index_2 = index;
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        index = 0;
                        _a.label = 1;
                    case 1:
                        if (!(index < this.items.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_2(index)];
                    case 2:
                        _a.sent();
                        index = out_index_2;
                        _a.label = 3;
                    case 3:
                        index++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, val];
                }
            });
        }); };
        this.items = funcs;
    }
    PseudoPromise.all = function (pps) {
        return new PseudoPromise().all(function () { return pps; });
    };
    PseudoPromise.object = function (pps) {
        return new PseudoPromise().then(function (_arg, ctx) {
            var e_1, _a;
            var value = {};
            var zerr = new ZodError([]);
            if (ctx.async) {
                var getAsyncObject = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var items, items_2, items_2_1, item;
                    var e_2, _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, Promise.all(Object.keys(pps).map(function (k) { return __awaiter(void 0, void 0, void 0, function () {
                                    var v, err_3;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                return [4 /*yield*/, pps[k].getValueAsync()];
                                            case 1:
                                                v = _a.sent();
                                                return [2 /*return*/, [k, v]];
                                            case 2:
                                                err_3 = _a.sent();
                                                if (err_3 instanceof ZodError) {
                                                    zerr.addIssues(err_3.issues);
                                                    return [2 /*return*/, [k, INVALID]];
                                                }
                                                throw err_3;
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); }))];
                            case 1:
                                items = _b.sent();
                                if (!zerr.isEmpty)
                                    throw zerr;
                                try {
                                    for (items_2 = __values(items), items_2_1 = items_2.next(); !items_2_1.done; items_2_1 = items_2.next()) {
                                        item = items_2_1.value;
                                        if (item[1] !== NOSET)
                                            value[item[0]] = item[1];
                                    }
                                }
                                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                finally {
                                    try {
                                        if (items_2_1 && !items_2_1.done && (_a = items_2.return)) _a.call(items_2);
                                    }
                                    finally { if (e_2) throw e_2.error; }
                                }
                                return [2 /*return*/, value];
                        }
                    });
                }); };
                return getAsyncObject();
            }
            else {
                var items = Object.keys(pps).map(function (k) {
                    try {
                        var v = pps[k].getValueSync();
                        return [k, v];
                    }
                    catch (err) {
                        if (err instanceof ZodError) {
                            zerr.addIssues(err.issues);
                            return [k, INVALID];
                        }
                        throw err;
                    }
                });
                if (!zerr.isEmpty)
                    throw zerr;
                try {
                    for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                        var item = items_1_1.value;
                        if (item[1] !== NOSET)
                            value[item[0]] = item[1];
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return value;
            }
        });
    };
    PseudoPromise.resolve = function (value) {
        if (value instanceof PseudoPromise) {
            throw new Error("Do not pass PseudoPromise into PseudoPromise.resolve");
        }
        return new PseudoPromise().then(function () { return value; });
    };
    return PseudoPromise;
}());
export { PseudoPromise };
//# sourceMappingURL=PseudoPromise.js.map