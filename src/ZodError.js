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
import { util } from "./helpers/util";
export var ZodIssueCode = util.arrayToEnum([
    "invalid_type",
    "custom",
    "invalid_union",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
]);
export var quotelessJson = function (obj) {
    var json = JSON.stringify(obj, null, 2); // {"name":"John Smith"}
    return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = /** @class */ (function (_super) {
    __extends(ZodError, _super);
    function ZodError(issues) {
        var _newTarget = this.constructor;
        var _this = _super.call(this) || this;
        _this.issues = [];
        _this.format = function () {
            var fieldErrors = { _errors: [] };
            var processError = function (error) {
                var e_1, _a;
                try {
                    for (var _b = __values(error.issues), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var issue = _c.value;
                        if (issue.code === "invalid_union") {
                            issue.unionErrors.map(processError);
                        }
                        else if (issue.code === "invalid_return_type") {
                            processError(issue.returnTypeError);
                        }
                        else if (issue.code === "invalid_arguments") {
                            processError(issue.argumentsError);
                        }
                        else if (issue.path.length === 0) {
                            fieldErrors._errors.push(issue.message);
                        }
                        else {
                            var curr = fieldErrors;
                            var i = 0;
                            while (i < issue.path.length) {
                                var el = issue.path[i];
                                var terminal = i === issue.path.length - 1;
                                if (!terminal) {
                                    if (typeof el === "string") {
                                        curr[el] = curr[el] || { _errors: [] };
                                    }
                                    else if (typeof el === "number") {
                                        var errorArray = [];
                                        errorArray._errors = [];
                                        curr[el] = curr[el] || errorArray;
                                    }
                                }
                                else {
                                    curr[el] = curr[el] || { _errors: [] };
                                    curr[el]._errors.push(issue.message);
                                }
                                curr = curr[el];
                                i++;
                            }
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            };
            processError(_this);
            return fieldErrors;
        };
        _this.addIssue = function (sub) {
            _this.issues = __spread(_this.issues, [sub]);
        };
        _this.addIssues = function (subs) {
            if (subs === void 0) { subs = []; }
            _this.issues = __spread(_this.issues, subs);
        };
        _this.flatten = function () {
            var e_2, _a;
            var fieldErrors = {};
            var formErrors = [];
            try {
                for (var _b = __values(_this.issues), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var sub = _c.value;
                    if (sub.path.length > 0) {
                        fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
                        fieldErrors[sub.path[0]].push(sub.message);
                    }
                    else {
                        formErrors.push(sub.message);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return { formErrors: formErrors, fieldErrors: fieldErrors };
        };
        // restore prototype chain
        var actualProto = _newTarget.prototype;
        Object.setPrototypeOf(_this, actualProto);
        _this.issues = issues;
        return _this;
    }
    Object.defineProperty(ZodError.prototype, "errors", {
        get: function () {
            return this.issues;
        },
        enumerable: false,
        configurable: true
    });
    ZodError.prototype.toString = function () {
        return "ZodError: " + JSON.stringify(this.issues, null, 2);
    };
    Object.defineProperty(ZodError.prototype, "message", {
        get: function () {
            return JSON.stringify(this.issues, null, 2);
            // const errorMessage: string[] = [
            //   `${this.issues.length} validation issue(s)`,
            //   '',
            // ];
            // for (const err of this.issues) {
            //   errorMessage.push(
            //     `  Issue #${this.issues.indexOf(err)}: ${err.code} at ${err.path.join(
            //       '.',
            //     )}`,
            //   );
            //   errorMessage.push(`  ` + err.message);
            //   errorMessage.push('');
            // }
            // return errorMessage.join('\n');
            // return quotelessJson(this);
            // .map(({ path, message }) => {
            //   return path.length ? `${path.join('./index')}: ${message}` : `${message}`;
            // })
            // .join('\n');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodError.prototype, "isEmpty", {
        get: function () {
            return this.issues.length === 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZodError.prototype, "formErrors", {
        // denormalize = ():DenormalizedError{
        // }
        get: function () {
            return this.flatten();
        },
        enumerable: false,
        configurable: true
    });
    ZodError.create = function (issues) {
        var error = new ZodError(issues);
        return error;
    };
    return ZodError;
}(Error));
export { ZodError };
export var defaultErrorMap = function (error, _ctx) {
    var message;
    switch (error.code) {
        case ZodIssueCode.invalid_type:
            if (error.received === "undefined") {
                message = "Required";
            }
            else {
                message = "Expected " + error.expected + ", received " + error.received;
            }
            break;
        case ZodIssueCode.unrecognized_keys:
            message = "Unrecognized key(s) in object: " + error.keys
                .map(function (k) { return "'" + k + "'"; })
                .join(", ");
            break;
        case ZodIssueCode.invalid_union:
            message = "Invalid input";
            break;
        case ZodIssueCode.invalid_enum_value:
            message = "Invalid enum value. Expected " + error.options
                .map(function (val) { return (typeof val === "string" ? "'" + val + "'" : val); })
                .join(" | ") + ", received " + (typeof _ctx.data === "string" ? "'" + _ctx.data + "'" : _ctx.data);
            break;
        case ZodIssueCode.invalid_arguments:
            message = "Invalid function arguments";
            break;
        case ZodIssueCode.invalid_return_type:
            message = "Invalid function return type";
            break;
        case ZodIssueCode.invalid_date:
            message = "Invalid date";
            break;
        // case ZodIssueCode.too_small:
        //   const tooShortNoun = _ctx.data === 'string' ? 'characters' : 'items';
        //   message = `Too short, should be at least ${error.minimum} ${tooShortNoun}`;
        //   break;
        // case ZodIssueCode.too_big:
        //   const tooLongNoun = _ctx.data === 'string' ? 'characters' : 'items';
        //   message = `Too short, should be at most ${error.maximum} ${tooLongNoun}`;
        //   break;
        case ZodIssueCode.invalid_string:
            if (error.validation !== "regex")
                message = "Invalid " + error.validation;
            else
                message = "Invalid";
            break;
        // case ZodIssueCode.invalid_url:
        //   message = 'Invalid URL.';
        //   break;
        // case ZodIssueCode.invalid_uuid:
        //   message = 'Invalid UUID.';
        //   break;
        case ZodIssueCode.too_small:
            if (error.type === "array")
                message = "Should have " + (error.inclusive ? "at least" : "more than") + " " + error.minimum + " items";
            else if (error.type === "string")
                message = "Should be " + (error.inclusive ? "at least" : "over") + " " + error.minimum + " characters";
            else if (error.type === "number")
                message = "Value should be greater than " + (error.inclusive ? "or equal to " : "") + error.minimum;
            else
                message = "Invalid input";
            break;
        case ZodIssueCode.too_big:
            if (error.type === "array")
                message = "Should have " + (error.inclusive ? "at most" : "less than") + " " + error.maximum + " items";
            else if (error.type === "string")
                message = "Should be " + (error.inclusive ? "at most" : "under") + " " + error.maximum + " characters long";
            else if (error.type === "number")
                message = "Value should be less than " + (error.inclusive ? "or equal to " : "") + error.maximum;
            else
                message = "Invalid input";
            break;
        case ZodIssueCode.custom:
            message = "Invalid input.";
            break;
        case ZodIssueCode.invalid_intersection_types:
            message = "Intersections only support objects";
            break;
        default:
            message = "Invalid input.";
            util.assertNever(error);
    }
    return { message: message };
    // return `Invalid input.`;
};
export var setErrorMap = function (map) {
    defaultErrorMap = map;
};
//# sourceMappingURL=ZodError.js.map