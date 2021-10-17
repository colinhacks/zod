var errorUtil;
(function(errorUtil1) {
    errorUtil1.errToObj = (message)=>typeof message === "string" ? {
            message
        } : message || {
        }
    ;
    errorUtil1.toString = (message)=>typeof message === "string" ? message : message?.message
    ;
})(errorUtil || (errorUtil = {
}));
var util;
(function(util1) {
    function assertNever(_x) {
        throw new Error();
    }
    util1.assertNever = assertNever;
    util1.arrayToEnum = (items)=>{
        const obj = {
        };
        for (const item of items){
            obj[item] = item;
        }
        return obj;
    };
    util1.getValidEnumValues = (obj)=>{
        const validKeys = objectKeys(obj).filter((k)=>typeof obj[obj[k]] !== "number"
        );
        const filtered = {
        };
        for (const k of validKeys){
            filtered[k] = obj[k];
        }
        return objectValues(filtered);
    };
    util1.objectValues = (obj)=>{
        return objectKeys(obj).map(function(e) {
            return obj[e];
        });
    };
    util1.objectKeys = typeof Object.keys === "function" ? (obj)=>Object.keys(obj)
     : (object)=>{
        const keys = [];
        for(const key in object){
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                keys.push(key);
            }
        }
        return keys;
    };
    util1.find = (arr, checker)=>{
        for (const item of arr){
            if (checker(item)) return item;
        }
        return undefined;
    };
    util1.isInteger = typeof Number.isInteger === "function" ? (val)=>Number.isInteger(val)
     : (val)=>typeof val === "number" && isFinite(val) && Math.floor(val) === val
    ;
})(util || (util = {
}));
const ZodIssueCode1 = util.arrayToEnum([
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
    "not_multiple_of", 
]);
const FATAL_CODES1 = [
    ZodIssueCode1.invalid_type,
    ZodIssueCode1.invalid_date,
    ZodIssueCode1.invalid_intersection_types,
    ZodIssueCode1.invalid_return_type,
    ZodIssueCode1.invalid_arguments,
    ZodIssueCode1.invalid_enum_value, 
];
const quotelessJson1 = (obj)=>{
    const json = JSON.stringify(obj, null, 2);
    return json.replace(/"([^"]+)":/g, "$1:");
};
class ZodError1 extends Error {
    issues = [];
    get errors() {
        return this.issues;
    }
    constructor(issues){
        super();
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        } else {
            this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
    }
    format = ()=>{
        const fieldErrors = {
            _errors: []
        };
        const processError = (error)=>{
            for (const issue of error.issues){
                if (issue.code === "invalid_union") {
                    issue.unionErrors.map(processError);
                } else if (issue.code === "invalid_return_type") {
                    processError(issue.returnTypeError);
                } else if (issue.code === "invalid_arguments") {
                    processError(issue.argumentsError);
                } else if (issue.path.length === 0) {
                    fieldErrors._errors.push(issue.message);
                } else {
                    let curr = fieldErrors;
                    let i = 0;
                    while(i < issue.path.length){
                        const el = issue.path[i];
                        const terminal = i === issue.path.length - 1;
                        if (!terminal) {
                            if (typeof el === "string") {
                                curr[el] = curr[el] || {
                                    _errors: []
                                };
                            } else if (typeof el === "number") {
                                const errorArray = [];
                                errorArray._errors = [];
                                curr[el] = curr[el] || errorArray;
                            }
                        } else {
                            curr[el] = curr[el] || {
                                _errors: []
                            };
                            curr[el]._errors.push(issue.message);
                        }
                        curr = curr[el];
                        i++;
                    }
                }
            }
        };
        processError(this);
        return fieldErrors;
    };
    static create = (issues1)=>{
        const error = new ZodError1(issues1);
        return error;
    };
    toString() {
        return this.message;
    }
    get message() {
        return JSON.stringify(this.issues, null, 2);
    }
    get isEmpty() {
        return this.issues.length === 0;
    }
    addIssue = (sub)=>{
        this.issues = [
            ...this.issues,
            sub
        ];
    };
    addIssues = (subs = [])=>{
        this.issues = [
            ...this.issues,
            ...subs
        ];
    };
    flatten = (mapper = (issue)=>issue.message
    )=>{
        const fieldErrors = {
        };
        const formErrors = [];
        for (const sub of this.issues){
            if (sub.path.length > 0) {
                fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
                fieldErrors[sub.path[0]].push(mapper(sub));
            } else {
                formErrors.push(mapper(sub));
            }
        }
        return {
            formErrors,
            fieldErrors
        };
    };
    get formErrors() {
        return this.flatten();
    }
}
const defaultErrorMap1 = (issue, _ctx)=>{
    let message;
    switch(issue.code){
        case ZodIssueCode1.invalid_type:
            if (issue.received === "undefined") {
                message = "Required";
            } else {
                message = `Expected ${issue.expected}, received ${issue.received}`;
            }
            break;
        case ZodIssueCode1.unrecognized_keys:
            message = `Unrecognized key(s) in object: ${issue.keys.map((k)=>`'${k}'`
            ).join(", ")}`;
            break;
        case ZodIssueCode1.invalid_union:
            message = `Invalid input`;
            break;
        case ZodIssueCode1.invalid_enum_value:
            message = `Invalid enum value. Expected ${issue.options.map((val)=>typeof val === "string" ? `'${val}'` : val
            ).join(" | ")}, received ${typeof _ctx.data === "string" ? `'${_ctx.data}'` : _ctx.data}`;
            break;
        case ZodIssueCode1.invalid_arguments:
            message = `Invalid function arguments`;
            break;
        case ZodIssueCode1.invalid_return_type:
            message = `Invalid function return type`;
            break;
        case ZodIssueCode1.invalid_date:
            message = `Invalid date`;
            break;
        case ZodIssueCode1.invalid_string:
            if (issue.validation !== "regex") message = `Invalid ${issue.validation}`;
            else message = "Invalid";
            break;
        case ZodIssueCode1.too_small:
            if (issue.type === "array") message = `Should have ${issue.inclusive ? `at least` : `more than`} ${issue.minimum} items`;
            else if (issue.type === "string") message = `Should be ${issue.inclusive ? `at least` : `over`} ${issue.minimum} characters`;
            else if (issue.type === "number") message = `Value should be greater than ${issue.inclusive ? `or equal to ` : ``}${issue.minimum}`;
            else message = "Invalid input";
            break;
        case ZodIssueCode1.too_big:
            if (issue.type === "array") message = `Should have ${issue.inclusive ? `at most` : `less than`} ${issue.maximum} items`;
            else if (issue.type === "string") message = `Should be ${issue.inclusive ? `at most` : `under`} ${issue.maximum} characters long`;
            else if (issue.type === "number") message = `Value should be less than ${issue.inclusive ? `or equal to ` : ``}${issue.maximum}`;
            else message = "Invalid input";
            break;
        case ZodIssueCode1.custom:
            message = `Invalid input`;
            break;
        case ZodIssueCode1.invalid_intersection_types:
            message = `Intersection results could not be merged`;
            break;
        case ZodIssueCode1.not_multiple_of:
            message = `Should be multiple of ${issue.multipleOf}`;
            break;
        default:
            message = _ctx.defaultError;
            util.assertNever(issue);
    }
    return {
        message
    };
};
let overrideErrorMap1 = defaultErrorMap1;
const setErrorMap1 = (map)=>{
    overrideErrorMap1 = map;
};
export { ZodIssueCode1 as ZodIssueCode };
export { FATAL_CODES1 as FATAL_CODES };
export { quotelessJson1 as quotelessJson };
export { ZodError1 as ZodError };
export { defaultErrorMap1 as defaultErrorMap };
export { overrideErrorMap1 as overrideErrorMap };
export { setErrorMap1 as setErrorMap };
const ZodParsedType1 = util.arrayToEnum([
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
function cacheAndReturn(data, parsedType, cache) {
    if (cache) cache.set(data, parsedType);
    return parsedType;
}
const getParsedType1 = (data, cache)=>{
    if (cache && cache.has(data)) return cache.get(data);
    const t = typeof data;
    switch(t){
        case "undefined":
            return cacheAndReturn(data, ZodParsedType1.undefined, cache);
        case "string":
            return cacheAndReturn(data, ZodParsedType1.string, cache);
        case "number":
            return cacheAndReturn(data, isNaN(data) ? ZodParsedType1.nan : ZodParsedType1.number, cache);
        case "boolean":
            return cacheAndReturn(data, ZodParsedType1.boolean, cache);
        case "function":
            return cacheAndReturn(data, ZodParsedType1.function, cache);
        case "bigint":
            return cacheAndReturn(data, ZodParsedType1.bigint, cache);
        case "object":
            if (Array.isArray(data)) {
                return cacheAndReturn(data, ZodParsedType1.array, cache);
            }
            if (data === null) {
                return cacheAndReturn(data, ZodParsedType1.null, cache);
            }
            if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
                return cacheAndReturn(data, ZodParsedType1.promise, cache);
            }
            if (data instanceof Map) {
                return cacheAndReturn(data, ZodParsedType1.map, cache);
            }
            if (data instanceof Set) {
                return cacheAndReturn(data, ZodParsedType1.set, cache);
            }
            if (data instanceof Date) {
                return cacheAndReturn(data, ZodParsedType1.date, cache);
            }
            return cacheAndReturn(data, ZodParsedType1.object, cache);
        default:
            return cacheAndReturn(data, ZodParsedType1.unknown, cache);
    }
};
const makeIssue1 = (params)=>{
    const { data , path , errorMaps , issueData  } = params;
    const fullPath = [
        ...path,
        ...issueData.path || []
    ];
    const fullIssue = {
        ...issueData,
        path: fullPath
    };
    let errorMessage = "";
    const maps = errorMaps.filter((m)=>!!m
    ).slice().reverse();
    for (const map of maps){
        errorMessage = map(fullIssue, {
            data,
            defaultError: errorMessage
        }).message;
    }
    return {
        ...issueData,
        path: fullPath,
        message: issueData.message || errorMessage
    };
};
const EMPTY_PATH1 = [];
function addIssueToContext1(ctx, issueData) {
    const issue = makeIssue1({
        issueData: issueData,
        data: ctx.data,
        path: ctx.path,
        errorMaps: [
            ctx.contextualErrorMap,
            ctx.schemaErrorMap,
            overrideErrorMap1,
            defaultErrorMap1
        ].filter((x)=>!!x
        )
    });
    ctx.issues.push(issue);
}
class ParseStatus1 {
    value = "valid";
    dirty() {
        if (this.value === "valid") this.value = "dirty";
    }
    abort() {
        if (this.value !== "aborted") this.value = "aborted";
    }
    static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results){
            if (s.status === "aborted") return INVALID1;
            if (s.status === "dirty") status.dirty();
            arrayValue.push(s.value);
        }
        return {
            status: status.value,
            value: arrayValue
        };
    }
    static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs){
            syncPairs.push({
                key: await pair.key,
                value: await pair.value
            });
        }
        return ParseStatus1.mergeObjectSync(status, syncPairs);
    }
    static mergeObjectSync(status, pairs) {
        const finalObject = {
        };
        for (const pair of pairs){
            const { key , value  } = pair;
            if (key.status === "aborted") return INVALID1;
            if (value.status === "aborted") return INVALID1;
            if (key.status === "dirty") status.dirty();
            if (value.status === "dirty") status.dirty();
            if (typeof value.value !== "undefined" || pair.alwaysSet) {
                finalObject[key.value] = value.value;
            }
        }
        return {
            status: status.value,
            value: finalObject
        };
    }
}
const INVALID1 = Object.freeze({
    status: "aborted"
});
const DIRTY1 = (value)=>({
        status: "dirty",
        value
    })
