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
exports.__esModule = true;
var z = require("./base");
var undefined_1 = require("./undefined");
var null_1 = require("./null");
var union_1 = require("./union");
var intersection_1 = require("./intersection");
var mergeShapes = function (first, second) {
    var firstKeys = Object.keys(first);
    var secondKeys = Object.keys(second);
    var sharedKeys = firstKeys.filter(function (k) { return secondKeys.indexOf(k) !== -1; });
    var sharedShape = {};
    for (var _i = 0, sharedKeys_1 = sharedKeys; _i < sharedKeys_1.length; _i++) {
        var k = sharedKeys_1[_i];
        sharedShape[k] = intersection_1.ZodIntersection.create(first[k], second[k]);
    }
    return __assign(__assign(__assign({}, first), second), sharedShape);
};
var mergeObjects = function (first) { return function (second) {
    var mergedShape = mergeShapes(first._def.shape, second._def.shape);
    var merged = new ZodObject({
        t: z.ZodTypes.object,
        strict: first._def.strict && second._def.strict,
        shape: mergedShape
    });
    return merged;
}; };
var objectDefToJson = function (def) { return ({
    t: def.t,
    shape: Object.assign({}, Object.keys(def.shape).map(function (k) {
        var _a;
        return (_a = {},
            _a[k] = def.shape[k].toJSON(),
            _a);
    }))
}); };
// type SetKeyTest = SetKey<{asdf:string},"asdf",number>;
var ZodObject = /** @class */ (function (_super) {
    __extends(ZodObject, _super);
    function ZodObject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.toJSON = function () { return objectDefToJson(_this._def); };
        _this.nonstrict = function () {
            return new ZodObject({
                shape: _this._def.shape,
                strict: false,
                t: z.ZodTypes.object
            });
        };
        // interface = ()=>
        /**
         * Prior to zod@1.0.12 there was a bug in the
         * inferred type of merged objects. Please
         * upgrade if you are experiencing issues.
         */
        _this.merge = mergeObjects(_this);
        _this.optional = function () { return union_1.ZodUnion.create([_this, undefined_1.ZodUndefined.create()]); };
        _this.nullable = function () { return union_1.ZodUnion.create([_this, null_1.ZodNull.create()]); };
        return _this;
    }
    ZodObject.create = function (shape) {
        return new ZodObject({
            t: z.ZodTypes.object,
            strict: true,
            shape: shape
        });
    };
    return ZodObject;
}(z.ZodType));
exports.ZodObject = ZodObject;
// export interface ZodInterfaceDef<T extends z.ZodRawShape = z.ZodRawShape> extends z.ZodTypeDef {
//   t: z.ZodTypes.interface;
//   shape: T; //{ [k in keyof T]: T[k]['_def'] };
// }
// const mergeInterfaces = <U extends z.ZodRawShape>(first: ZodInterface<U>) => <T extends z.ZodRawShape>(
//   second: ZodInterface<T>,
// ): ZodInterface<T & U> => {
//   const mergedShape = mergeShapes(first._def.shape, second._def.shape);
//   const merged: ZodInterface<T & U> = ZodInterface.create(mergedShape);
//   return merged;
// };
// export class ZodInterface<T extends z.ZodRawShape> extends z.ZodType<
//   ObjectType<{ [k in keyof T]: T[k] }> & { [k: string]: any }, // { [k in keyof T]: T[k]['_type'] },
//   ZodInterfaceDef<T>
// > {
//   toJSON = () => objectDefToJson(this._def);
//   toObject = () => ZodObject.create(this._def.shape);
//   /**
//    * Prior to zod@1.0.12 there was a bug in the
//    * inferred type of merged objects. Please
//    * upgrade if you are experiencing issues.
//    */
//   merge: <U extends z.ZodRawShape>(other: ZodInterface<U>) => ZodInterface<Flatten<T & U>> = mergeInterfaces(this);
//   optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
//   nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
//   static create = <T extends z.ZodRawShape>(shape: T): ZodInterface<T> => {
//     return new ZodInterface({
//       t: z.ZodTypes.interface,
//       shape,
//     });
//   };
// }
