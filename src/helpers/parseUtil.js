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
import { defaultErrorMap, } from "../ZodError";
import { util } from "./util";
export var ZodParsedType = util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set",
]);
export var getParsedType = function (data) {
    if (typeof data === "string")
        return ZodParsedType.string;
    if (typeof data === "number") {
        if (Number.isNaN(data))
            return ZodParsedType.nan;
        return ZodParsedType.number;
    }
    if (typeof data === "boolean")
        return ZodParsedType.boolean;
    if (typeof data === "bigint")
        return ZodParsedType.bigint;
    if (typeof data === "symbol")
        return ZodParsedType.symbol;
    if (data instanceof Date)
        return ZodParsedType.date;
    if (typeof data === "function")
        return ZodParsedType.function;
    if (data === undefined)
        return ZodParsedType.undefined;
    if (typeof data === "undefined")
        return ZodParsedType.undefined;
    if (typeof data === "object") {
        if (Array.isArray(data))
            return ZodParsedType.array;
        if (data === null)
            return ZodParsedType.null;
        if (data.then &&
            typeof data.then === "function" &&
            data.catch &&
            typeof data.catch === "function") {
            return ZodParsedType.promise;
        }
        if (data instanceof Map) {
            return ZodParsedType.map;
        }
        if (data instanceof Set) {
            return ZodParsedType.set;
        }
        return ZodParsedType.object;
    }
    return ZodParsedType.unknown;
};
export var issueHelpers = function (error, params) {
    var makeIssue = function (errorData) {
        var errorArg = __assign(__assign({}, errorData), { path: __spread(params.path, (errorData.path || [])) });
        var defaultError = defaultErrorMap === params.errorMap
            ? { message: "Invalid value" }
            : defaultErrorMap(errorArg, {
                data: params.data,
                defaultError: "Invalid value",
            });
        var issue = __assign(__assign({}, errorData), { path: __spread(params.path, (errorData.path || [])), message: errorData.message ||
                params.errorMap(errorArg, {
                    data: params.data,
                    defaultError: defaultError.message,
                }).message });
        return issue;
    };
    var addIssue = function (errorData) {
        var issue = makeIssue(errorData);
        error.addIssue(issue);
    };
    return {
        makeIssue: makeIssue,
        addIssue: addIssue,
    };
};
//# sourceMappingURL=parseUtil.js.map