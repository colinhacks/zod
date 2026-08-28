"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = exports.equals = exports.is = void 0;
const typia_1 = __importDefault(require("typia"));
exports.is = (() => { const _io0 = input => "number" === typeof input.number && "number" === typeof input.negNumber && "number" === typeof input.maxNumber && "string" === typeof input.string && "string" === typeof input.longString && "boolean" === typeof input.boolean && ("object" === typeof input.deeplyNested && null !== input.deeplyNested && _io1(input.deeplyNested)); const _io1 = input => "string" === typeof input.foo && "number" === typeof input.num && "boolean" === typeof input.bool; return input => "object" === typeof input && null !== input && _io0(input); })();
exports.equals = (() => { const _io0 = (input, _exceptionable = true) => "number" === typeof input.number && "number" === typeof input.negNumber && "number" === typeof input.maxNumber && "string" === typeof input.string && "string" === typeof input.longString && "boolean" === typeof input.boolean && ("object" === typeof input.deeplyNested && null !== input.deeplyNested && _io1(input.deeplyNested, true && _exceptionable)) && (7 === Object.keys(input).length || Object.keys(input).every(key => {
    if (["number", "negNumber", "maxNumber", "string", "longString", "boolean", "deeplyNested"].some(prop => key === prop))
        return true;
    const value = input[key];
    if (undefined === value)
        return true;
    return false;
})); const _io1 = (input, _exceptionable = true) => "string" === typeof input.foo && "number" === typeof input.num && "boolean" === typeof input.bool && (3 === Object.keys(input).length || Object.keys(input).every(key => {
    if (["foo", "num", "bool"].some(prop => key === prop))
        return true;
    const value = input[key];
    if (undefined === value)
        return true;
    return false;
})); return (input, _exceptionable = true) => "object" === typeof input && null !== input && _io0(input, true); })();
exports.clone = (() => { const _co0 = input => ({
    number: input.number,
    negNumber: input.negNumber,
    maxNumber: input.maxNumber,
    string: input.string,
    longString: input.longString,
    boolean: input.boolean,
    deeplyNested: _co1(input.deeplyNested)
}); const _co1 = input => ({
    foo: input.foo,
    num: input.num,
    bool: input.bool
}); const _io1 = input => "string" === typeof input.foo && "number" === typeof input.num && "boolean" === typeof input.bool; return input => _co0(input); })();