;
const OK1 = (value)=>({
        status: "valid",
        value
    })
;
const isAborted1 = (x)=>x.status === "aborted"
;
const isDirty1 = (x)=>x.status === "dirty"
;
const isValid1 = (x)=>x.status === "valid"
;
const isAsync1 = (x)=>x instanceof Promise
;
export { ZodParsedType1 as ZodParsedType };
export { getParsedType1 as getParsedType };
export { makeIssue1 as makeIssue };
export { EMPTY_PATH1 as EMPTY_PATH };
export { addIssueToContext1 as addIssueToContext };
export { ParseStatus1 as ParseStatus };
export { INVALID1 as INVALID };
export { DIRTY1 as DIRTY };
export { OK1 as OK };
export { isAborted1 as isAborted };
export { isDirty1 as isDirty };
export { isValid1 as isValid };
export { isAsync1 as isAsync };
const handleResult = (ctx, result)=>{
    if (isValid1(result)) {
        return {
            success: true,
            data: result.value
        };
    } else {
        if (!ctx.issues.length) {
            throw new Error("Validation failed but no issues detected.");
        }
        const error = new ZodError1(ctx.issues);
        return {
            success: false,
            error
        };
    }
};
function processCreateParams(params) {
    if (!params) return {
    };
    if (params.errorMap && (params.invalid_type_error || params.required_error)) {
        throw new Error(`Can't use "invalid" or "required" in conjunction with custom error map.`);
    }
    if (params.errorMap) return {
        errorMap: params.errorMap
    };
    const customMap = (iss, ctx)=>{
        if (iss.code !== "invalid_type") return {
            message: ctx.defaultError
        };
        if (typeof ctx.data === "undefined" && params.required_error) return {
            message: params.required_error
        };
        if (params.invalid_type_error) return {
            message: params.invalid_type_error
        };
        return {
            message: ctx.defaultError
        };
    };
    return {
        errorMap: customMap
    };
}
class ZodType1 {
    _type;
    _output;
    _input;
    _def;
    _processInputParams(input) {
        return {
            status: new ParseStatus1(),
            ctx: {
                ...input.parent,
                data: input.data,
                parsedType: getParsedType1(input.data, input.parent.typeCache),
                schemaErrorMap: this._def.errorMap,
                path: input.path,
                parent: input.parent
            }
        };
    }
    _parseSync(input) {
        const result = this._parse(input);
        if (isAsync1(result)) {
            throw new Error("Synchronous parse encountered promise.");
        }
        return result;
    }
    _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
    }
    parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success) return result.data;
        throw result.error;
    }
    safeParse(data, params) {
        const ctx = {
            path: params?.path || [],
            issues: [],
            contextualErrorMap: params?.errorMap,
            schemaErrorMap: this._def.errorMap,
            async: params?.async ?? false,
            typeCache: new Map(),
            parent: null,
            data,
            parsedType: getParsedType1(data)
        };
        const result = this._parseSync({
            data,
            path: ctx.path,
            parent: ctx
        });
        return handleResult(ctx, result);
    }
    async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success) return result.data;
        throw result.error;
    }
    async safeParseAsync(data, params) {
        const ctx = {
            path: params?.path || [],
            issues: [],
            contextualErrorMap: params?.errorMap,
            schemaErrorMap: this._def.errorMap,
            async: true,
            typeCache: new Map(),
            parent: null,
            data,
            parsedType: getParsedType1(data)
        };
        const maybeAsyncResult = this._parse({
            data,
            path: [],
            parent: ctx
        });
        const result = await (isAsync1(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
    }
    spa = this.safeParseAsync;
    is;
    check;
    refine(check, message) {
        const getIssueProperties = (val)=>{
            if (typeof message === "string" || typeof message === "undefined") {
                return {
                    message
                };
            } else if (typeof message === "function") {
                return message(val);
            } else {
                return message;
            }
        };
        return this._refinement((val, ctx)=>{
            const result = check(val);
            const setError = ()=>ctx.addIssue({
                    code: ZodIssueCode1.custom,
                    ...getIssueProperties(val)
                })
            ;
            if (result instanceof Promise) {
                return result.then((data)=>{
                    if (!data) {
                        setError();
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            if (!result) {
                setError();
                return false;
            } else {
                return true;
            }
        });
    }
    refinement(check, refinementData) {
        return this._refinement((val, ctx)=>{
            if (!check(val)) {
                ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
                return false;
            } else {
                return true;
            }
        });
    }
    _refinement(refinement) {
        return new ZodEffects1({
            schema: this,
            typeName: ZodFirstPartyTypeKind1.ZodEffects,
            effect: {
                type: "refinement",
                refinement
            }
        });
    }
    superRefine = this._refinement;
    constructor(def1){
        this._def = def1;
        this.transform = this.transform.bind(this);
        this.default = this.default.bind(this);
    }
    optional() {
        return ZodOptional1.create(this);
    }
    nullable() {
        return ZodNullable1.create(this);
    }
    nullish() {
        return this.optional().nullable();
    }
    array() {
        return ZodArray1.create(this);
    }
    promise() {
        return ZodPromise1.create(this);
    }
    or(option) {
        return ZodUnion1.create([
            this,
            option
        ]);
    }
    and(incoming) {
        return ZodIntersection1.create(this, incoming);
    }
    transform(transform) {
        return new ZodEffects1({
            schema: this,
            typeName: ZodFirstPartyTypeKind1.ZodEffects,
            effect: {
                type: "transform",
                transform
            }
        });
    }
    default(def) {
        const defaultValueFunc = typeof def === "function" ? def : ()=>def
        ;
        return new ZodDefault1({
            innerType: this,
            defaultValue: defaultValueFunc,
            typeName: ZodFirstPartyTypeKind1.ZodDefault
        });
    }
    isOptional() {
        return this.safeParse(undefined).success;
    }
    isNullable() {
        return this.safeParse(null).success;
    }
}
export { ZodType1 as ZodType };
const cuidRegex = /^c[^\s-]{8,}$/i;
const uuidRegex = /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
class ZodString1 extends ZodType1 {
    _parse(input) {
        const { status , ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.string) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.string,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        for (const check of this._def.checks){
            if (check.kind === "min") {
                if (ctx.data.length < check.value) {
                    addIssueToContext1(ctx, {
                        code: ZodIssueCode1.too_small,
                        minimum: check.value,
                        type: "string",
                        inclusive: true,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "max") {
                if (ctx.data.length > check.value) {
                    addIssueToContext1(ctx, {
                        code: ZodIssueCode1.too_big,
                        maximum: check.value,
                        type: "string",
                        inclusive: true,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "email") {
                if (!emailRegex.test(ctx.data)) {
                    addIssueToContext1(ctx, {
                        validation: "email",
                        code: ZodIssueCode1.invalid_string,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "uuid") {
                if (!uuidRegex.test(ctx.data)) {
                    addIssueToContext1(ctx, {
                        validation: "uuid",
                        code: ZodIssueCode1.invalid_string,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "cuid") {
                if (!cuidRegex.test(ctx.data)) {
                    addIssueToContext1(ctx, {
                        validation: "cuid",
                        code: ZodIssueCode1.invalid_string,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "url") {
                try {
                    new URL(ctx.data);
                } catch  {
                    addIssueToContext1(ctx, {
                        validation: "url",
                        code: ZodIssueCode1.invalid_string,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "regex") {
                check.regex.lastIndex = 0;
                const testResult = check.regex.test(ctx.data);
                if (!testResult) {
                    addIssueToContext1(ctx, {
                        validation: "regex",
                        code: ZodIssueCode1.invalid_string,
                        message: check.message
                    });
                    status.dirty();
                }
            }
        }
        return {
            status: status.value,
            value: ctx.data
        };
    }
    _regex = (regex, validation, message)=>this.refinement((data)=>regex.test(data)
        , {
            validation,
            code: ZodIssueCode1.invalid_string,
            ...errorUtil.errToObj(message)
        })
    ;
    _addCheck(check) {
        return new ZodString1({
            ...this._def,
            checks: [
                ...this._def.checks,
                check
            ]
        });
    }
    email(message) {
        return this._addCheck({
            kind: "email",
            ...errorUtil.errToObj(message)
        });
    }
    url(message) {
        return this._addCheck({
            kind: "url",
            ...errorUtil.errToObj(message)
        });
    }
    uuid(message) {
        return this._addCheck({
            kind: "uuid",
            ...errorUtil.errToObj(message)
        });
    }
    cuid(message) {
        return this._addCheck({
            kind: "cuid",
            ...errorUtil.errToObj(message)
        });
    }
    regex(regex, message) {
        return this._addCheck({
            kind: "regex",
            regex: regex,
            ...errorUtil.errToObj(message)
        });
    }
    min(minLength, message) {
        return this._addCheck({
            kind: "min",
            value: minLength,
            ...errorUtil.errToObj(message)
        });
    }
    max(maxLength, message) {
        return this._addCheck({
            kind: "max",
            value: maxLength,
            ...errorUtil.errToObj(message)
        });
    }
    length(len, message) {
        return this.min(len, message).max(len, message);
    }
    nonempty = (message)=>this.min(1, errorUtil.errToObj(message))
    ;
    get isEmail() {
        return !!this._def.checks.find((ch)=>ch.kind === "email"
        );
    }
    get isURL() {
        return !!this._def.checks.find((ch)=>ch.kind === "url"
        );
    }
    get isUUID() {
        return !!this._def.checks.find((ch)=>ch.kind === "uuid"
        );
    }
    get isCUID() {
        return !!this._def.checks.find((ch)=>ch.kind === "cuid"
        );
    }
    get minLength() {
        let min = -Infinity;
        this._def.checks.map((ch)=>{
            if (ch.kind === "min") {
                if (min === null || ch.value > min) {
                    min = ch.value;
                }
            }
        });
        return min;
    }
    get maxLength() {
        let max = null;
        this._def.checks.map((ch)=>{
            if (ch.kind === "max") {
                if (max === null || ch.value < max) {
                    max = ch.value;
                }
            }
        });
        return max;
    }
    static create = (params)=>{
        return new ZodString1({
            checks: [],
            typeName: ZodFirstPartyTypeKind1.ZodString,
            ...processCreateParams(params)
        });
    };
}
export { ZodString1 as ZodString };
class ZodNumber1 extends ZodType1 {
    _parse(input) {
        const { status , ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.number) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.number,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        for (const check of this._def.checks){
            if (check.kind === "int") {
                if (!util.isInteger(ctx.data)) {
                    addIssueToContext1(ctx, {
                        code: ZodIssueCode1.invalid_type,
                        expected: "integer",
                        received: "float",
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "min") {
                const tooSmall = check.inclusive ? ctx.data < check.value : ctx.data <= check.value;
                if (tooSmall) {
                    addIssueToContext1(ctx, {
                        code: ZodIssueCode1.too_small,
                        minimum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "max") {
                const tooBig = check.inclusive ? ctx.data > check.value : ctx.data >= check.value;
                if (tooBig) {
                    addIssueToContext1(ctx, {
                        code: ZodIssueCode1.too_big,
                        maximum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        message: check.message
                    });
                    status.dirty();
                }
            } else if (check.kind === "multipleOf") {
                if (ctx.data % check.value !== 0) {
                    addIssueToContext1(ctx, {
                        code: ZodIssueCode1.not_multiple_of,
                        multipleOf: check.value,
                        message: check.message
                    });
                    status.dirty();
                }
            } else {
                util.assertNever(check);
            }
        }
        return {
            status: status.value,
            value: ctx.data
        };
    }
    static create = (params)=>{
        return new ZodNumber1({
            checks: [],
            typeName: ZodFirstPartyTypeKind1.ZodNumber,
            ...processCreateParams(params),
            ...processCreateParams(params)
        });
    };
    gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    min = this.gte;
    gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    max = this.lte;
    lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
        return new ZodNumber1({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind,
                    value,
                    inclusive,
                    message: errorUtil.toString(message)
                }, 
            ]
        });
    }
    _addCheck(check) {
        return new ZodNumber1({
            ...this._def,
            checks: [
                ...this._def.checks,
                check
            ]
        });
    }
    int(message) {
        return this._addCheck({
            kind: "int",
            message: errorUtil.toString(message)
        });
    }
    positive(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: false,
            message: errorUtil.toString(message)
        });
    }
    negative(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: false,
            message: errorUtil.toString(message)
        });
    }
    nonpositive(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: true,
            message: errorUtil.toString(message)
        });
    }
    nonnegative(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: true,
            message: errorUtil.toString(message)
        });
    }
    multipleOf(value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value: value,
            message: errorUtil.toString(message)
        });
    }
    step = this.multipleOf;
    get minValue() {
        let min = null;
        for (const ch of this._def.checks){
            if (ch.kind === "min") {
                if (min === null || ch.value > min) min = ch.value;
            }
        }
        return min;
    }
    get maxValue() {
        let max = null;
        for (const ch of this._def.checks){
            if (ch.kind === "max") {
                if (max === null || ch.value < max) max = ch.value;
            }
        }
        return max;
    }
    get isInt() {
        return !!this._def.checks.find((ch)=>ch.kind === "int"
        );
    }
}
class ZodBigInt1 extends ZodType1 {
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.bigint) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.bigint,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        return OK1(ctx.data);
    }
    static create = (params)=>{
        return new ZodBigInt1({
            typeName: ZodFirstPartyTypeKind1.ZodBigInt,
            ...processCreateParams(params)
        });
    };
}
class ZodBoolean1 extends ZodType1 {
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.boolean) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.boolean,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        return OK1(ctx.data);
    }
    static create = (params)=>{
        return new ZodBoolean1({
            typeName: ZodFirstPartyTypeKind1.ZodBoolean,
            ...processCreateParams(params)
        });
    };
}
class ZodDate1 extends ZodType1 {
    _parse(input) {
        const { status , ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.date) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.date,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        if (isNaN(ctx.data.getTime())) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_date
            });
            return INVALID1;
        }
        return {
            status: status.value,
            value: new Date(ctx.data.getTime())
        };
    }
    static create = (params)=>{
        return new ZodDate1({
            typeName: ZodFirstPartyTypeKind1.ZodDate,
            ...processCreateParams(params)
        });
    };
}
class ZodUndefined1 extends ZodType1 {
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.undefined) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.undefined,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        return OK1(ctx.data);
    }
    params;
    static create = (params)=>{
        return new ZodUndefined1({
            typeName: ZodFirstPartyTypeKind1.ZodUndefined,
            ...processCreateParams(params)
        });
    };
}
class ZodNull1 extends ZodType1 {
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.null) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.null,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        return OK1(ctx.data);
    }
    static create = (params)=>{
        return new ZodNull1({
            typeName: ZodFirstPartyTypeKind1.ZodNull,
            ...processCreateParams(params)
        });
    };
}
class ZodAny1 extends ZodType1 {
    _any = true;
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        return OK1(ctx.data);
    }
    static create = (params)=>{
        return new ZodAny1({
            typeName: ZodFirstPartyTypeKind1.ZodAny,
            ...processCreateParams(params)
        });
    };
}
class ZodUnknown1 extends ZodType1 {
    _unknown = true;
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        return OK1(ctx.data);
    }
    static create = (params)=>{
        return new ZodUnknown1({
            typeName: ZodFirstPartyTypeKind1.ZodUnknown,
            ...processCreateParams(params)
        });
    };
}
class ZodNever1 extends ZodType1 {
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        addIssueToContext1(ctx, {
            code: ZodIssueCode1.invalid_type,
            expected: ZodParsedType1.never,
            received: ctx.parsedType
        });
        return INVALID1;
    }
    static create = (params)=>{
        return new ZodNever1({
            typeName: ZodFirstPartyTypeKind1.ZodNever,
            ...processCreateParams(params)
        });
    };
}
class ZodVoid1 extends ZodType1 {
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.undefined) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.void,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        return OK1(ctx.data);
    }
    static create = (params)=>{
        return new ZodVoid1({
            typeName: ZodFirstPartyTypeKind1.ZodVoid,
            ...processCreateParams(params)
        });
    };
}
class ZodArray1 extends ZodType1 {
    _parse(input) {
        const { status , ctx  } = this._processInputParams(input);
        const def2 = this._def;
        if (ctx.parsedType !== ZodParsedType1.array) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.array,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        if (def2.minLength !== null) {
            if (ctx.data.length < def2.minLength.value) {
                addIssueToContext1(ctx, {
                    code: ZodIssueCode1.too_small,
                    minimum: def2.minLength.value,
                    type: "array",
                    inclusive: true,
                    message: def2.minLength.message
                });
                status.dirty();
            }
        }
        if (def2.maxLength !== null) {
            if (ctx.data.length > def2.maxLength.value) {
                addIssueToContext1(ctx, {
                    code: ZodIssueCode1.too_big,
                    maximum: def2.maxLength.value,
                    type: "array",
                    inclusive: true,
                    message: def2.maxLength.message
                });
                status.dirty();
            }
        }
        if (ctx.async) {
            return Promise.all(ctx.data.map((item, i)=>{
                return def2.type._parseAsync({
                    parent: ctx,
                    path: [
                        ...ctx.path,
                        i
                    ],
                    data: item
                });
            })).then((result)=>{
                return ParseStatus1.mergeArray(status, result);
            });
        }
        const result = ctx.data.map((item, i)=>{
            return def2.type._parseSync({
                parent: ctx,
                path: [
                    ...ctx.path,
                    i
                ],
                data: item
            });
        });
        return ParseStatus1.mergeArray(status, result);
    }
    get element() {
        return this._def.type;
    }
    min(minLength, message) {
        return new ZodArray1({
            ...this._def,
            minLength: {
                value: minLength,
                message: errorUtil.toString(message)
            }
        });
    }
    max(maxLength, message) {
        return new ZodArray1({
            ...this._def,
            maxLength: {
                value: maxLength,
                message: errorUtil.toString(message)
            }
        });
    }
    length(len, message) {
        return this.min(len, message).max(len, message);
    }
    nonempty(message) {
        return this.min(1, message);
    }
    static create = (schema, params)=>{
        return new ZodArray1({
            type: schema,
            minLength: null,
            maxLength: null,
            typeName: ZodFirstPartyTypeKind1.ZodArray,
            ...processCreateParams(params)
        });
    };
}
var objectUtil1;
(function(objectUtil1) {
    objectUtil1.mergeShapes = (first, second)=>{
        return {
            ...first,
            ...second
        };
    };
})(objectUtil1 || (objectUtil1 = {
}));
const AugmentFactory = (def2)=>(augmentation)=>{
        return new ZodObject1({
            ...def2,
            shape: ()=>({
                    ...def2.shape(),
                    ...augmentation
                })
        });
    }
