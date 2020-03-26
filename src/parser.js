"use strict";
exports.__esModule = true;
var z = require("./types/base");
var ZodError_1 = require("./ZodError");
function assertNever(x) {
    throw ZodError_1.ZodError.fromString('Unexpected object: ' + x);
}
exports.ZodParser = function (schemaDef) { return function (obj) {
    var def = schemaDef;
    switch (def.t) {
        case z.ZodTypes.string:
            if (typeof obj !== 'string')
                throw ZodError_1.ZodError.fromString("Non-string type: " + typeof obj);
            return obj;
        case z.ZodTypes.number:
            if (typeof obj !== 'number')
                throw ZodError_1.ZodError.fromString("Non-number type: " + typeof obj);
            if (Number.isNaN(obj)) {
                throw ZodError_1.ZodError.fromString("Non-number type: NaN");
            }
            return obj;
        case z.ZodTypes.boolean:
            if (typeof obj !== 'boolean')
                throw ZodError_1.ZodError.fromString("Non-boolean type: " + typeof obj);
            return obj;
        case z.ZodTypes.undefined:
            if (obj !== undefined)
                throw ZodError_1.ZodError.fromString("Non-undefined type:Found: " + typeof obj);
            return obj;
        case z.ZodTypes["null"]:
            if (obj !== null)
                throw ZodError_1.ZodError.fromString("Non-null type: " + typeof obj);
            return obj;
        case z.ZodTypes.array:
            if (!Array.isArray(obj))
                throw ZodError_1.ZodError.fromString("Non-array type: " + typeof obj);
            var arrayError_1 = ZodError_1.ZodError.create([]);
            if (def.nonempty === true && obj.length === 0) {
                throw ZodError_1.ZodError.fromString('Array cannot be empty');
            }
            var parsedArray = obj.map(function (item, i) {
                try {
                    var parsedItem = def.type.parse(item);
                    return parsedItem;
                }
                catch (err) {
                    if (err instanceof ZodError_1.ZodError) {
                        arrayError_1.mergeChild(i, err);
                        // arrayErrors.push(`[${i}]: ${err.message}`);
                        return null;
                    }
                    else {
                        arrayError_1.mergeChild(i, ZodError_1.ZodError.fromString(err.message));
                        // arrayErrors.push(`[${i}]: ${err.message}`);
                        return null;
                    }
                }
            });
            if (!arrayError_1.empty) {
                // throw ZodError.fromString(arrayErrors.join('\n\n'));
                throw arrayError_1;
            }
            return parsedArray;
        case z.ZodTypes.object:
            if (typeof obj !== 'object')
                throw ZodError_1.ZodError.fromString("Non-object type: " + typeof obj);
            if (Array.isArray(obj))
                throw ZodError_1.ZodError.fromString("Non-object type: array");
            var shape = def.shape;
            if (def.strict) {
                var shapeKeys_1 = Object.keys(def.shape);
                var objKeys = Object.keys(obj);
                var extraKeys = objKeys.filter(function (k) { return shapeKeys_1.indexOf(k) === -1; });
                if (extraKeys.length) {
                    throw ZodError_1.ZodError.fromString("Unexpected key(s) in object: " + extraKeys.map(function (k) { return "'" + k + "'"; }).join(', '));
                }
            }
            var objectError = ZodError_1.ZodError.create([]);
            for (var key in shape) {
                try {
                    def.shape[key].parse(obj[key]);
                }
                catch (err) {
                    if (err instanceof ZodError_1.ZodError) {
                        objectError.mergeChild(key, err);
                    }
                    else {
                        objectError.mergeChild(key, ZodError_1.ZodError.fromString(err.message));
                    }
                }
            }
            if (!objectError.empty) {
                throw objectError; //ZodError.fromString(objectErrors.join('\n'));
            }
            return obj;
        case z.ZodTypes.union:
            for (var _i = 0, _a = def.options; _i < _a.length; _i++) {
                var option = _a[_i];
                try {
                    option.parse(obj);
                    return obj;
                }
                catch (err) { }
            }
            throw ZodError_1.ZodError.fromString("Type mismatch in union.\nReceived: " + JSON.stringify(obj, null, 2) + "\n\nExpected: " + def.options
                .map(function (x) { return x._def.t; })
                .join(' OR '));
        case z.ZodTypes.intersection:
            var errors = [];
            try {
                def.left.parse(obj);
            }
            catch (err) {
                errors.push("Left side of intersection: " + err.message);
            }
            try {
                def.right.parse(obj);
            }
            catch (err) {
                errors.push("Right side of intersection: " + err.message);
            }
            if (!errors.length) {
                return obj;
            }
            throw ZodError_1.ZodError.fromString(errors.join('\n'));
        case z.ZodTypes.tuple:
            if (!Array.isArray(obj)) {
                throw ZodError_1.ZodError.fromString('Non-array type detected; invalid tuple.');
            }
            if (def.items.length !== obj.length) {
                throw ZodError_1.ZodError.fromString("Incorrect number of elements in tuple: expected " + def.items.length + ", got " + obj.length);
            }
            var parsedTuple = [];
            for (var index in obj) {
                var item = obj[index];
                var itemParser = def.items[index];
                try {
                    parsedTuple.push(itemParser.parse(item));
                }
                catch (err) {
                    if (err instanceof ZodError_1.ZodError) {
                        throw err.bubbleUp(index);
                    }
                    else {
                        throw ZodError_1.ZodError.fromString(err.message);
                    }
                }
            }
            return parsedTuple;
        case z.ZodTypes.lazy:
            var lazySchema = def.getter();
            lazySchema.parse(obj);
            return obj;
        case z.ZodTypes.literal:
            var literalValue = def.value;
            if (typeof literalValue === 'string')
                if (obj === def.value)
                    return obj;
            throw ZodError_1.ZodError.fromString(obj + " !== Literal<" + def.value + ">");
        case z.ZodTypes["enum"]:
            for (var _b = 0, _c = def.values; _b < _c.length; _b++) {
                var literalDef = _c[_b];
                try {
                    literalDef.parse(obj);
                    return obj;
                }
                catch (err) { }
            }
            throw ZodError_1.ZodError.fromString("\"" + obj + "\" does not match any value in enum");
        case z.ZodTypes["function"]:
            return obj;
        default:
            assertNever(def);
    }
}; };
