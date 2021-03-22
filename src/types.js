var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
import { errorUtil } from "./helpers/errorUtil";
import { getParsedType, issueHelpers, ZodParsedType, } from "./helpers/parseUtil";
import { INVALID, util } from "./helpers/util";
import { NOSET, PseudoPromise } from "./PseudoPromise";
import { defaultErrorMap, ZodError, ZodIssueCode, } from "./ZodError";
var ZodType = /** @class */ (function () {
    function ZodType(def) {
        var _this = this;
        this._parseInternalOptionalParams = function (params) {
            // if(!params.data) throw
            var _a;
            var fullParams = {
                data: params.data,
                path: params.path || [],
                parentError: params.parentError || new ZodError([]),
                errorMap: params.errorMap || defaultErrorMap,
                async: (_a = params.async) !== null && _a !== void 0 ? _a : false,
            };
            return _this._parseInternal(fullParams);
        };
        this.parse = function (data, params) {
            var result = _this._parseInternalOptionalParams(__assign({ data: data }, params));
            if (result instanceof Promise)
                throw new Error("You can't use .parse() on a schema containing async elements. Use .parseAsync instead.");
            if (result.success)
                return result.data;
            throw result.error;
        };
        this.safeParse = function (data, params) {
            var result = _this._parseInternalOptionalParams(__assign({ data: data }, params));
            if (result instanceof Promise)
                throw new Error("You can't use .safeParse() on a schema containing async elements. Use .parseAsync instead.");
            return result;
        };
        this.parseAsync = function (data, params) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._parseInternalOptionalParams(__assign(__assign({ data: data }, params), { async: true }))];
                    case 1:
                        result = _a.sent();
                        if (result.success)
                            return [2 /*return*/, result.data];
                        throw result.error;
                }
            });
        }); };
        this.safeParseAsync = function (data, params) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._parseInternalOptionalParams(__assign(__assign({ data: data }, params), { async: true }))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        /** Alias of safeParseAsync */
        this.spa = this.safeParseAsync;
        this._parseWithInvalidFallback = function (data, params) {
            var result = _this._parseInternal(__assign(__assign({}, params), { data: data }));
            // const parser = ZodParser(this);
            // const result = parser({ ...params, data });
            if (result instanceof Promise) {
                return result.then(function (result) {
                    if (result.success)
                        return result.data;
                    return INVALID;
                });
            }
            if (result.success)
                return result.data;
            return INVALID;
        };
        this.refine = function (check, message) {
            if (message === void 0) { message = "Invalid value."; }
            if (typeof message === "string") {
                return _this._refinement(function (val, ctx) {
                    var result = check(val);
                    var setError = function () {
                        return ctx.addIssue({
                            code: ZodIssueCode.custom,
                            message: message,
                        });
                    };
                    if (result instanceof Promise) {
                        return result.then(function (data) {
                            if (!data)
                                setError();
                        });
                    }
                    if (!result) {
                        setError();
                        return result;
                    }
                });
            }
            if (typeof message === "function") {
                return _this._refinement(function (val, ctx) {
                    var result = check(val);
                    var setError = function () {
                        return ctx.addIssue(__assign({ code: ZodIssueCode.custom }, message(val)));
                    };
                    if (result instanceof Promise) {
                        return result.then(function (data) {
                            if (!data)
                                setError();
                        });
                    }
                    if (!result) {
                        setError();
                        return result;
                    }
                });
            }
            return _this._refinement(function (val, ctx) {
                var result = check(val);
                var setError = function () {
                    return ctx.addIssue(__assign({ code: ZodIssueCode.custom }, message));
                };
                if (result instanceof Promise) {
                    return result.then(function (data) {
                        if (!data)
                            setError();
                    });
                }
                if (!result) {
                    setError();
                    return result;
                }
            });
        };
        this.refinement = function (check, refinementData) {
            return _this._refinement(function (val, ctx) {
                if (!check(val)) {
                    ctx.addIssue(typeof refinementData === "function"
                        ? refinementData(val, ctx)
                        : refinementData);
                }
            });
        };
        this.superRefine = this._refinement;
        this.optional = function () {
            return ZodOptional.create(_this);
        };
        this.nullable = function () {
            return ZodNullable.create(_this);
        };
        this.array = function () { return ZodArray.create(_this); };
        this.isOptional = function () { return _this.safeParse(undefined).success; };
        this.isNullable = function () { return _this.safeParse(null).success; };
        this._def = def;
        this.transform = this.transform.bind(this);
        this.default = this.default.bind(this);
    }
    ZodType.prototype._parseInternal = function (params) {
        var data = params.data;
        var PROMISE;
        var ERROR = new ZodError([]);
        var _a = issueHelpers(ERROR, __assign({}, params)), makeIssue = _a.makeIssue, addIssue = _a.addIssue;
        var parsedType = getParsedType(data);
        try {
            var parsedValue = this._parse(__assign(__assign({}, params), { currentError: ERROR, makeIssue: makeIssue,
                addIssue: addIssue,
                parsedType: parsedType }));
            PROMISE =
                parsedValue instanceof PseudoPromise
                    ? parsedValue
                    : PseudoPromise.resolve(parsedValue);
        }
        catch (err) {
            // default to invalid
            PROMISE = PseudoPromise.resolve(INVALID);
        }
        var isSync = params.async === false || this instanceof ZodPromise;
        var THROW_ERROR_IF_PRESENT = function (key) { return function (data) {
            key;
            if (!ERROR.isEmpty)
                throw ERROR;
            return data;
        }; };
        PROMISE = PROMISE.then(THROW_ERROR_IF_PRESENT("post effects"))
            .then(function (data) {
            return { success: true, data: data };
        })
            .catch(function (error) {
            params.parentError.addIssues(ERROR.issues);
            if (error instanceof ZodError)
                return { success: false, error: error };
            throw error;
        });
        return isSync ? PROMISE.getValueSync() : PROMISE.getValueAsync();
    };
    // _refinement: (refinement: InternalCheck<Output>["refinement"]) => this = (
    //   refinement
    // ) => {
    //   return new (this as any).constructor({
    //     ...this._def,
    //     effects: [
    //       // ...(this._def.effects || []),
    //       { type: "check", check: refinement },
    //     ],
    //   }) as this;
    // };
    ZodType.prototype._refinement = function (refinement) {
        var returnType;
        if (this instanceof ZodEffects) {
            returnType = new ZodEffects(__assign(__assign({}, this._def), { effects: __spread((this._def.effects || []), [
                    { type: "refinement", refinement: refinement },
                ]) }));
        }
        else {
            returnType = new ZodEffects({
                schema: this,
                effects: [{ type: "refinement", refinement: refinement }],
            });
        }
        return returnType;
    };
    ZodType.prototype.or = function (option) {
        return ZodUnion.create([this, option]);
    };
    ZodType.prototype.and = function (incoming) {
        return ZodIntersection.create(this, incoming);
    };
    ZodType.prototype.transform = function (transform) {
        var returnType;
        if (this instanceof ZodEffects) {
            returnType = new ZodEffects(__assign(__assign({}, this._def), { effects: __spread((this._def.effects || []), [
                    { type: "transform", transform: transform },
                ]) }));
        }
        else {
            returnType = new ZodEffects({
                schema: this,
                effects: [{ type: "transform", transform: transform }],
            });
        }
        return returnType;
    };
    ZodType.prototype.default = function (def) {
        var defaultValueFunc = typeof def === "function" ? def : function () { return def; };
        // if (this instanceof ZodOptional) {
        //   return new ZodOptional({
        //     ...this._def,
        //     defaultValue: defaultValueFunc,
        //   }) as any;
        // }
        return new ZodOptional({
            innerType: this,
            defaultValue: defaultValueFunc,
        });
    };
    return ZodType;
}());
export { ZodType };
// eslint-disable-next-line
var emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
var uuidRegex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/i;
var ZodString = /** @class */ (function (_super) {
    __extends(ZodString, _super);
    function ZodString() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._regex = function (regex, validation, message) {
            return _this.refinement(function (data) { return regex.test(data); }, __assign({ validation: validation, code: ZodIssueCode.invalid_string }, errorUtil.errToObj(message)));
        };
        _this.email = function (message) {
            return new ZodString(__assign(__assign({}, _this._def), { isEmail: errorUtil.errToObj(message) }));
        };
        _this.url = function (message) {
            return new ZodString(__assign(__assign({}, _this._def), { isURL: errorUtil.errToObj(message) }));
        };
        _this.uuid = function (message) {
            return new ZodString(__assign(__assign({}, _this._def), { isUUID: errorUtil.errToObj(message) }));
        };
        _this.regex = function (regexp, message) {
            return _this._regex(regexp, "regex", message);
        };
        _this.min = function (minLength, message) {
            return new ZodString(__assign(__assign({}, _this._def), { minLength: {
                    value: minLength,
                    message: errorUtil.errToObj(message).message,
                } }));
        };
        _this.max = function (maxLength, message) {
            return new ZodString(__assign(__assign({}, _this._def), { maxLength: {
                    value: maxLength,
                    message: errorUtil.errToObj(message).message,
                } }));
        };
        _this.nonempty = function (message) {
            return _this.min(1, errorUtil.errToObj(message));
        };
        return _this;
    }
    ZodString.prototype._parse = function (ctx) {
        if (ctx.parsedType !== ZodParsedType.string) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.string,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        if (this._def.isEmail && !emailRegex.test(ctx.data)) {
            ctx.addIssue({
                validation: "email",
                code: ZodIssueCode.invalid_string,
                message: this._def.isEmail.message,
            });
        }
        if (this._def.isURL) {
            try {
                new URL(ctx.data);
            }
            catch (_a) {
                ctx.addIssue({
                    validation: "url",
                    code: ZodIssueCode.invalid_string,
                    message: this._def.isURL.message,
                });
            }
        }
        if (this._def.isUUID && !uuidRegex.test(ctx.data)) {
            ctx.addIssue({
                validation: "email",
                code: ZodIssueCode.invalid_string,
                message: this._def.isUUID.message,
            });
        }
        if (this._def.minLength !== null) {
            if (ctx.data.length < this._def.minLength.value) {
                ctx.addIssue({
                    code: ZodIssueCode.too_small,
                    minimum: this._def.minLength.value,
                    type: "string",
                    inclusive: true,
                    message: this._def.minLength.message,
                });
            }
        }
        if (this._def.maxLength !== null) {
            if (ctx.data.length > this._def.maxLength.value) {
                ctx.addIssue({
                    code: ZodIssueCode.too_big,
                    maximum: this._def.maxLength.value,
                    type: "string",
                    inclusive: true,
                    message: this._def.maxLength.message,
                });
            }
        }
        return ctx.data;
    };
    ZodString.prototype.length = function (len, message) {
        return this.min(len, message).max(len, message);
    };
    ZodString.create = function () {
        return new ZodString({
            isEmail: false,
            isURL: false,
            isUUID: false,
            minLength: null,
            maxLength: null,
        });
    };
    return ZodString;
}(ZodType));
export { ZodString };
var ZodNumber = /** @class */ (function (_super) {
    __extends(ZodNumber, _super);
    function ZodNumber() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.min = function (minimum, message) {
            return new ZodNumber(__assign(__assign({}, _this._def), { minimum: {
                    value: minimum,
                    inclusive: true,
                    message: errorUtil.toString(message),
                } }));
        };
        _this.max = function (maximum, message) {
            return new ZodNumber(__assign(__assign({}, _this._def), { maximum: {
                    value: maximum,
                    inclusive: true,
                    message: errorUtil.toString(message),
                } }));
        };
        _this.int = function (message) {
            return new ZodNumber(__assign(__assign({}, _this._def), { isInteger: { message: errorUtil.toString(message) } }));
        };
        _this.positive = function (message) {
            return new ZodNumber(__assign(__assign({}, _this._def), { minimum: {
                    value: 0,
                    inclusive: false,
                    message: errorUtil.toString(message),
                } }));
        };
        _this.negative = function (message) {
            return new ZodNumber(__assign(__assign({}, _this._def), { maximum: {
                    value: 0,
                    inclusive: false,
                    message: errorUtil.toString(message),
                } }));
        };
        _this.nonpositive = function (message) {
            return new ZodNumber(__assign(__assign({}, _this._def), { maximum: {
                    value: 0,
                    inclusive: true,
                    message: errorUtil.toString(message),
                } }));
        };
        _this.nonnegative = function (message) {
            return new ZodNumber(__assign(__assign({}, _this._def), { minimum: {
                    value: 0,
                    inclusive: true,
                    message: errorUtil.toString(message),
                } }));
        };
        return _this;
    }
    ZodNumber.prototype._parse = function (ctx) {
        if (ctx.parsedType !== ZodParsedType.number) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.number,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        if (Number.isNaN(ctx.data)) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.number,
                received: ZodParsedType.nan,
            });
            return INVALID;
        }
        if (this._def.minimum) {
            var MIN = this._def.minimum;
            var tooSmall = MIN.inclusive
                ? ctx.data < MIN.value
                : ctx.data <= MIN.value;
            if (tooSmall) {
                ctx.addIssue({
                    code: ZodIssueCode.too_small,
                    minimum: MIN.value,
                    type: "number",
                    inclusive: MIN.inclusive,
                    message: MIN.message,
                });
            }
        }
        if (this._def.maximum) {
            var MAX = this._def.maximum;
            var tooBig = MAX.inclusive
                ? ctx.data > MAX.value
                : ctx.data >= MAX.value;
            if (tooBig) {
                ctx.addIssue({
                    code: ZodIssueCode.too_big,
                    maximum: MAX.value,
                    type: "number",
                    inclusive: MAX.inclusive,
                    message: MAX.message,
                });
            }
        }
        if (this._def.isInteger) {
            if (!Number.isInteger(ctx.data)) {
                ctx.addIssue({
                    code: ZodIssueCode.invalid_type,
                    expected: "integer",
                    received: "float",
                    message: this._def.isInteger.message,
                });
            }
        }
        return ctx.data;
    };
    ZodNumber.create = function () {
        return new ZodNumber({
            minimum: null,
            maximum: null,
            isInteger: false,
        });
    };
    return ZodNumber;
}(ZodType));
export { ZodNumber };
var ZodBigInt = /** @class */ (function (_super) {
    __extends(ZodBigInt, _super);
    function ZodBigInt() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodBigInt.prototype._parse = function (ctx) {
        if (ctx.parsedType !== ZodParsedType.bigint) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.bigint,
                received: ctx.parsedType,
            });
            return;
        }
        return ctx.data;
    };
    ZodBigInt.create = function () {
        return new ZodBigInt({});
    };
    return ZodBigInt;
}(ZodType));
export { ZodBigInt };
var ZodBoolean = /** @class */ (function (_super) {
    __extends(ZodBoolean, _super);
    function ZodBoolean() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodBoolean.prototype._parse = function (ctx) {
        if (ctx.parsedType !== ZodParsedType.boolean) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.boolean,
                received: ctx.parsedType,
            });
            return;
        }
        return ctx.data;
    };
    ZodBoolean.create = function () {
        return new ZodBoolean({});
    };
    return ZodBoolean;
}(ZodType));
export { ZodBoolean };
var ZodDate = /** @class */ (function (_super) {
    __extends(ZodDate, _super);
    function ZodDate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodDate.prototype._parse = function (ctx) {
        if (ctx.parsedType !== ZodParsedType.date) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.date,
                received: ctx.parsedType,
            });
            return;
        }
        if (isNaN(ctx.data.getTime())) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_date,
            });
            return;
        }
        return new Date(ctx.data.getTime());
    };
    ZodDate.create = function () {
        return new ZodDate({});
    };
    return ZodDate;
}(ZodType));
export { ZodDate };
var ZodUndefined = /** @class */ (function (_super) {
    __extends(ZodUndefined, _super);
    function ZodUndefined() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodUndefined.prototype._parse = function (ctx) {
        if (ctx.parsedType !== ZodParsedType.undefined) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.undefined,
                received: ctx.parsedType,
            });
            return;
        }
        return ctx.data;
    };
    ZodUndefined.create = function () {
        return new ZodUndefined({});
    };
    return ZodUndefined;
}(ZodType));
export { ZodUndefined };
var ZodNull = /** @class */ (function (_super) {
    __extends(ZodNull, _super);
    function ZodNull() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodNull.prototype._parse = function (ctx) {
        if (ctx.parsedType !== ZodParsedType.null) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.null,
                received: ctx.parsedType,
            });
            return;
        }
        return ctx.data;
    };
    ZodNull.create = function () {
        return new ZodNull({});
    };
    return ZodNull;
}(ZodType));
export { ZodNull };
var ZodAny = /** @class */ (function (_super) {
    __extends(ZodAny, _super);
    function ZodAny() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodAny.prototype._parse = function (ctx) {
        return ctx.data;
    };
    ZodAny.create = function () {
        return new ZodAny({});
    };
    return ZodAny;
}(ZodType));
export { ZodAny };
var ZodUnknown = /** @class */ (function (_super) {
    __extends(ZodUnknown, _super);
    function ZodUnknown() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodUnknown.prototype._parse = function (ctx) {
        return ctx.data;
    };
    ZodUnknown.create = function () {
        return new ZodUnknown({});
    };
    return ZodUnknown;
}(ZodType));
export { ZodUnknown };
var ZodNever = /** @class */ (function (_super) {
    __extends(ZodNever, _super);
    function ZodNever() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodNever.prototype._parse = function (ctx) {
        ctx.addIssue({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.never,
            received: ctx.parsedType,
        });
        return;
    };
    ZodNever.create = function () {
        return new ZodNever({});
    };
    return ZodNever;
}(ZodType));
export { ZodNever };
var ZodVoid = /** @class */ (function (_super) {
    __extends(ZodVoid, _super);
    function ZodVoid() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodVoid.prototype._parse = function (ctx) {
        if (ctx.parsedType !== ZodParsedType.undefined &&
            ctx.parsedType !== ZodParsedType.null) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.void,
                received: ctx.parsedType,
            });
            return;
        }
        return ctx.data;
    };
    ZodVoid.create = function () {
        return new ZodVoid({});
    };
    return ZodVoid;
}(ZodType));
export { ZodVoid };
var parseArray = function (ctx, def) {
    if (ctx.parsedType !== ZodParsedType.array) {
        ctx.addIssue({
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType,
        });
        return false;
    }
    if (def.minLength !== null) {
        if (ctx.data.length < def.minLength.value) {
            ctx.addIssue({
                code: ZodIssueCode.too_small,
                minimum: def.minLength.value,
                type: "array",
                inclusive: true,
                message: def.minLength.message,
            });
        }
    }
    if (def.maxLength !== null) {
        if (ctx.data.length > def.maxLength.value) {
            ctx.addIssue({
                code: ZodIssueCode.too_big,
                maximum: def.maxLength.value,
                type: "array",
                inclusive: true,
                message: def.maxLength.message,
            });
        }
    }
    return true;
};
var ZodArray = /** @class */ (function (_super) {
    __extends(ZodArray, _super);
    function ZodArray() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.min = function (minLength, message) {
            return new ZodArray(__assign(__assign({}, _this._def), { minLength: { value: minLength, message: errorUtil.toString(message) } }));
        };
        _this.max = function (maxLength, message) {
            return new ZodArray(__assign(__assign({}, _this._def), { maxLength: { value: maxLength, message: errorUtil.toString(message) } }));
        };
        _this.length = function (len, message) {
            return _this.min(len, message).max(len, message);
        };
        _this.nonempty = function () {
            return new ZodNonEmptyArray(__assign({}, _this._def));
        };
        return _this;
    }
    ZodArray.prototype._parse = function (ctx) {
        var _this = this;
        var result = parseArray(ctx, this._def);
        if (!result)
            return;
        return PseudoPromise.all(ctx.data.map(function (item, i) {
            return new PseudoPromise().then(function () {
                return _this._def.type._parseWithInvalidFallback(item, __assign(__assign({}, ctx), { path: __spread(ctx.path, [i]), parentError: ctx.currentError }));
            });
        }));
    };
    Object.defineProperty(ZodArray.prototype, "element", {
        get: function () {
            return this._def.type;
        },
        enumerable: false,
        configurable: true
    });
    ZodArray.create = function (schema) {
        return new ZodArray({
            type: schema,
            minLength: null,
            maxLength: null,
        });
    };
    return ZodArray;
}(ZodType));
export { ZodArray };
var ZodNonEmptyArray = /** @class */ (function (_super) {
    __extends(ZodNonEmptyArray, _super);
    function ZodNonEmptyArray() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.min = function (minLength, message) {
            return new ZodNonEmptyArray(__assign(__assign({}, _this._def), { minLength: { value: minLength, message: errorUtil.toString(message) } }));
        };
        _this.max = function (maxLength, message) {
            return new ZodNonEmptyArray(__assign(__assign({}, _this._def), { maxLength: { value: maxLength, message: errorUtil.toString(message) } }));
        };
        _this.length = function (len, message) {
            return _this.min(len, message).max(len, message);
        };
        return _this;
    }
    ZodNonEmptyArray.prototype._parse = function (ctx) {
        // if (ctx.parsedType !== ZodParsedType.array) {
        //   ctx.addIssue({
        //     code: ZodIssueCode.invalid_type,
        //     expected: ZodParsedType.array,
        //     received: ctx.parsedType,
        //   });
        var _this = this;
        //   return;
        // }
        var result = parseArray(ctx, this._def);
        if (!result)
            return;
        if (ctx.data.length < 1) {
            ctx.addIssue({
                code: ZodIssueCode.too_small,
                minimum: 1,
                type: "array",
                inclusive: true,
            });
        }
        return PseudoPromise.all(ctx.data.map(function (item, i) {
            return new PseudoPromise().then(function () {
                return _this._def.type._parseWithInvalidFallback(item, __assign(__assign({}, ctx), { path: __spread(ctx.path, [i]), parentError: ctx.currentError }));
            });
        }));
    };
    ZodNonEmptyArray.create = function (schema) {
        return new ZodNonEmptyArray({
            type: schema,
            minLength: null,
            maxLength: null,
        });
    };
    return ZodNonEmptyArray;
}(ZodType));
export { ZodNonEmptyArray };
/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodObject      //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////
export var objectUtil;
(function (objectUtil) {
    objectUtil.mergeShapes = function (first, second) {
        return __assign(__assign({}, first), second);
    };
    objectUtil.intersectShapes = function (first, second) {
        var e_1, _a;
        var firstKeys = Object.keys(first);
        var secondKeys = Object.keys(second);
        var sharedKeys = firstKeys.filter(function (k) { return secondKeys.indexOf(k) !== -1; });
        var sharedShape = {};
        try {
            for (var sharedKeys_1 = __values(sharedKeys), sharedKeys_1_1 = sharedKeys_1.next(); !sharedKeys_1_1.done; sharedKeys_1_1 = sharedKeys_1.next()) {
                var k = sharedKeys_1_1.value;
                sharedShape[k] = ZodIntersection.create(first[k], second[k]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (sharedKeys_1_1 && !sharedKeys_1_1.done && (_a = sharedKeys_1.return)) _a.call(sharedKeys_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return __assign(__assign(__assign({}, first), second), sharedShape);
    };
})(objectUtil || (objectUtil = {}));
export var mergeObjects = function (first) { return function (second) {
    var mergedShape = objectUtil.mergeShapes(first._def.shape(), second._def.shape());
    var merged = new ZodObject({
        // effects: [...(first._def.effects || []), ...(second._def.effects || [])],
        unknownKeys: first._def.unknownKeys,
        catchall: first._def.catchall,
        shape: function () { return mergedShape; },
    });
    return merged;
}; };
var AugmentFactory = function (def) { return function (augmentation) {
    return new ZodObject(__assign(__assign({}, def), { shape: function () { return (__assign(__assign({}, def.shape()), augmentation)); } }));
}; };
var ZodObject = /** @class */ (function (_super) {
    __extends(ZodObject, _super);
    function ZodObject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.strict = function () {
            return new ZodObject(__assign(__assign({}, _this._def), { unknownKeys: "strict" }));
        };
        _this.strip = function () {
            return new ZodObject(__assign(__assign({}, _this._def), { unknownKeys: "strip" }));
        };
        _this.passthrough = function () {
            return new ZodObject(__assign(__assign({}, _this._def), { unknownKeys: "passthrough" }));
        };
        _this.nonstrict = _this.passthrough;
        _this.augment = AugmentFactory(_this._def);
        _this.extend = AugmentFactory(_this._def);
        _this.setKey = function (key, schema) {
            var _a;
            return _this.augment((_a = {}, _a[key] = schema, _a));
        };
        /**
         * Prior to zod@1.0.12 there was a bug in the
         * inferred type of merged objects. Please
         * upgrade if you are experiencing issues.
         */
        _this.merge = function (merging) {
            var mergedShape = objectUtil.mergeShapes(_this._def.shape(), merging._def.shape());
            var merged = new ZodObject({
                // effects: [], // wipe all refinements
                unknownKeys: _this._def.unknownKeys,
                catchall: _this._def.catchall,
                shape: function () { return mergedShape; },
            });
            return merged;
        };
        _this.catchall = function (index) {
            return new ZodObject(__assign(__assign({}, _this._def), { catchall: index }));
        };
        _this.pick = function (mask) {
            var shape = {};
            Object.keys(mask).map(function (key) {
                shape[key] = _this.shape[key];
            });
            return new ZodObject(__assign(__assign({}, _this._def), { shape: function () { return shape; } }));
        };
        _this.omit = function (mask) {
            var shape = {};
            Object.keys(_this.shape).map(function (key) {
                if (Object.keys(mask).indexOf(key) === -1) {
                    shape[key] = _this.shape[key];
                }
            });
            return new ZodObject(__assign(__assign({}, _this._def), { shape: function () { return shape; } }));
        };
        _this.partial = function () {
            var newShape = {};
            for (var key in _this.shape) {
                var fieldSchema = _this.shape[key];
                newShape[key] = fieldSchema.isOptional()
                    ? fieldSchema
                    : fieldSchema.optional();
            }
            return new ZodObject(__assign(__assign({}, _this._def), { shape: function () { return newShape; } }));
        };
        _this.deepPartial = function () {
            var newShape = {};
            for (var key in _this.shape) {
                var fieldSchema = _this.shape[key];
                if (fieldSchema instanceof ZodObject) {
                    newShape[key] = fieldSchema.isOptional()
                        ? fieldSchema
                        : fieldSchema.deepPartial().optional();
                }
                else {
                    newShape[key] = fieldSchema.isOptional()
                        ? fieldSchema
                        : fieldSchema.optional();
                }
            }
            return new ZodObject(__assign(__assign({}, _this._def), { shape: function () { return newShape; } }));
        };
        return _this;
    }
    ZodObject.prototype._parse = function (ctx) {
        var e_2, _a, e_3, _b, e_4, _c;
        var _this = this;
        if (ctx.parsedType !== ZodParsedType.object) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.object,
                received: ctx.parsedType,
            });
            return;
        }
        var objectPromises = {};
        var shape = this._def.shape();
        var shapeKeys = Object.keys(shape);
        var dataKeys = Object.keys(ctx.data);
        var extraKeys = dataKeys.filter(function (k) { return shapeKeys.indexOf(k) === -1; });
        var _loop_1 = function (key) {
            var keyValidator = shapeKeys.includes(key)
                ? shape[key]
                : !(this_1._def.catchall instanceof ZodNever)
                    ? this_1._def.catchall
                    : undefined;
            if (!keyValidator) {
                return "continue";
            }
            // if value for key is not set
            // and schema is optional
            // don't add the
            // first check is required to avoid non-enumerable keys
            if (typeof ctx.data[key] === "undefined" && !dataKeys.includes(key)) {
                objectPromises[key] = new PseudoPromise()
                    .then(function () {
                    return keyValidator._parseWithInvalidFallback(undefined, __assign(__assign({}, ctx), { path: __spread(ctx.path, [key]), parentError: ctx.currentError }));
                })
                    .then(function (data) {
                    if (data === undefined) {
                        // schema is optional
                        // data is not defined
                        // don't explicity add `key: undefined` to outut
                        // this is a feature of PseudoPromises
                        return NOSET;
                    }
                    else {
                        return data;
                    }
                });
                return "continue";
            }
            objectPromises[key] = new PseudoPromise()
                .then(function () {
                return keyValidator._parseWithInvalidFallback(ctx.data[key], __assign(__assign({}, ctx), { path: __spread(ctx.path, [key]), parentError: ctx.currentError }));
            })
                .then(function (data) {
                return data;
            });
        };
        var this_1 = this;
        try {
            for (var shapeKeys_1 = __values(shapeKeys), shapeKeys_1_1 = shapeKeys_1.next(); !shapeKeys_1_1.done; shapeKeys_1_1 = shapeKeys_1.next()) {
                var key = shapeKeys_1_1.value;
                _loop_1(key);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (shapeKeys_1_1 && !shapeKeys_1_1.done && (_a = shapeKeys_1.return)) _a.call(shapeKeys_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (this._def.catchall instanceof ZodNever) {
            var unknownKeys = this._def.unknownKeys;
            if (unknownKeys === "passthrough") {
                try {
                    for (var extraKeys_1 = __values(extraKeys), extraKeys_1_1 = extraKeys_1.next(); !extraKeys_1_1.done; extraKeys_1_1 = extraKeys_1.next()) {
                        var key = extraKeys_1_1.value;
                        objectPromises[key] = PseudoPromise.resolve(ctx.data[key]);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (extraKeys_1_1 && !extraKeys_1_1.done && (_b = extraKeys_1.return)) _b.call(extraKeys_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
            else if (unknownKeys === "strict") {
                if (extraKeys.length > 0) {
                    ctx.addIssue({
                        code: ZodIssueCode.unrecognized_keys,
                        keys: extraKeys,
                    });
                }
            }
            else if (unknownKeys === "strip") {
            }
            else {
                throw new Error("Internal ZodObject error: invalid unknownKeys value.");
            }
        }
        else {
            var _loop_2 = function (key) {
                objectPromises[key] = new PseudoPromise().then(function () {
                    var parsedValue = _this._def.catchall._parseWithInvalidFallback(ctx.data[key], __assign(__assign({}, ctx), { path: __spread(ctx.path, [key]), parentError: ctx.currentError }));
                    return parsedValue;
                });
            };
            try {
                // run catchall validation
                for (var extraKeys_2 = __values(extraKeys), extraKeys_2_1 = extraKeys_2.next(); !extraKeys_2_1.done; extraKeys_2_1 = extraKeys_2.next()) {
                    var key = extraKeys_2_1.value;
                    _loop_2(key);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (extraKeys_2_1 && !extraKeys_2_1.done && (_c = extraKeys_2.return)) _c.call(extraKeys_2);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
        return PseudoPromise.object(objectPromises).then(function (data) {
            return data;
        });
    };
    Object.defineProperty(ZodObject.prototype, "shape", {
        get: function () {
            return this._def.shape();
        },
        enumerable: false,
        configurable: true
    });
    ZodObject.create = function (shape) {
        return new ZodObject({
            shape: function () { return shape; },
            unknownKeys: "strip",
            catchall: ZodNever.create(),
        });
    };
    ZodObject.strictCreate = function (shape) {
        return new ZodObject({
            shape: function () { return shape; },
            unknownKeys: "strict",
            catchall: ZodNever.create(),
        });
    };
    ZodObject.lazycreate = function (shape) {
        return new ZodObject({
            shape: shape,
            unknownKeys: "strip",
            catchall: ZodNever.create(),
        });
    };
    return ZodObject;
}(ZodType));
export { ZodObject };
// export type toOpts<T> = T extends ZodUnionOptions ? T : never;
// export type ZodUnionType<
//   A extends ZodTypeAny,
//   B extends ZodTypeAny
// > = A extends ZodUnion<infer AOpts>
//   ? B extends ZodUnion<infer BOpts>
//     ? ZodUnion<toOpts<[...AOpts, ...BOpts]>>
//     : ZodUnion<toOpts<[...AOpts, B]>>
//   : B extends ZodUnion<infer BOpts>
//   ? ZodUnion<toOpts<[A, ...BOpts]>>
//   : ZodUnion<toOpts<[A, B]>>;
var ZodUnion = /** @class */ (function (_super) {
    __extends(ZodUnion, _super);
    function ZodUnion() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodUnion.prototype._parse = function (ctx) {
        var unionErrors = __spread(Array(this._def.options.length)).map(function () { return new ZodError([]); });
        return PseudoPromise.all(this._def.options.map(function (opt, _j) {
            return new PseudoPromise().then(function () {
                return opt._parseWithInvalidFallback(ctx.data, __assign(__assign({}, ctx), { parentError: unionErrors[_j] }));
            });
        }))
            .then(function (unionResults) {
            var isValid = !!unionErrors.find(function (err) { return err.isEmpty; });
            var GUESSING = false;
            if (!isValid) {
                if (!GUESSING) {
                    ctx.addIssue({
                        code: ZodIssueCode.invalid_union,
                        unionErrors: unionErrors,
                    });
                }
                else {
                    var nonTypeErrors = unionErrors.filter(function (err) {
                        return err.issues[0].code !== "invalid_type";
                    });
                    if (nonTypeErrors.length === 1) {
                        ctx.currentError.addIssues(nonTypeErrors[0].issues);
                    }
                    else {
                        ctx.addIssue({
                            code: ZodIssueCode.invalid_union,
                            unionErrors: unionErrors,
                        });
                    }
                }
            }
            return unionResults;
        })
            .then(function (unionResults) {
            var validIndex = unionErrors.indexOf(unionErrors.find(function (err) { return err.isEmpty; }));
            return unionResults[validIndex];
        });
    };
    Object.defineProperty(ZodUnion.prototype, "options", {
        get: function () {
            return this._def.options;
        },
        enumerable: false,
        configurable: true
    });
    ZodUnion.create = function (types) {
        return new ZodUnion({
            options: types,
        });
    };
    return ZodUnion;
}(ZodType));
export { ZodUnion };
var ZodIntersection = /** @class */ (function (_super) {
    __extends(ZodIntersection, _super);
    function ZodIntersection() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodIntersection.prototype._parse = function (ctx) {
        var _this = this;
        return PseudoPromise.all([
            new PseudoPromise().then(function () {
                return _this._def.left._parseWithInvalidFallback(ctx.data, __assign(__assign({}, ctx), { parentError: ctx.currentError }));
            }),
            new PseudoPromise().then(function () {
                return _this._def.right._parseWithInvalidFallback(ctx.data, __assign(__assign({}, ctx), { parentError: ctx.currentError }));
            }),
        ]).then(function (_a) {
            var _b = __read(_a, 2), parsedLeft = _b[0], parsedRight = _b[1];
            if (parsedLeft === INVALID || parsedRight === INVALID)
                return INVALID;
            var parsedLeftType = getParsedType(parsedLeft);
            var parsedRightType = getParsedType(parsedRight);
            if (parsedLeft === parsedRight) {
                return parsedLeft;
            }
            else if (parsedLeftType === ZodParsedType.object &&
                parsedRightType === ZodParsedType.object) {
                return __assign(__assign({}, parsedLeft), parsedRight);
            }
            else {
                ctx.addIssue({
                    code: ZodIssueCode.invalid_intersection_types,
                });
            }
        });
    };
    ZodIntersection.create = function (left, right) {
        return new ZodIntersection({
            left: left,
            right: right,
        });
    };
    return ZodIntersection;
}(ZodType));
export { ZodIntersection };
var ZodTuple = /** @class */ (function (_super) {
    __extends(ZodTuple, _super);
    function ZodTuple() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodTuple.prototype._parse = function (ctx) {
        var _this = this;
        if (ctx.parsedType !== ZodParsedType.array) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.array,
                received: ctx.parsedType,
            });
            return;
        }
        if (ctx.data.length > this._def.items.length) {
            ctx.addIssue({
                code: ZodIssueCode.too_big,
                maximum: this._def.items.length,
                inclusive: true,
                type: "array",
            });
        }
        else if (ctx.data.length < this._def.items.length) {
            ctx.addIssue({
                code: ZodIssueCode.too_small,
                minimum: this._def.items.length,
                inclusive: true,
                type: "array",
            });
        }
        var tupleData = ctx.data;
        return PseudoPromise.all(tupleData.map(function (item, index) {
            var itemParser = _this._def.items[index];
            return new PseudoPromise()
                .then(function () {
                return itemParser._parseWithInvalidFallback(item, __assign(__assign({}, ctx), { path: __spread(ctx.path, [index]), parentError: ctx.currentError }));
            })
                .then(function (tupleItem) {
                return tupleItem;
            });
        }));
    };
    Object.defineProperty(ZodTuple.prototype, "items", {
        get: function () {
            return this._def.items;
        },
        enumerable: false,
        configurable: true
    });
    ZodTuple.create = function (schemas) {
        return new ZodTuple({
            items: schemas,
        });
    };
    return ZodTuple;
}(ZodType));
export { ZodTuple };
var ZodRecord = /** @class */ (function (_super) {
    __extends(ZodRecord, _super);
    function ZodRecord() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodRecord.prototype._parse = function (ctx) {
        var _this = this;
        if (ctx.parsedType !== ZodParsedType.object) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.object,
                received: ctx.parsedType,
            });
            return;
        }
        var parsedRecordPromises = {};
        var _loop_3 = function (key) {
            parsedRecordPromises[key] = new PseudoPromise().then(function () {
                return _this._def.valueType._parseWithInvalidFallback(ctx.data[key], __assign(__assign({}, ctx), { path: __spread(ctx.path, [key]), parentError: ctx.currentError }));
            });
        };
        for (var key in ctx.data) {
            _loop_3(key);
        }
        return PseudoPromise.object(parsedRecordPromises);
    };
    ZodRecord.create = function (valueType) {
        return new ZodRecord({
            valueType: valueType,
        });
    };
    return ZodRecord;
}(ZodType));
export { ZodRecord };
var ZodMap = /** @class */ (function (_super) {
    __extends(ZodMap, _super);
    function ZodMap() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodMap.prototype._parse = function (ctx) {
        var _this = this;
        if (ctx.parsedType !== ZodParsedType.map) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.map,
                received: ctx.parsedType,
            });
            return;
        }
        var dataMap = ctx.data;
        var returnedMap = new Map();
        return PseudoPromise.all(__spread(dataMap.entries()).map(function (_a, index) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            return PseudoPromise.all([
                new PseudoPromise().then(function () {
                    return _this._def.keyType._parseWithInvalidFallback(key, __assign(__assign({}, ctx), { path: __spread(ctx.path, [index, "key"]), parentError: ctx.currentError }));
                }),
                new PseudoPromise().then(function () {
                    var mapValue = _this._def.valueType._parseWithInvalidFallback(value, __assign(__assign({}, ctx), { path: __spread(ctx.path, [index, "value"]), parentError: ctx.currentError }));
                    return mapValue;
                }),
            ]).then(function (item) {
                returnedMap.set(item[0], item[1]);
            });
        })).then(function () {
            return returnedMap;
        });
    };
    ZodMap.create = function (keyType, valueType) {
        return new ZodMap({
            valueType: valueType,
            keyType: keyType,
        });
    };
    return ZodMap;
}(ZodType));
export { ZodMap };
var ZodSet = /** @class */ (function (_super) {
    __extends(ZodSet, _super);
    function ZodSet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodSet.prototype._parse = function (ctx) {
        var _this = this;
        if (ctx.parsedType !== ZodParsedType.set) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.set,
                received: ctx.parsedType,
            });
            return;
        }
        var dataSet = ctx.data;
        var returnedSet = new Set();
        return PseudoPromise.all(__spread(dataSet.values()).map(function (item, i) {
            return new PseudoPromise()
                .then(function () {
                return _this._def.valueType._parseWithInvalidFallback(item, __assign(__assign({}, ctx), { path: __spread(ctx.path, [i]), parentError: ctx.currentError }));
            })
                .then(function (item) {
                returnedSet.add(item);
            });
        })).then(function () {
            return returnedSet;
        });
    };
    ZodSet.create = function (valueType) {
        return new ZodSet({
            valueType: valueType,
        });
    };
    return ZodSet;
}(ZodType));
export { ZodSet };
var ZodFunction = /** @class */ (function (_super) {
    __extends(ZodFunction, _super);
    function ZodFunction() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.args = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            return new ZodFunction(__assign(__assign({}, _this._def), { args: ZodTuple.create(items) }));
        };
        _this.returns = function (returnType) {
            return new ZodFunction(__assign(__assign({}, _this._def), { returns: returnType }));
        };
        _this.implement = function (func) {
            var validatedFunc = _this.parse(func);
            return validatedFunc;
        };
        _this.validate = _this.implement;
        return _this;
    }
    ZodFunction.prototype._parse = function (ctx) {
        var _this = this;
        if (ctx.parsedType !== ZodParsedType.function) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.function,
                received: ctx.parsedType,
            });
            return;
        }
        var isAsyncFunction = this._def.returns instanceof ZodPromise;
        var validatedFunction = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var argsError = new ZodError([]);
            var returnsError = new ZodError([]);
            var internalProm = new PseudoPromise()
                .then(function () {
                return _this._def.args._parseWithInvalidFallback(args, __assign(__assign({}, ctx), { parentError: argsError, async: isAsyncFunction }));
            })
                .then(function (args) {
                if (!argsError.isEmpty) {
                    var newError = new ZodError([]);
                    var issue = ctx.makeIssue({
                        code: ZodIssueCode.invalid_arguments,
                        argumentsError: argsError,
                    });
                    newError.addIssue(issue);
                    throw newError;
                }
                return args;
            })
                .then(function (args) {
                return ctx.data.apply(ctx, __spread(args));
            })
                .then(function (result) {
                return _this._def.returns._parseWithInvalidFallback(result, __assign(__assign({}, ctx), { parentError: returnsError, async: isAsyncFunction }));
            })
                .then(function (result) {
                if (!returnsError.isEmpty) {
                    var newError = new ZodError([]);
                    var issue = ctx.makeIssue({
                        code: ZodIssueCode.invalid_return_type,
                        returnTypeError: returnsError,
                    });
                    newError.addIssue(issue);
                    throw newError;
                }
                return result;
            });
            if (isAsyncFunction) {
                return internalProm.getValueAsync();
            }
            else {
                return internalProm.getValueSync();
            }
        };
        return validatedFunction;
    };
    ZodFunction.create = function (args, returns) {
        return new ZodFunction({
            args: args || ZodTuple.create([]),
            returns: returns || ZodUnknown.create(),
        });
    };
    return ZodFunction;
}(ZodType));
export { ZodFunction };
var ZodLazy = /** @class */ (function (_super) {
    __extends(ZodLazy, _super);
    function ZodLazy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ZodLazy.prototype, "schema", {
        get: function () {
            return this._def.getter();
        },
        enumerable: false,
        configurable: true
    });
    ZodLazy.prototype._parse = function (ctx) {
        var lazySchema = this._def.getter();
        return PseudoPromise.resolve(lazySchema._parseWithInvalidFallback(ctx.data, __assign(__assign({}, ctx), { parentError: ctx.currentError })));
    };
    ZodLazy.create = function (getter) {
        return new ZodLazy({
            getter: getter,
        });
    };
    return ZodLazy;
}(ZodType));
export { ZodLazy };
var ZodLiteral = /** @class */ (function (_super) {
    __extends(ZodLiteral, _super);
    function ZodLiteral() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodLiteral.prototype._parse = function (ctx) {
        if (ctx.data !== this._def.value) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: this._def.value,
                received: ctx.data,
            });
            return;
        }
        return ctx.data;
    };
    ZodLiteral.create = function (value) {
        return new ZodLiteral({
            value: value,
        });
    };
    return ZodLiteral;
}(ZodType));
export { ZodLiteral };
var ZodEnum = /** @class */ (function (_super) {
    __extends(ZodEnum, _super);
    function ZodEnum() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodEnum.prototype._parse = function (ctx) {
        if (this._def.values.indexOf(ctx.data) === -1) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_enum_value,
                options: this._def.values,
            });
            return;
        }
        return ctx.data;
    };
    Object.defineProperty(ZodEnum.prototype, "options", {
        get: function () {
            return this._def.values;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodEnum.prototype, "enum", {
        get: function () {
            var e_5, _a;
            var enumValues = {};
            try {
                for (var _b = __values(this._def.values), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var val = _c.value;
                    enumValues[val] = val;
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return enumValues;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodEnum.prototype, "Values", {
        get: function () {
            var e_6, _a;
            var enumValues = {};
            try {
                for (var _b = __values(this._def.values), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var val = _c.value;
                    enumValues[val] = val;
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
            }
            return enumValues;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodEnum.prototype, "Enum", {
        get: function () {
            var e_7, _a;
            var enumValues = {};
            try {
                for (var _b = __values(this._def.values), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var val = _c.value;
                    enumValues[val] = val;
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
            }
            return enumValues;
        },
        enumerable: false,
        configurable: true
    });
    ZodEnum.create = function (values) {
        return new ZodEnum({
            values: values,
        });
    };
    return ZodEnum;
}(ZodType));
export { ZodEnum };
var ZodNativeEnum = /** @class */ (function (_super) {
    __extends(ZodNativeEnum, _super);
    function ZodNativeEnum() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodNativeEnum.prototype._parse = function (ctx) {
        var nativeEnumValues = util.getValidEnumValues(this._def.values);
        if (nativeEnumValues.indexOf(ctx.data) === -1) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_enum_value,
                options: util.objectValues(nativeEnumValues),
            });
            return;
        }
        return ctx.data;
    };
    ZodNativeEnum.create = function (values) {
        return new ZodNativeEnum({
            values: values,
        });
    };
    return ZodNativeEnum;
}(ZodType));
export { ZodNativeEnum };
var ZodPromise = /** @class */ (function (_super) {
    __extends(ZodPromise, _super);
    function ZodPromise() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodPromise.prototype._parse = function (ctx) {
        var _this = this;
        if (ctx.parsedType !== ZodParsedType.promise && ctx.async === false) {
            ctx.addIssue({
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.promise,
                received: ctx.parsedType,
            });
            return;
        }
        var promisified = ctx.parsedType === ZodParsedType.promise
            ? ctx.data
            : Promise.resolve(ctx.data);
        var promiseError = new ZodError([]);
        return PseudoPromise.resolve(promisified
            .then(function (data) {
            var value = _this._def.type._parseWithInvalidFallback(data, __assign(__assign({}, ctx), { parentError: promiseError }));
            return value;
        })
            .then(function (data) {
            if (!promiseError.isEmpty) {
                throw promiseError;
            }
            return data;
        }));
    };
    ZodPromise.create = function (schema) {
        return new ZodPromise({
            type: schema,
        });
    };
    return ZodPromise;
}(ZodType));
export { ZodPromise };
var ZodEffects = /** @class */ (function (_super) {
    __extends(ZodEffects, _super);
    function ZodEffects(def) {
        var _this = _super.call(this, def) || this;
        if (def.schema instanceof ZodEffects) {
            throw new Error("ZodEffectss cannot be nested.");
        }
        return _this;
    }
    ZodEffects.prototype._parse = function (ctx) {
        var e_8, _a;
        var _this = this;
        var isSync = ctx.async === false || this instanceof ZodPromise;
        var effects = this._def.effects || [];
        var checkCtx = {
            addIssue: function (arg) {
                ctx.addIssue(arg);
            },
            path: ctx.path,
        };
        // let refinementError: Error | null = null;
        var THROW_ERROR_IF_PRESENT = function (key) { return function (data) {
            key;
            if (!ctx.currentError.isEmpty)
                throw ctx.currentError;
            // if (ctx.data === INVALID) throw ctx.currentError;
            // if (refinementError !== null) throw refinementError;
            return data;
        }; };
        var finalPromise = new PseudoPromise()
            .then(function () {
            return _this._def.schema._parseWithInvalidFallback(ctx.data, __assign(__assign({}, ctx), { parentError: ctx.currentError }));
        })
            .then(THROW_ERROR_IF_PRESENT("pre-refinement"));
        var _loop_4 = function (effect) {
            if (effect.type === "refinement") {
                finalPromise = finalPromise
                    .all(function (data) {
                    return [
                        PseudoPromise.resolve(data),
                        PseudoPromise.resolve(data).then(function () {
                            var result = effect.refinement(data, checkCtx);
                            // try {
                            //   result = effect.refinement(data, checkCtx);
                            // } catch (err) {
                            //   throw err;
                            //   // if (refinementError === null) refinementError = err;
                            // }
                            if (isSync && result instanceof Promise)
                                throw new Error("You can't use .parse() on a schema containing async refinements. Use .parseAsync instead.");
                            return result;
                        }),
                    ];
                })
                    .then(function (_a) {
                    var _b = __read(_a, 2), data = _b[0], _ = _b[1];
                    return data;
                });
            }
            else if (effect.type === "transform") {
                finalPromise = finalPromise
                    .then(THROW_ERROR_IF_PRESENT("before transform"))
                    .then(function (data) {
                    if (!(_this instanceof ZodEffects))
                        throw new Error("Only transformers can contain transformation functions.");
                    var newData = effect.transform(data);
                    return newData;
                })
                    .then(function (data) {
                    if (isSync && data instanceof Promise) {
                        throw new Error("You can't use .parse() on a schema containing async transformations. Use .parseAsync instead.");
                    }
                    return data;
                });
            }
            else {
                throw new Error("Invalid effect type.");
            }
        };
        try {
            for (var effects_1 = __values(effects), effects_1_1 = effects_1.next(); !effects_1_1.done; effects_1_1 = effects_1.next()) {
                var effect = effects_1_1.value;
                _loop_4(effect);
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (effects_1_1 && !effects_1_1.done && (_a = effects_1.return)) _a.call(effects_1);
            }
            finally { if (e_8) throw e_8.error; }
        }
        return finalPromise;
    };
    ZodEffects.create = function (schema) {
        var newTx = new ZodEffects({
            schema: schema,
        });
        return newTx;
    };
    return ZodEffects;
}(ZodType));
export { ZodEffects };
export { ZodEffects as ZodTransformer };
var ZodOptional = /** @class */ (function (_super) {
    __extends(ZodOptional, _super);
    function ZodOptional() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodOptional.prototype._parse = function (ctx) {
        var _this = this;
        var data = ctx.data;
        if (ctx.parsedType === ZodParsedType.undefined) {
            if (this._def.defaultValue !== undefined) {
                data = this._def.defaultValue();
            }
            else {
                return undefined;
            }
        }
        return new PseudoPromise().then(function () {
            return _this._def.innerType._parseWithInvalidFallback(data, __assign(__assign({}, ctx), { parentError: ctx.currentError }));
        });
    };
    ZodOptional.prototype.unwrap = function () {
        return this._def.innerType;
    };
    ZodOptional.prototype.removeDefault = function () {
        return new ZodOptional(__assign(__assign({}, this._def), { defaultValue: undefined }));
    };
    ZodOptional.create = function (type) {
        if (type instanceof ZodOptional)
            return type;
        return new ZodOptional({
            innerType: type,
            defaultValue: undefined,
        });
    };
    return ZodOptional;
}(ZodType));
export { ZodOptional };
var ZodNullable = /** @class */ (function (_super) {
    __extends(ZodNullable, _super);
    function ZodNullable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ZodNullable.prototype._parse = function (ctx) {
        var _this = this;
        if (ctx.parsedType === ZodParsedType.null) {
            return null;
        }
        return new PseudoPromise().then(function () {
            return _this._def.innerType._parseWithInvalidFallback(ctx.data, __assign(__assign({}, ctx), { parentError: ctx.currentError }));
        });
    };
    ZodNullable.prototype.unwrap = function () {
        return this._def.innerType;
    };
    ZodNullable.create = function (type) {
        // An nullable nullable is the original nullable
        if (type instanceof ZodNullable)
            return type;
        return new ZodNullable({
            innerType: type,
        });
    };
    return ZodNullable;
}(ZodType));
export { ZodNullable };
export var custom = function (check, params) {
    if (check)
        return ZodAny.create().refine(check, params);
    return ZodAny.create();
};
export { ZodType as Schema, ZodType as ZodSchema };
export var late = {
    object: ZodObject.lazycreate,
};
var instanceOfType = function (cls, params) {
    if (params === void 0) { params = {
        message: "Input not instance of " + cls.name,
    }; }
    return custom(function (data) { return data instanceof cls; }, params);
};
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var ostring = function () { return stringType().optional(); };
var onumber = function () { return numberType().optional(); };
var oboolean = function () { return booleanType().optional(); };
export { anyType as any, arrayType as array, bigIntType as bigint, booleanType as boolean, dateType as date, effectsType as effect, enumType as enum, functionType as function, instanceOfType as instanceof, intersectionType as intersection, lazyType as lazy, literalType as literal, mapType as map, nativeEnumType as nativeEnum, neverType as never, nullType as null, nullableType as nullable, numberType as number, objectType as object, oboolean, onumber, optionalType as optional, ostring, promiseType as promise, recordType as record, setType as set, strictObjectType as strictObject, stringType as string, effectsType as transformer, tupleType as tuple, undefinedType as undefined, unionType as union, unknownType as unknown, voidType as void, };
//# sourceMappingURL=types.js.map