;
function deepPartialify(schema) {
    if (schema instanceof ZodObject1) {
        const newShape = {
        };
        for(const key in schema.shape){
            const fieldSchema = schema.shape[key];
            newShape[key] = ZodOptional1.create(deepPartialify(fieldSchema));
        }
        return new ZodObject1({
            ...schema._def,
            shape: ()=>newShape
        });
    } else if (schema instanceof ZodArray1) {
        return ZodArray1.create(deepPartialify(schema.element));
    } else if (schema instanceof ZodOptional1) {
        return ZodOptional1.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodNullable1) {
        return ZodNullable1.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodTuple1) {
        return ZodTuple1.create(schema.items.map((item)=>deepPartialify(item)
        ));
    } else {
        return schema;
    }
}
class ZodObject1 extends ZodType1 {
    _shape;
    _unknownKeys;
    _catchall;
    _cached = null;
    _getCached() {
        if (this._cached !== null) return this._cached;
        const shape = this._def.shape();
        const keys = util.objectKeys(shape);
        return this._cached = {
            shape,
            keys
        };
    }
    _parse(input) {
        const { status , ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.object) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.object,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        const { shape , keys: shapeKeys  } = this._getCached();
        const dataKeys = util.objectKeys(ctx.data);
        const extraKeys = dataKeys.filter((k)=>!(k in shape)
        );
        const pairs = [];
        for (const key of shapeKeys){
            const keyValidator = shape[key];
            const value = ctx.data[key];
            pairs.push({
                key: {
                    status: "valid",
                    value: key
                },
                value: keyValidator._parse({
                    parent: ctx,
                    data: value,
                    path: [
                        ...ctx.path,
                        key
                    ]
                }),
                alwaysSet: key in ctx.data
            });
        }
        if (this._def.catchall instanceof ZodNever1) {
            const unknownKeys = this._def.unknownKeys;
            if (unknownKeys === "passthrough") {
                for (const key1 of extraKeys){
                    pairs.push({
                        key: {
                            status: "valid",
                            value: key1
                        },
                        value: {
                            status: "valid",
                            value: ctx.data[key1]
                        }
                    });
                }
            } else if (unknownKeys === "strict") {
                if (extraKeys.length > 0) {
                    addIssueToContext1(ctx, {
                        code: ZodIssueCode1.unrecognized_keys,
                        keys: extraKeys
                    });
                    status.dirty();
                }
            } else if (unknownKeys === "strip") {
            } else {
                throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
            }
        } else {
            const catchall = this._def.catchall;
            for (const key1 of extraKeys){
                const value = ctx.data[key1];
                pairs.push({
                    key: {
                        status: "valid",
                        value: key1
                    },
                    value: catchall._parse({
                        parent: ctx,
                        path: [
                            ...ctx.path,
                            key1
                        ],
                        data: value
                    }),
                    alwaysSet: key1 in ctx.data
                });
            }
        }
        if (ctx.async) {
            return Promise.resolve().then(async ()=>{
                const syncPairs = [];
                for (const pair of pairs){
                    const key1 = await pair.key;
                    syncPairs.push({
                        key: key1,
                        value: await pair.value,
                        alwaysSet: pair.alwaysSet
                    });
                }
                return syncPairs;
            }).then((syncPairs)=>{
                return ParseStatus1.mergeObjectSync(status, syncPairs);
            });
        } else {
            return ParseStatus1.mergeObjectSync(status, pairs);
        }
    }
    get shape() {
        return this._def.shape();
    }
    strict(message) {
        errorUtil.errToObj;
        return new ZodObject1({
            ...this._def,
            unknownKeys: "strict",
            ...message !== undefined ? {
                errorMap: (issue, ctx)=>{
                    const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
                    if (issue.code === "unrecognized_keys") return {
                        message: errorUtil.errToObj(message).message ?? defaultError
                    };
                    return {
                        message: defaultError
                    };
                }
            } : {
            }
        });
    }
    strip() {
        return new ZodObject1({
            ...this._def,
            unknownKeys: "strip"
        });
    }
    passthrough() {
        return new ZodObject1({
            ...this._def,
            unknownKeys: "passthrough"
        });
    }
    nonstrict = this.passthrough;
    augment = AugmentFactory(this._def);
    extend = AugmentFactory(this._def);
    setKey(key, schema) {
        return this.augment({
            [key]: schema
        });
    }
    merge(merging) {
        const mergedShape = objectUtil1.mergeShapes(this._def.shape(), merging._def.shape());
        const merged = new ZodObject1({
            unknownKeys: merging._def.unknownKeys,
            catchall: merging._def.catchall,
            shape: ()=>mergedShape
            ,
            typeName: ZodFirstPartyTypeKind1.ZodObject
        });
        return merged;
    }
    catchall(index) {
        return new ZodObject1({
            ...this._def,
            catchall: index
        });
    }
    pick(mask) {
        const shape = {
        };
        util.objectKeys(mask).map((key)=>{
            shape[key] = this.shape[key];
        });
        return new ZodObject1({
            ...this._def,
            shape: ()=>shape
        });
    }
    omit(mask) {
        const shape = {
        };
        util.objectKeys(this.shape).map((key)=>{
            if (util.objectKeys(mask).indexOf(key) === -1) {
                shape[key] = this.shape[key];
            }
        });
        return new ZodObject1({
            ...this._def,
            shape: ()=>shape
        });
    }
    deepPartial() {
        return deepPartialify(this);
    }
    partial(mask) {
        const newShape = {
        };
        if (mask) {
            util.objectKeys(this.shape).map((key)=>{
                if (util.objectKeys(mask).indexOf(key) === -1) {
                    newShape[key] = this.shape[key];
                } else {
                    newShape[key] = this.shape[key].optional();
                }
            });
            return new ZodObject1({
                ...this._def,
                shape: ()=>newShape
            });
        } else {
            for(const key in this.shape){
                const fieldSchema = this.shape[key];
                newShape[key] = fieldSchema.optional();
            }
        }
        return new ZodObject1({
            ...this._def,
            shape: ()=>newShape
        });
    }
    required() {
        const newShape = {
        };
        for(const key in this.shape){
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while(newField instanceof ZodOptional1){
                newField = newField._def.innerType;
            }
            newShape[key] = newField;
        }
        return new ZodObject1({
            ...this._def,
            shape: ()=>newShape
        });
    }
    static create = (shape, params)=>{
        return new ZodObject1({
            shape: ()=>shape
            ,
            unknownKeys: "strip",
            catchall: ZodNever1.create(),
            typeName: ZodFirstPartyTypeKind1.ZodObject,
            ...processCreateParams(params)
        });
    };
    static strictCreate = (shape, params)=>{
        return new ZodObject1({
            shape: ()=>shape
            ,
            unknownKeys: "strict",
            catchall: ZodNever1.create(),
            typeName: ZodFirstPartyTypeKind1.ZodObject,
            ...processCreateParams(params)
        });
    };
    static lazycreate = (shape, params)=>{
        return new ZodObject1({
            shape,
            unknownKeys: "strip",
            catchall: ZodNever1.create(),
            typeName: ZodFirstPartyTypeKind1.ZodObject,
            ...processCreateParams(params)
        });
    };
}
export { ZodObject1 as ZodObject };
class ZodUnion1 extends ZodType1 {
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
            for (const result of results){
                if (result.result.status === "valid") {
                    return result.result;
                }
            }
            for (const result1 of results){
                if (result1.result.status === "dirty") {
                    ctx.issues.push(...result1.ctx.issues);
                    return result1.result;
                }
            }
            const unionErrors = results.map((result2)=>new ZodError1(result2.ctx.issues)
            );
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_union,
                unionErrors
            });
            return INVALID1;
        }
        if (ctx.async) {
            return Promise.all(options.map(async (option)=>{
                const childCtx = {
                    ...ctx,
                    issues: [],
                    parent: null
                };
                return {
                    result: await option._parseAsync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: childCtx
                    }),
                    ctx: childCtx
                };
            })).then(handleResults);
        } else {
            const optionResults = options.map((option)=>{
                const childCtx = {
                    ...ctx,
                    issues: [],
                    parent: null
                };
                return {
                    result: option._parseSync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: childCtx
                    }),
                    ctx: childCtx
                };
            });
            return handleResults(optionResults);
        }
    }
    get options() {
        return this._def.options;
    }
    static create = (types, params)=>{
        return new ZodUnion1({
            options: types,
            typeName: ZodFirstPartyTypeKind1.ZodUnion,
            ...processCreateParams(params)
        });
    };
}
function mergeValues(a, b) {
    const aType = getParsedType1(a);
    const bType = getParsedType1(b);
    if (a === b) {
        return {
            valid: true,
            data: a
        };
    } else if (aType === ZodParsedType1.object && bType === ZodParsedType1.object) {
        const bKeys = util.objectKeys(b);
        const sharedKeys = util.objectKeys(a).filter((key)=>bKeys.indexOf(key) !== -1
        );
        const newObj = {
            ...a,
            ...b
        };
        for (const key of sharedKeys){
            const sharedValue = mergeValues(a[key], b[key]);
            if (!sharedValue.valid) {
                return {
                    valid: false
                };
            }
            newObj[key] = sharedValue.data;
        }
        return {
            valid: true,
            data: newObj
        };
    } else if (aType === ZodParsedType1.array && bType === ZodParsedType1.array) {
        if (a.length !== b.length) {
            return {
                valid: false
            };
        }
        const newArray = [];
        for(let index = 0; index < a.length; index++){
            const itemA = a[index];
            const itemB = b[index];
            const sharedValue = mergeValues(itemA, itemB);
            if (!sharedValue.valid) {
                return {
                    valid: false
                };
            }
            newArray.push(sharedValue.data);
        }
        return {
            valid: true,
            data: newArray
        };
    } else {
        return {
            valid: false
        };
    }
}
class ZodIntersection1 extends ZodType1 {
    _parse(input) {
        const { status , ctx  } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight)=>{
            if (isAborted1(parsedLeft) || isAborted1(parsedRight)) {
                return INVALID1;
            }
            const merged = mergeValues(parsedLeft.value, parsedRight.value);
            if (!merged.valid) {
                addIssueToContext1(ctx, {
                    code: ZodIssueCode1.invalid_intersection_types
                });
                return INVALID1;
            }
            if (isDirty1(parsedLeft) || isDirty1(parsedRight)) {
                status.dirty();
            }
            return {
                status: status.value,
                value: merged.data
            };
        };
        if (ctx.async) {
            return Promise.all([
                this._def.left._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx
                }),
                this._def.right._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx
                }), 
            ]).then(([left, right])=>handleParsed(left, right)
            );
        } else {
            return handleParsed(this._def.left._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx
            }), this._def.right._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx
            }));
        }
    }
    static create = (left, right, params)=>{
        return new ZodIntersection1({
            left: left,
            right: right,
            typeName: ZodFirstPartyTypeKind1.ZodIntersection,
            ...processCreateParams(params)
        });
    };
}
export { ZodIntersection1 as ZodIntersection };
class ZodTuple1 extends ZodType1 {
    _parse(input) {
        const { status , ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.array) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.array,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        if (ctx.data.length < this._def.items.length) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.too_small,
                minimum: this._def.items.length,
                inclusive: true,
                type: "array"
            });
            return INVALID1;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.too_big,
                maximum: this._def.items.length,
                inclusive: true,
                type: "array"
            });
            status.dirty();
        }
        const items = ctx.data.map((item, itemIndex)=>{
            const schema = this._def.items[itemIndex] || this._def.rest;
            if (!schema) return null;
            return schema._parse({
                data: item,
                path: [
                    ...ctx.path,
                    itemIndex
                ],
                parent: ctx
            });
        }).filter((x)=>!!x
        );
        if (ctx.async) {
            return Promise.all(items).then((results)=>{
                return ParseStatus1.mergeArray(status, results);
            });
        } else {
            return ParseStatus1.mergeArray(status, items);
        }
    }
    get items() {
        return this._def.items;
    }
    rest(rest) {
        return new ZodTuple1({
            ...this._def,
            rest
        });
    }
    static create = (schemas, params)=>{
        return new ZodTuple1({
            items: schemas,
            typeName: ZodFirstPartyTypeKind1.ZodTuple,
            rest: null,
            ...processCreateParams(params)
        });
    };
}
class ZodRecord1 extends ZodType1 {
    get keySchema() {
        return this._def.keyType;
    }
    get valueSchema() {
        return this._def.valueType;
    }
    _parse(input) {
        const { status , ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.object) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.object,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for(const key in ctx.data){
            pairs.push({
                key: keyType._parse({
                    data: key,
                    path: [
                        ...ctx.path,
                        key
                    ],
                    parent: ctx
                }),
                value: valueType._parse({
                    data: ctx.data[key],
                    path: [
                        ...ctx.path,
                        key
                    ],
                    parent: ctx
                })
            });
        }
        if (ctx.async) {
            return ParseStatus1.mergeObjectAsync(status, pairs);
        } else {
            return ParseStatus1.mergeObjectSync(status, pairs);
        }
    }
    get element() {
        return this._def.valueType;
    }
    static create(first, second, third) {
        if (second instanceof ZodType1) {
            return new ZodRecord1({
                keyType: first,
                valueType: second,
                typeName: ZodFirstPartyTypeKind1.ZodRecord,
                ...processCreateParams(third)
            });
        }
        return new ZodRecord1({
            keyType: ZodString1.create(),
            valueType: first,
            typeName: ZodFirstPartyTypeKind1.ZodRecord,
            ...processCreateParams(second)
        });
    }
}
class ZodMap1 extends ZodType1 {
    _parse(input) {
        const { status , ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.map) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.map,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [
            ...ctx.data.entries()
        ].map(([key, value], index)=>{
            return {
                key: keyType._parse({
                    data: key,
                    path: [
                        ...ctx.path,
                        index,
                        "key"
                    ],
                    parent: ctx
                }),
                value: valueType._parse({
                    data: value,
                    path: [
                        ...ctx.path,
                        index,
                        "value"
                    ],
                    parent: ctx
                })
            };
        });
        if (ctx.async) {
            const finalMap = new Map();
            return Promise.resolve().then(async ()=>{
                for (const pair of pairs){
                    const key = await pair.key;
                    const value = await pair.value;
                    if (key.status === "aborted" || value.status === "aborted") {
                        return INVALID1;
                    }
                    if (key.status === "dirty" || value.status === "dirty") {
                        status.dirty();
                    }
                    finalMap.set(key.value, value.value);
                }
                return {
                    status: status.value,
                    value: finalMap
                };
            });
        } else {
            const finalMap = new Map();
            for (const pair of pairs){
                const key = pair.key;
                const value = pair.value;
                if (key.status === "aborted" || value.status === "aborted") {
                    return INVALID1;
                }
                if (key.status === "dirty" || value.status === "dirty") {
                    status.dirty();
                }
                finalMap.set(key.value, value.value);
            }
            return {
                status: status.value,
                value: finalMap
            };
        }
    }
    static create = (keyType, valueType, params)=>{
        return new ZodMap1({
            valueType,
            keyType,
            typeName: ZodFirstPartyTypeKind1.ZodMap,
            ...processCreateParams(params)
        });
    };
}
class ZodSet1 extends ZodType1 {
    _parse(input) {
        const { status , ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.set) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.set,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements) {
            const parsedSet = new Set();
            for (const element of elements){
                if (element.status === "aborted") return INVALID1;
                if (element.status === "dirty") status.dirty();
                parsedSet.add(element.value);
            }
            return {
                status: status.value,
                value: parsedSet
            };
        }
        const elements = [
            ...ctx.data.values()
        ].map((item, i)=>valueType._parse({
                data: item,
                path: [
                    ...ctx.path,
                    i
                ],
                parent: ctx
            })
        );
        if (ctx.async) {
            return Promise.all(elements).then((elements1)=>finalizeSet(elements1)
            );
        } else {
            return finalizeSet(elements);
        }
    }
    static create = (valueType, params)=>{
        return new ZodSet1({
            valueType,
            typeName: ZodFirstPartyTypeKind1.ZodSet,
            ...processCreateParams(params)
        });
    };
}
class ZodFunction1 extends ZodType1 {
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.function) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.function,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        function makeArgsIssue(args, error) {
            return makeIssue1({
                data: args,
                path: ctx.path,
                errorMaps: [
                    ctx.contextualErrorMap,
                    ctx.schemaErrorMap,
                    overrideErrorMap1,
                    defaultErrorMap1, 
                ].filter((x)=>!!x
                ),
                issueData: {
                    code: ZodIssueCode1.invalid_arguments,
                    argumentsError: error
                }
            });
        }
        function makeReturnsIssue(returns, error) {
            return makeIssue1({
                data: returns,
                path: ctx.path,
                errorMaps: [
                    ctx.contextualErrorMap,
                    ctx.schemaErrorMap,
                    overrideErrorMap1,
                    defaultErrorMap1, 
                ].filter((x)=>!!x
                ),
                issueData: {
                    code: ZodIssueCode1.invalid_return_type,
                    returnTypeError: error
                }
            });
        }
        const params = {
            errorMap: ctx.contextualErrorMap
        };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise1) {
            return OK1(async (...args)=>{
                const error = new ZodError1([]);
                const parsedArgs = await this._def.args.parseAsync(args, params).catch((e)=>{
                    error.addIssue(makeArgsIssue(args, e));
                    throw error;
                });
                const result = await fn(...parsedArgs);
                const parsedReturns = await this._def.returns._def.type.parseAsync(result, params).catch((e)=>{
                    error.addIssue(makeReturnsIssue(result, e));
                    throw error;
                });
                return parsedReturns;
            });
        } else {
            return OK1((...args)=>{
                const parsedArgs = this._def.args.safeParse(args, params);
                if (!parsedArgs.success) {
                    throw new ZodError1([
                        makeArgsIssue(args, parsedArgs.error)
                    ]);
                }
                const result = fn(...parsedArgs.data);
                const parsedReturns = this._def.returns.safeParse(result, params);
                if (!parsedReturns.success) {
                    throw new ZodError1([
                        makeReturnsIssue(result, parsedReturns.error)
                    ]);
                }
                return parsedReturns.data;
            });
        }
    }
    parameters() {
        return this._def.args;
    }
    returnType() {
        return this._def.returns;
    }
    args(...items) {
        return new ZodFunction1({
            ...this._def,
            args: ZodTuple1.create(items).rest(ZodUnknown1.create())
        });
    }
    returns(returnType) {
        return new ZodFunction1({
            ...this._def,
            returns: returnType
        });
    }
    implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    validate = this.implement;
    static create = (args, returns, params)=>{
        return new ZodFunction1({
            args: args ? args.rest(ZodUnknown1.create()) : ZodTuple1.create([]).rest(ZodUnknown1.create()),
            returns: returns || ZodUnknown1.create(),
            typeName: ZodFirstPartyTypeKind1.ZodFunction,
            ...processCreateParams(params)
        });
    };
}
class ZodLazy1 extends ZodType1 {
    get schema() {
        return this._def.getter();
    }
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
        });
    }
    static create = (getter, params)=>{
        return new ZodLazy1({
            getter: getter,
            typeName: ZodFirstPartyTypeKind1.ZodLazy,
            ...processCreateParams(params)
        });
    };
}
class ZodLiteral1 extends ZodType1 {
    _parse(input) {
        const { status , ctx  } = this._processInputParams(input);
        if (ctx.data !== this._def.value) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: this._def.value,
                received: ctx.data
            });
            return INVALID1;
        }
        return {
            status: status.value,
            value: ctx.data
        };
    }
    get value() {
        return this._def.value;
    }
    static create = (value, params)=>{
        return new ZodLiteral1({
            value: value,
            typeName: ZodFirstPartyTypeKind1.ZodLiteral,
            ...processCreateParams(params)
        });
    };
}
function createZodEnum(values) {
    return new ZodEnum1({
        values: values,
        typeName: ZodFirstPartyTypeKind1.ZodEnum
    });
}
class ZodEnum1 extends ZodType1 {
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        if (this._def.values.indexOf(ctx.data) === -1) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_enum_value,
                options: this._def.values
            });
            return INVALID1;
        }
        return OK1(ctx.data);
    }
    get options() {
        return this._def.values;
    }
    get enum() {
        const enumValues = {
        };
        for (const val of this._def.values){
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Values() {
        const enumValues = {
        };
        for (const val of this._def.values){
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Enum() {
        const enumValues = {
        };
        for (const val of this._def.values){
            enumValues[val] = val;
        }
        return enumValues;
    }
    static create = createZodEnum;
}
export { ZodEnum1 as ZodEnum };
class ZodNativeEnum1 extends ZodType1 {
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        const nativeEnumValues = util.getValidEnumValues(this._def.values);
        if (nativeEnumValues.indexOf(ctx.data) === -1) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_enum_value,
                options: util.objectValues(nativeEnumValues)
            });
            return INVALID1;
        }
        return OK1(ctx.data);
    }
    static create = (values, params)=>{
        return new ZodNativeEnum1({
            values: values,
            typeName: ZodFirstPartyTypeKind1.ZodNativeEnum,
            ...processCreateParams(params)
        });
    };
}
class ZodPromise1 extends ZodType1 {
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType1.promise && ctx.async === false) {
            addIssueToContext1(ctx, {
                code: ZodIssueCode1.invalid_type,
                expected: ZodParsedType1.promise,
                received: ctx.parsedType
            });
            return INVALID1;
        }
        const promisified = ctx.parsedType === ZodParsedType1.promise ? ctx.data : Promise.resolve(ctx.data);
        return OK1(promisified.then((data)=>{
            return this._def.type.parseAsync(data, {
                path: ctx.path,
                errorMap: ctx.contextualErrorMap
            });
        }));
    }
    static create = (schema, params)=>{
        return new ZodPromise1({
            type: schema,
            typeName: ZodFirstPartyTypeKind1.ZodPromise,
            ...processCreateParams(params)
        });
    };
}
class ZodEffects1 extends ZodType1 {
    innerType() {
        return this._def.schema;
    }
    _parse(input) {
        const { status , ctx  } = this._processInputParams(input);
        const effect = this._def.effect || null;
        if (effect.type === "preprocess") {
            const processed = effect.transform(ctx.data);
            if (ctx.async) {
                return Promise.resolve(processed).then((processed1)=>{
                    return this._def.schema._parseAsync({
                        data: processed1,
                        path: ctx.path,
                        parent: ctx
                    });
                });
            } else {
                return this._def.schema._parseSync({
                    data: processed,
                    path: ctx.path,
                    parent: ctx
                });
            }
        }
        if (effect.type === "refinement") {
            const checkCtx = {
                addIssue: (arg)=>{
                    addIssueToContext1(ctx, arg);
                    if (FATAL_CODES1.includes(arg.code)) {
                        status.abort();
                    } else {
                        status.dirty();
                    }
                },
                get path () {
                    return ctx.path;
                }
            };
            checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
            const executeRefinement = (acc, effect1)=>{
                const result = effect1.refinement(acc, checkCtx);
                if (ctx.async) {
                    return Promise.resolve(result).then(()=>acc
                    );
                }
                if (result instanceof Promise) {
                    throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
                }
                return acc;
            };
            if (ctx.async === false) {
                const base = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx
                });
                if (base.status === "aborted") return INVALID1;
                executeRefinement(base.value, effect);
                return {
                    status: status.value,
                    value: ctx.data
                };
            } else {
                return this._def.schema._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx
                }).then((result)=>{
                    if (result.status === "aborted") return INVALID1;
                    return executeRefinement(result.value, effect).then(()=>{
                        return {
                            status: status.value,
                            value: ctx.data
                        };
                    });
                });
            }
        }
        if (effect.type === "transform") {
            if (ctx.async === false) {
                const base = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx
                });
                if (!isValid1(base)) return base;
                const result = effect.transform(base.value);
                if (result instanceof Promise) {
                    throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
                }
                return OK1(result);
            } else {
                return this._def.schema._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx
                }).then((base)=>{
                    if (!isValid1(base)) return base;
                    return Promise.resolve(effect.transform(base.value)).then(OK1);
                });
            }
        }
        util.assertNever(effect);
    }
    static create = (schema, effect, params)=>{
        return new ZodEffects1({
            schema,
            typeName: ZodFirstPartyTypeKind1.ZodEffects,
            effect,
            ...processCreateParams(params)
        });
    };
    static createWithPreprocess = (preprocess, schema, params)=>{
        return new ZodEffects1({
            schema,
            effect: {
                type: "preprocess",
                transform: preprocess
            },
            typeName: ZodFirstPartyTypeKind1.ZodEffects,
            ...processCreateParams(params)
        });
    };
}
export { ZodEffects1 as ZodTransformer };
class ZodOptional1 extends ZodType1 {
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        if (ctx.parsedType === ZodParsedType1.undefined) {
            return OK1(undefined);
        }
        return this._def.innerType._parse({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
        });
    }
    unwrap() {
        return this._def.innerType;
    }
    static create = (type, params)=>{
        return new ZodOptional1({
            innerType: type,
            typeName: ZodFirstPartyTypeKind1.ZodOptional,
            ...processCreateParams(params)
        });
    };
}
export { ZodOptional1 as ZodOptional };
class ZodNullable1 extends ZodType1 {
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        if (ctx.parsedType === ZodParsedType1.null) {
            return OK1(null);
        }
        return this._def.innerType._parse({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
        });
    }
    unwrap() {
        return this._def.innerType;
    }
    static create = (type, params)=>{
        return new ZodNullable1({
            innerType: type,
            typeName: ZodFirstPartyTypeKind1.ZodNullable,
            ...processCreateParams(params)
        });
    };
}
class ZodDefault1 extends ZodType1 {
    _parse(input) {
        const { ctx  } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === ZodParsedType1.undefined) {
            data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
            data,
            path: ctx.path,
            parent: ctx
        });
    }
    removeDefault() {
        return this._def.innerType;
    }
    static create = (type, params)=>{
        return new ZodOptional1({
            innerType: type,
            typeName: ZodFirstPartyTypeKind1.ZodOptional,
            ...processCreateParams(params)
        });
    };
}
const custom1 = (check, params)=>{
    if (check) return ZodAny1.create().refine(check, params);
    return ZodAny1.create();
};
export { ZodType1 as Schema, ZodType1 as ZodSchema };
const late1 = {
    object: ZodObject1.lazycreate
};
export { late1 as late };
var ZodFirstPartyTypeKind1;
(function(ZodFirstPartyTypeKind1) {
    ZodFirstPartyTypeKind1["ZodString"] = "ZodString";
    ZodFirstPartyTypeKind1["ZodNumber"] = "ZodNumber";
    ZodFirstPartyTypeKind1["ZodBigInt"] = "ZodBigInt";
    ZodFirstPartyTypeKind1["ZodBoolean"] = "ZodBoolean";
    ZodFirstPartyTypeKind1["ZodDate"] = "ZodDate";
    ZodFirstPartyTypeKind1["ZodUndefined"] = "ZodUndefined";
    ZodFirstPartyTypeKind1["ZodNull"] = "ZodNull";
    ZodFirstPartyTypeKind1["ZodAny"] = "ZodAny";
    ZodFirstPartyTypeKind1["ZodUnknown"] = "ZodUnknown";
    ZodFirstPartyTypeKind1["ZodNever"] = "ZodNever";
    ZodFirstPartyTypeKind1["ZodVoid"] = "ZodVoid";
    ZodFirstPartyTypeKind1["ZodArray"] = "ZodArray";
    ZodFirstPartyTypeKind1["ZodObject"] = "ZodObject";
    ZodFirstPartyTypeKind1["ZodUnion"] = "ZodUnion";
    ZodFirstPartyTypeKind1["ZodIntersection"] = "ZodIntersection";
    ZodFirstPartyTypeKind1["ZodTuple"] = "ZodTuple";
    ZodFirstPartyTypeKind1["ZodRecord"] = "ZodRecord";
    ZodFirstPartyTypeKind1["ZodMap"] = "ZodMap";
    ZodFirstPartyTypeKind1["ZodSet"] = "ZodSet";
    ZodFirstPartyTypeKind1["ZodFunction"] = "ZodFunction";
    ZodFirstPartyTypeKind1["ZodLazy"] = "ZodLazy";
    ZodFirstPartyTypeKind1["ZodLiteral"] = "ZodLiteral";
    ZodFirstPartyTypeKind1["ZodEnum"] = "ZodEnum";
    ZodFirstPartyTypeKind1["ZodEffects"] = "ZodEffects";
    ZodFirstPartyTypeKind1["ZodNativeEnum"] = "ZodNativeEnum";
    ZodFirstPartyTypeKind1["ZodOptional"] = "ZodOptional";
    ZodFirstPartyTypeKind1["ZodNullable"] = "ZodNullable";
    ZodFirstPartyTypeKind1["ZodDefault"] = "ZodDefault";
    ZodFirstPartyTypeKind1["ZodPromise"] = "ZodPromise";
})(ZodFirstPartyTypeKind1 || (ZodFirstPartyTypeKind1 = {
}));
const instanceOfType = (cls, params = {
    message: `Input not instance of ${cls.name}`
})=>custom1((data)=>data instanceof cls
    , params)
;
const stringType = ZodString1.create;
const numberType = ZodNumber1.create;
const bigIntType = ZodBigInt1.create;
const booleanType = ZodBoolean1.create;
const dateType = ZodDate1.create;
const undefinedType = ZodUndefined1.create;
const nullType = ZodNull1.create;
const anyType = ZodAny1.create;
const unknownType = ZodUnknown1.create;
const neverType = ZodNever1.create;
const voidType = ZodVoid1.create;
const arrayType = ZodArray1.create;
const objectType = ZodObject1.create;
const strictObjectType = ZodObject1.strictCreate;
const unionType = ZodUnion1.create;
const intersectionType = ZodIntersection1.create;
const tupleType = ZodTuple1.create;
const recordType = ZodRecord1.create;
const mapType = ZodMap1.create;
const setType = ZodSet1.create;
const functionType = ZodFunction1.create;
const lazyType = ZodLazy1.create;
const literalType = ZodLiteral1.create;
const enumType = ZodEnum1.create;
const nativeEnumType = ZodNativeEnum1.create;
const promiseType = ZodPromise1.create;
const effectsType = ZodEffects1.create;
const optionalType = ZodOptional1.create;
const nullableType = ZodNullable1.create;
const preprocessType = ZodEffects1.createWithPreprocess;
const ostring1 = ()=>stringType().optional()
;
const onumber1 = ()=>numberType().optional()
;
const oboolean1 = ()=>booleanType().optional()
;
const mod = function() {
    return {
        ZodParsedType: ZodParsedType1,
        getParsedType: getParsedType1,
        makeIssue: makeIssue1,
        EMPTY_PATH: EMPTY_PATH1,
        addIssueToContext: addIssueToContext1,
        ParseStatus: ParseStatus1,
        INVALID: INVALID1,
        DIRTY: DIRTY1,
        OK: OK1,
        isAborted: isAborted1,
        isDirty: isDirty1,
        isValid: isValid1,
        isAsync: isAsync1,
        ZodIssueCode: ZodIssueCode1,
        FATAL_CODES: FATAL_CODES1,
        quotelessJson: quotelessJson1,
        ZodError: ZodError1,
        defaultErrorMap: defaultErrorMap1,
        overrideErrorMap: overrideErrorMap1,
        setErrorMap: setErrorMap1,
        ZodType: ZodType1,
        ZodString: ZodString1,
        ZodNumber: ZodNumber1,
        ZodBigInt: ZodBigInt1,
        ZodBoolean: ZodBoolean1,
        ZodDate: ZodDate1,
        ZodUndefined: ZodUndefined1,
        ZodNull: ZodNull1,
        ZodAny: ZodAny1,
        ZodUnknown: ZodUnknown1,
        ZodNever: ZodNever1,
        ZodVoid: ZodVoid1,
        ZodArray: ZodArray1,
        objectUtil: objectUtil1,
        ZodObject: ZodObject1,
        ZodUnion: ZodUnion1,
        ZodIntersection: ZodIntersection1,
        ZodTuple: ZodTuple1,
        ZodRecord: ZodRecord1,
        ZodMap: ZodMap1,
        ZodSet: ZodSet1,
        ZodFunction: ZodFunction1,
        ZodLazy: ZodLazy1,
        ZodLiteral: ZodLiteral1,
        ZodEnum: ZodEnum1,
        ZodNativeEnum: ZodNativeEnum1,
        ZodPromise: ZodPromise1,
        ZodEffects: ZodEffects1,
        ZodTransformer: ZodEffects1,
        ZodOptional: ZodOptional1,
        ZodNullable: ZodNullable1,
        ZodDefault: ZodDefault1,
        custom: custom1,
        Schema: ZodType1,
        ZodSchema: ZodType1,
        late: late1,
        ZodFirstPartyTypeKind: ZodFirstPartyTypeKind1,
        any: anyType,
        array: arrayType,
        bigint: bigIntType,
        boolean: booleanType,
        date: dateType,
        effect: effectsType,
        enum: enumType,
        function: functionType,
        instanceof: instanceOfType,
        intersection: intersectionType,
        lazy: lazyType,
        literal: literalType,
        map: mapType,
        nativeEnum: nativeEnumType,
        never: neverType,
        null: nullType,
        nullable: nullableType,
        number: numberType,
        object: objectType,
        oboolean: oboolean1,
        onumber: onumber1,
        optional: optionalType,
        ostring: ostring1,
        preprocess: preprocessType,
        promise: promiseType,
        record: recordType,
        set: setType,
        strictObject: strictObjectType,
        string: stringType,
        transformer: effectsType,
        tuple: tupleType,
        undefined: undefinedType,
        union: unionType,
        unknown: unknownType,
        void: voidType
    };
}();
export { mod as z };
export { anyType as any, arrayType as array, bigIntType as bigint, booleanType as boolean, dateType as date, effectsType as effect, enumType as enum, functionType as function, instanceOfType as instanceof, intersectionType as intersection, lazyType as lazy, literalType as literal, mapType as map, nativeEnumType as nativeEnum, neverType as never, nullType as null, nullableType as nullable, numberType as number, objectType as object, oboolean1 as oboolean, onumber1 as onumber, optionalType as optional, ostring1 as ostring, preprocessType as preprocess, promiseType as promise, recordType as record, setType as set, strictObjectType as strictObject, stringType as string, effectsType as transformer, tupleType as tuple, undefinedType as undefined, unionType as union, unknownType as unknown, voidType as void };
export { ZodNumber1 as ZodNumber };
export { ZodBigInt1 as ZodBigInt };
export { ZodBoolean1 as ZodBoolean };
export { ZodDate1 as ZodDate };
export { ZodUndefined1 as ZodUndefined };
export { ZodNull1 as ZodNull };
export { ZodAny1 as ZodAny };
export { ZodUnknown1 as ZodUnknown };
export { ZodNever1 as ZodNever };
export { ZodVoid1 as ZodVoid };
export { ZodArray1 as ZodArray };
export { objectUtil1 as objectUtil };
export { ZodUnion1 as ZodUnion };
export { ZodTuple1 as ZodTuple };
export { ZodRecord1 as ZodRecord };
export { ZodMap1 as ZodMap };
export { ZodSet1 as ZodSet };
export { ZodFunction1 as ZodFunction };
export { ZodLazy1 as ZodLazy };
export { ZodLiteral1 as ZodLiteral };
export { ZodNativeEnum1 as ZodNativeEnum };
export { ZodPromise1 as ZodPromise };
export { ZodEffects1 as ZodEffects };
export { ZodNullable1 as ZodNullable };
export { ZodDefault1 as ZodDefault };
export { custom1 as custom };
export { ZodFirstPartyTypeKind1 as ZodFirstPartyTypeKind,  };
