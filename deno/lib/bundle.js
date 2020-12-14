const undefinedType1 = ZodUndefined.create;
const unknownType1 = ZodUnknown.create;
const voidType1 = ZodVoid.create;
const unionType1 = ZodUnion.create;
const ZodIssueCode = util.arrayToEnum([
    "invalid_type",
    "nonempty_array_is_empty",
    "custom",
    "invalid_union",
    "invalid_literal_value",
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
const quotelessJson = (obj)=>{
    const json = JSON.stringify(obj, null, 2);
    return json.replace(/"([^"]+)":/g, "$1:");
};
class ZodError extends Error {
    issues = [];
    get errors() {
        return this.issues;
    }
    constructor(issues){
        super();
        const actualProto = new.target.prototype;
        Object.setPrototypeOf(this, actualProto);
        this.issues = issues;
    }
    static create = (issues1)=>{
        const error = new ZodError(issues1);
        return error;
    };
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
    flatten = ()=>{
        const fieldErrors = {
        };
        const formErrors = [];
        for (const sub of this.issues){
            if (sub.path.length > 0) {
                fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
                fieldErrors[sub.path[0]].push(sub.message);
            } else {
                formErrors.push(sub.message);
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
const undefined = undefinedType1;
const union = unionType1;
const unknown = unknownType1;
const voidReturn = voidType1;
const Schema = ZodType;
const ZodSchema = ZodType;
const ZodIssueCode1 = ZodIssueCode;
const quotelessJson1 = quotelessJson;
const ZodError1 = ZodError;
const isOptional1 = (schema)=>{
    return schema.isOptional();
};
const INVALID = Symbol("invalid_data");
const NOSET = Symbol("no_set");
const getParsedType = (data)=>{
    if (typeof data === "string") return "string";
    if (typeof data === "number") {
        if (Number.isNaN(data)) return "nan";
        return "number";
    }
    if (typeof data === "boolean") return "boolean";
    if (typeof data === "bigint") return "bigint";
    if (typeof data === "symbol") return "symbol";
    if (data instanceof Date) return "date";
    if (typeof data === "function") return "function";
    if (data === undefined) return "undefined";
    if (typeof data === "undefined") return "undefined";
    if (typeof data === "object") {
        if (Array.isArray(data)) return "array";
        if (data === null) return "null";
        if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return "promise";
        }
        if (data instanceof Map) {
            return "map";
        }
        return "object";
    }
    return "unknown";
};
const ZodParsedType = util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
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
]);
var ZodTypes;
(function(ZodTypes1) {
    ZodTypes1["string"] = "string";
    ZodTypes1["number"] = "number";
    ZodTypes1["bigint"] = "bigint";
    ZodTypes1["boolean"] = "boolean";
    ZodTypes1["date"] = "date";
    ZodTypes1["undefined"] = "undefined";
    ZodTypes1["null"] = "null";
    ZodTypes1["array"] = "array";
    ZodTypes1["object"] = "object";
    ZodTypes1["union"] = "union";
    ZodTypes1["intersection"] = "intersection";
    ZodTypes1["tuple"] = "tuple";
    ZodTypes1["record"] = "record";
    ZodTypes1["map"] = "map";
    ZodTypes1["function"] = "function";
    ZodTypes1["lazy"] = "lazy";
    ZodTypes1["literal"] = "literal";
    ZodTypes1["enum"] = "enum";
    ZodTypes1["nativeEnum"] = "nativeEnum";
    ZodTypes1["promise"] = "promise";
    ZodTypes1["any"] = "any";
    ZodTypes1["unknown"] = "unknown";
    ZodTypes1["never"] = "never";
    ZodTypes1["void"] = "void";
    ZodTypes1["transformer"] = "transformer";
    ZodTypes1["optional"] = "optional";
    ZodTypes1["nullable"] = "nullable";
})(ZodTypes || (ZodTypes = {
}));
const objectDefToJson = (def)=>({
        t: def.t,
        shape: Object.assign({
        }, ...Object.keys(def.shape()).map((k)=>({
                [k]: def.shape()[k].toJSON()
            })
        ))
    })
;
const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
const uuidRegex = /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}/i;
const isScalar = (schema, params = {
    root: true
})=>{
    const def = schema._def;
    let returnValue = false;
    switch(def.t){
        case ZodTypes.string:
            returnValue = true;
            break;
        case ZodTypes.number:
            returnValue = true;
            break;
        case ZodTypes.bigint:
            returnValue = true;
            break;
        case ZodTypes.boolean:
            returnValue = true;
            break;
        case ZodTypes.undefined:
            returnValue = true;
            break;
        case ZodTypes.null:
            returnValue = true;
            break;
        case ZodTypes.any:
            returnValue = false;
            break;
        case ZodTypes.unknown:
            returnValue = false;
            break;
        case ZodTypes.never:
            returnValue = false;
            break;
        case ZodTypes.void:
            returnValue = false;
            break;
        case ZodTypes.array:
            if (params.root === false) return false;
            returnValue = isScalar(def.type, {
                root: false
            });
            break;
        case ZodTypes.object:
            returnValue = false;
            break;
        case ZodTypes.union:
            returnValue = def.options.every((x)=>isScalar(x)
            );
            break;
        case ZodTypes.intersection:
            returnValue = isScalar(def.left) && isScalar(def.right);
            break;
        case ZodTypes.tuple:
            returnValue = def.items.every((x)=>isScalar(x, {
                    root: false
                })
            );
            break;
        case ZodTypes.lazy:
            returnValue = isScalar(def.getter());
            break;
        case ZodTypes.literal:
            returnValue = true;
            break;
        case ZodTypes.enum:
            returnValue = true;
            break;
        case ZodTypes.nativeEnum:
            returnValue = true;
            break;
        case ZodTypes.function:
            returnValue = false;
            break;
        case ZodTypes.record:
            returnValue = false;
            break;
        case ZodTypes.map:
            returnValue = false;
            break;
        case ZodTypes.date:
            returnValue = true;
            break;
        case ZodTypes.promise:
            returnValue = false;
            break;
        case ZodTypes.transformer:
            returnValue = isScalar(def.schema);
            break;
        case ZodTypes.optional:
            returnValue = isScalar(def.innerType);
            break;
        case ZodTypes.nullable:
            returnValue = isScalar(def.innerType);
            break;
        default:
            util.assertNever(def);
    }
    return returnValue;
};
const ZodTypes1 = ZodTypes;
const ZodParsedType1 = ZodParsedType;
class ZodCodeGenerator {
    seen = [];
    serial = 0;
    randomId = ()=>{
        return `IZod${this.serial++}`;
    };
    findBySchema = (schema)=>{
        return this.seen.find((s)=>s.schema === schema
        );
    };
    findById = (id)=>{
        const found = this.seen.find((s)=>s.id === id
        );
        if (!found) throw new Error(`Unfound ID: ${id}`);
        return found;
    };
    dump = ()=>{
        return `\ntype Identity<T> = T;\n\n${this.seen.map((item)=>`type ${item.id} = Identity<${item.type}>;`
        ).join("\n\n")}\n`;
    };
    setType = (id, type)=>{
        const found = this.findById(id);
        found.type = type;
        return found;
    };
    generate = (schema)=>{
        const found = this.findBySchema(schema);
        if (found) return found;
        const def = schema._def;
        const id = this.randomId();
        const ty = {
            schema,
            id,
            type: `__INCOMPLETE__`
        };
        this.seen.push(ty);
        switch(def.t){
            case ZodTypes.string:
                return this.setType(id, `string`);
            case ZodTypes.number:
                return this.setType(id, `number`);
            case ZodTypes.bigint:
                return this.setType(id, `bigint`);
            case ZodTypes.boolean:
                return this.setType(id, `boolean`);
            case ZodTypes.date:
                return this.setType(id, `Date`);
            case ZodTypes.undefined:
                return this.setType(id, `undefined`);
            case ZodTypes.null:
                return this.setType(id, `null`);
            case ZodTypes.any:
                return this.setType(id, `any`);
            case ZodTypes.unknown:
                return this.setType(id, `unknown`);
            case ZodTypes.never:
                return this.setType(id, `never`);
            case ZodTypes.void:
                return this.setType(id, `void`);
            case ZodTypes.literal:
                const val = def.value;
                const literalType = typeof val === "string" ? `"${val}"` : `${val}`;
                return this.setType(id, literalType);
            case ZodTypes.enum:
                return this.setType(id, def.values.map((v)=>`"${v}"`
                ).join(" | "));
            case ZodTypes.object:
                const objectLines = [];
                const shape = def.shape();
                for(const key in shape){
                    const childSchema = shape[key];
                    const childType = this.generate(childSchema);
                    const OPTKEY = isOptional1(childSchema) ? "?" : "";
                    objectLines.push(`${key}${OPTKEY}: ${childType.id}`);
                }
                const baseStruct = `{\n${objectLines.map((line)=>`  ${line};`
                ).join("\n")}\n}`;
                this.setType(id, `${baseStruct}`);
                break;
            case ZodTypes.tuple:
                const tupleLines = [];
                for (const elSchema of def.items){
                    const elType = this.generate(elSchema);
                    tupleLines.push(elType.id);
                }
                const baseTuple = `[\n${tupleLines.map((line)=>`  ${line},`
                ).join("\n")}\n]`;
                return this.setType(id, `${baseTuple}`);
            case ZodTypes.array:
                return this.setType(id, `${this.generate(def.type).id}[]`);
            case ZodTypes.function:
                const args = this.generate(def.args);
                const returns = this.generate(def.returns);
                return this.setType(id, `(...args: ${args.id})=>${returns.id}`);
            case ZodTypes.promise:
                const promValue = this.generate(def.type);
                return this.setType(id, `Promise<${promValue.id}>`);
            case ZodTypes.union:
                const unionLines = [];
                for (const elSchema1 of def.options){
                    const elType = this.generate(elSchema1);
                    unionLines.push(elType.id);
                }
                return this.setType(id, unionLines.join(` | `));
            case ZodTypes.intersection:
                return this.setType(id, `${this.generate(def.left).id} & ${this.generate(def.right).id}`);
            case ZodTypes.record:
                return this.setType(id, `{[k:string]: ${this.generate(def.valueType).id}}`);
            case ZodTypes.map:
                return this.setType(id, `Map<${this.generate(def.keyType).id}, ${this.generate(def.valueType).id}>`);
            case ZodTypes.lazy:
                const lazyType = def.getter();
                return this.setType(id, this.generate(lazyType).id);
            case ZodTypes.nativeEnum:
                return this.setType(id, "asdf");
            case ZodTypes.optional:
                return this.setType(id, `${this.generate(def.innerType).id} | undefined`);
            case ZodTypes.nullable:
                return this.setType(id, `${this.generate(def.innerType).id} | null`);
            case ZodTypes.transformer:
                return this.setType(id, `${this.generate(def.schema).id}`);
            default:
                util.assertNever(def);
        }
        return this.findById(id);
    };
    static create = ()=>new ZodCodeGenerator()
    ;
}
const codegen = ZodCodeGenerator.create;
const codegen1 = codegen;
const ZodCodeGenerator1 = ZodCodeGenerator;
const defaultErrorMap = (error, _ctx)=>{
    let message;
    switch(error.code){
        case ZodIssueCode.invalid_type:
            if (error.received === "undefined") {
                message = "Required";
            } else {
                message = `Expected ${error.expected}, received ${error.received}`;
            }
            break;
        case ZodIssueCode.nonempty_array_is_empty:
            message = `List must contain at least one item`;
            break;
        case ZodIssueCode.unrecognized_keys:
            message = `Unrecognized key(s) in object: ${error.keys.map((k)=>`'${k}'`
            ).join(", ")}`;
            break;
        case ZodIssueCode.invalid_union:
            message = `Invalid input`;
            break;
        case ZodIssueCode.invalid_literal_value:
            message = `Input must be "${error.expected}"`;
            break;
        case ZodIssueCode.invalid_enum_value:
            message = `Input must be one of these values: ${error.options.join(", ")}`;
            break;
        case ZodIssueCode.invalid_arguments:
            message = `Invalid function arguments`;
            break;
        case ZodIssueCode.invalid_return_type:
            message = `Invalid function return type`;
            break;
        case ZodIssueCode.invalid_date:
            message = `Invalid date`;
            break;
        case ZodIssueCode.invalid_string:
            if (error.validation !== "regex") message = `Invalid ${error.validation}`;
            else message = "Invalid";
            break;
        case ZodIssueCode.too_small:
            if (error.type === "array") message = `Should have ${error.inclusive ? `at least` : `more than`} ${error.minimum} items`;
            else if (error.type === "string") message = `Should be ${error.inclusive ? `at least` : `over`} ${error.minimum} characters`;
            else if (error.type === "number") message = `Value should be greater than ${error.inclusive ? `or equal to ` : ``}${error.minimum}`;
            else message = "Invalid input";
            break;
        case ZodIssueCode.too_big:
            if (error.type === "array") message = `Should have ${error.inclusive ? `at most` : `less than`} ${error.maximum} items`;
            else if (error.type === "string") message = `Should be ${error.inclusive ? `at most` : `under`} ${error.maximum} characters long`;
            else if (error.type === "number") message = `Value should be less than ${error.inclusive ? `or equal to ` : ``}${error.maximum}`;
            else message = "Invalid input";
            break;
        case ZodIssueCode.custom:
            message = `Invalid input.`;
            break;
        case ZodIssueCode.invalid_intersection_types:
            message = `Intersections only support objects`;
            break;
        default:
            message = `Invalid input.`;
            util.assertNever(error);
    }
    return {
        message
    };
};
class PseudoPromise {
    constructor(funcs = []){
        this.items = funcs;
    }
    static all = (pps)=>{
        return new PseudoPromise().all(pps);
    };
    all = (pps)=>{
        return this.then((_arg, ctx)=>{
            if (ctx.async) {
                const allValues = Promise.all(pps.map(async (pp)=>{
                    try {
                        const asdf = await pp.getValueAsync();
                        return asdf;
                    } catch (err) {
                        return INVALID;
                    }
                })).then((vals)=>{
                    return vals;
                });
                return allValues;
            } else {
                return pps.map((pp)=>pp.getValueSync()
                );
            }
        });
    };
    static object = (pps)=>{
        return new PseudoPromise().then((_arg, ctx)=>{
            const value = {
            };
            const zerr = new ZodError([]);
            if (ctx.async) {
                const getAsyncObject = async ()=>{
                    const items = await Promise.all(Object.keys(pps).map(async (k)=>{
                        try {
                            const v = await pps[k].getValueAsync();
                            return [
                                k,
                                v
                            ];
                        } catch (err) {
                            if (err instanceof ZodError) {
                                zerr.addIssues(err.issues);
                                return [
                                    k,
                                    INVALID
                                ];
                            }
                            throw err;
                        }
                    }));
                    if (!zerr.isEmpty) throw zerr;
                    for (const item of items){
                        if (item[1] !== NOSET) value[item[0]] = item[1];
                    }
                    return value;
                };
                return getAsyncObject();
            } else {
                const items = Object.keys(pps).map((k)=>{
                    try {
                        const v = pps[k].getValueSync();
                        return [
                            k,
                            v
                        ];
                    } catch (err) {
                        if (err instanceof ZodError) {
                            zerr.addIssues(err.issues);
                            return [
                                k,
                                INVALID
                            ];
                        }
                        throw err;
                    }
                });
                if (!zerr.isEmpty) throw zerr;
                for (const item of items){
                    if (item[1] !== NOSET) value[item[0]] = item[1];
                }
                return value;
            }
        });
    };
    static resolve = (value)=>{
        if (value instanceof PseudoPromise) {
            throw new Error("Do not pass PseudoPromise into PseudoPromise.resolve");
        }
        return new PseudoPromise().then(()=>value
        );
    };
    then = (func)=>{
        return new PseudoPromise([
            ...this.items,
            {
                type: "function",
                function: func
            }, 
        ]);
    };
    catch = (catcher)=>{
        return new PseudoPromise([
            ...this.items,
            {
                type: "catcher",
                catcher
            }, 
        ]);
    };
    getValueSync = ()=>{
        let val = undefined;
        for(let index = 0; index < this.items.length; index++){
            try {
                const item = this.items[index];
                if (item.type === "function") {
                    val = item.function(val, {
                        async: false
                    });
                }
            } catch (err) {
                const catcherIndex = this.items.findIndex((x, i)=>x.type === "catcher" && i > index
                );
                const catcherItem = this.items[catcherIndex];
                if (!catcherItem || catcherItem.type !== "catcher") {
                    throw err;
                } else {
                    index = catcherIndex;
                    val = catcherItem.catcher(err, {
                        async: false
                    });
                }
            }
        }
        return val;
    };
    getValueAsync = async ()=>{
        let val = undefined;
        for(let index = 0; index < this.items.length; index++){
            const item = this.items[index];
            try {
                if (item.type === "function") {
                    val = await item.function(val, {
                        async: true
                    });
                }
            } catch (err) {
                const catcherIndex = this.items.findIndex((x, i)=>x.type === "catcher" && i > index
                );
                const catcherItem = this.items[catcherIndex];
                if (!catcherItem || catcherItem.type !== "catcher") {
                    throw err;
                } else {
                    index = catcherIndex;
                    val = await catcherItem.catcher(err, {
                        async: true
                    });
                }
            }
            if (val instanceof PseudoPromise) {
                throw new Error("ASYNC: DO NOT RETURN PSEUDOPROMISE FROM FUNCTIONS");
            }
            if (val instanceof Promise) {
                throw new Error("ASYNC: DO NOT RETURN PROMISE FROM FUNCTIONS");
            }
        }
        return val;
    };
}
const makeError = (params, data, errorData)=>{
    const errorArg = {
        ...errorData,
        path: [
            ...params.path,
            ...errorData.path || []
        ]
    };
    const ctxArg = {
        data
    };
    const defaultError = defaultErrorMap === params.errorMap ? {
        message: `Invalid value.`
    } : defaultErrorMap(errorArg, {
        ...ctxArg,
        defaultError: `Invalid value.`
    });
    return {
        ...errorData,
        path: [
            ...params.path,
            ...errorData.path || []
        ],
        message: errorData.message || params.errorMap(errorArg, {
            ...ctxArg,
            defaultError: defaultError.message
        }).message
    };
};
const ostring = ()=>stringType1().optional()
;
const onumber = ()=>numberType1().optional()
;
const oboolean = ()=>booleanType1().optional()
;
const custom = (check, params)=>{
    if (check) return anyType1().refine(check, params);
    return anyType1();
};
const instanceOfType1 = (cls, params = {
    message: `Input not instance of ${cls.name}`
})=>custom((data)=>data instanceof cls
    , params)
;
const custom1 = custom;
const instanceOf = instanceOfType1;
const oboolean1 = oboolean;
const onumber1 = onumber;
const ostring1 = ostring;
const ZodParser = (schema)=>(data, baseParams = {
        seen: [],
        errorMap: defaultErrorMap,
        path: []
    })=>{
        const params = {
            seen: baseParams.seen || [],
            path: baseParams.path || [],
            errorMap: baseParams.errorMap || defaultErrorMap,
            async: baseParams.async ?? false,
            runAsyncValidationsInSeries: baseParams.runAsyncValidationsInSeries ?? false
        };
        const def = schema._def;
        let PROMISE = new PseudoPromise();
        PROMISE._default = true;
        const RESULT = {
            input: data,
            output: INVALID
        };
        params.seen = params.seen || [];
        const ERROR = new ZodError([]);
        const THROW = ()=>{
            RESULT.error = ERROR;
            throw ERROR;
        };
        const HANDLE = (err)=>{
            if (err instanceof ZodError) {
                ERROR.addIssues(err.issues);
                return INVALID;
            }
            throw ERROR;
        };
        const parsedType = getParsedType(data);
        switch(def.t){
            case ZodTypes.string:
                if (parsedType !== ZodParsedType.string) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.string,
                        received: parsedType
                    }));
                    THROW();
                }
                PROMISE = PseudoPromise.resolve(data);
                break;
            case ZodTypes.number:
                if (parsedType !== ZodParsedType.number) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.number,
                        received: parsedType
                    }));
                    THROW();
                }
                if (Number.isNaN(data)) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.number,
                        received: ZodParsedType.nan
                    }));
                    THROW();
                }
                PROMISE = PseudoPromise.resolve(data);
                break;
            case ZodTypes.bigint:
                if (parsedType !== ZodParsedType.bigint) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.bigint,
                        received: parsedType
                    }));
                    THROW();
                }
                PROMISE = PseudoPromise.resolve(data);
                break;
            case ZodTypes.boolean:
                if (parsedType !== ZodParsedType.boolean) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.boolean,
                        received: parsedType
                    }));
                    THROW();
                }
                PROMISE = PseudoPromise.resolve(data);
                break;
            case ZodTypes.undefined:
                if (parsedType !== ZodParsedType.undefined) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.undefined,
                        received: parsedType
                    }));
                    THROW();
                }
                PROMISE = PseudoPromise.resolve(data);
                break;
            case ZodTypes.null:
                if (parsedType !== ZodParsedType.null) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.null,
                        received: parsedType
                    }));
                    THROW();
                }
                PROMISE = PseudoPromise.resolve(data);
                break;
            case ZodTypes.any:
                PROMISE = PseudoPromise.resolve(data);
                break;
            case ZodTypes.unknown:
                PROMISE = PseudoPromise.resolve(data);
                break;
            case ZodTypes.never:
                ERROR.addIssue(makeError(params, data, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.never,
                    received: parsedType
                }));
                PROMISE = PseudoPromise.resolve(INVALID);
                break;
            case ZodTypes.void:
                if (parsedType !== ZodParsedType.undefined && parsedType !== ZodParsedType.null) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.void,
                        received: parsedType
                    }));
                    THROW();
                }
                PROMISE = PseudoPromise.resolve(data);
                break;
            case ZodTypes.array:
                RESULT.output = [];
                if (parsedType !== ZodParsedType.array) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.array,
                        received: parsedType
                    }));
                    THROW();
                }
                if (def.nonempty === true && data.length === 0) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.nonempty_array_is_empty
                    }));
                    THROW();
                }
                PROMISE = PseudoPromise.all(data.map((item, i)=>{
                    return new PseudoPromise().then(()=>def.type.parse(item, {
                            ...params,
                            path: [
                                ...params.path,
                                i
                            ]
                        })
                    ).catch((err)=>{
                        if (!(err instanceof ZodError)) {
                            throw err;
                        }
                        ERROR.addIssues(err.issues);
                        return INVALID;
                    });
                }));
                break;
            case ZodTypes.map:
                if (parsedType !== ZodParsedType.map) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.map,
                        received: parsedType
                    }));
                    THROW();
                }
                const dataMap = data;
                const returnedMap = new Map();
                PROMISE = PseudoPromise.all([
                    ...data.entries()
                ].map(([key, value], index)=>{
                    return PseudoPromise.all([
                        new PseudoPromise().then(()=>{
                            return def.keyType.parse(key, {
                                ...params,
                                path: [
                                    ...params.path,
                                    index,
                                    "key"
                                ]
                            });
                        }).catch(HANDLE),
                        new PseudoPromise().then(()=>{
                            const mapValue = def.valueType.parse(value, {
                                ...params,
                                path: [
                                    ...params.path,
                                    index,
                                    "value"
                                ]
                            });
                            return [
                                key,
                                mapValue
                            ];
                        }).catch(HANDLE), 
                    ]).then((item)=>{
                        if (item[0] !== INVALID && item[1] !== INVALID) {
                            returnedMap.set(item[0], item[1]);
                        }
                    }).catch(HANDLE);
                })).then(()=>{
                    if (!ERROR.isEmpty) {
                        throw ERROR;
                    }
                }).then(()=>{
                    return returnedMap;
                }).then(()=>{
                    return returnedMap;
                });
                break;
            case ZodTypes.object:
                RESULT.output = {
                };
                if (parsedType !== ZodParsedType.object) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.object,
                        received: parsedType
                    }));
                    THROW();
                }
                const objectPromises = {
                };
                const shape = def.shape();
                const shapeKeys = Object.keys(shape);
                const dataKeys = Object.keys(data);
                const extraKeys = dataKeys.filter((k)=>shapeKeys.indexOf(k) === -1
                );
                for (const key of shapeKeys){
                    const keyValidator = shapeKeys.includes(key) ? shape[key] : !(def.catchall instanceof ZodNever3) ? def.catchall : undefined;
                    if (!keyValidator) {
                        continue;
                    }
                    if (typeof data[key] === "undefined" && !dataKeys.includes(key)) {
                        objectPromises[key] = new PseudoPromise().then(()=>{
                            return keyValidator.parse(undefined, {
                                ...params,
                                path: [
                                    ...params.path,
                                    key
                                ]
                            });
                        }).then((output)=>{
                            if (output === undefined) {
                                return NOSET;
                            } else {
                                return output;
                            }
                        }).catch((err)=>{
                            if (err instanceof ZodError) {
                                const zerr = err;
                                ERROR.addIssues(err.issues);
                                objectPromises[key] = PseudoPromise.resolve(INVALID);
                            } else {
                                throw err;
                            }
                        });
                        continue;
                    }
                    objectPromises[key] = new PseudoPromise().then(()=>{
                        return keyValidator.parse(data[key], {
                            ...params,
                            path: [
                                ...params.path,
                                key
                            ]
                        });
                    }).catch((err)=>{
                        if (err instanceof ZodError) {
                            const zerr = err;
                            ERROR.addIssues(err.issues);
                            return INVALID;
                        } else {
                            throw err;
                        }
                    });
                }
                if (def.catchall instanceof ZodNever3) {
                    if (def.unknownKeys === "passthrough") {
                        for (const key1 of extraKeys){
                            objectPromises[key1] = PseudoPromise.resolve(data[key1]);
                        }
                    } else if (def.unknownKeys === "strict") {
                        if (extraKeys.length > 0) {
                            ERROR.addIssue(makeError(params, data, {
                                code: ZodIssueCode.unrecognized_keys,
                                keys: extraKeys
                            }));
                        }
                    } else if (def.unknownKeys === "strip") {
                    } else {
                        util.assertNever(def.unknownKeys);
                    }
                } else {
                    for (const key1 of extraKeys){
                        objectPromises[key1] = new PseudoPromise().then(()=>{
                            const parsedValue = def.catchall.parse(data[key1], {
                                ...params,
                                path: [
                                    ...params.path,
                                    key1
                                ]
                            });
                            return parsedValue;
                        }).catch((err)=>{
                            if (err instanceof ZodError) {
                                ERROR.addIssues(err.issues);
                            } else {
                                throw err;
                            }
                        });
                    }
                }
                PROMISE = PseudoPromise.object(objectPromises).then((resolvedObject)=>{
                    Object.assign(RESULT.output, resolvedObject);
                    return RESULT.output;
                }).then((finalObject)=>{
                    if (ERROR.issues.length > 0) {
                        return INVALID;
                    }
                    return finalObject;
                }).catch((err)=>{
                    if (err instanceof ZodError) {
                        ERROR.addIssues(err.issues);
                        return INVALID;
                    }
                    throw err;
                });
                break;
            case ZodTypes.union:
                let isValid = false;
                const unionErrors = [];
                PROMISE = PseudoPromise.all(def.options.map((opt, _j)=>{
                    return new PseudoPromise().then(()=>{
                        return opt.parse(data, params);
                    }).then((optionData)=>{
                        isValid = true;
                        return optionData;
                    }).catch((err)=>{
                        if (err instanceof ZodError) {
                            unionErrors.push(err);
                            return INVALID;
                        }
                        throw err;
                    });
                })).then((unionResults)=>{
                    if (!isValid) {
                        const nonTypeErrors = unionErrors.filter((err)=>{
                            return err.issues[0].code !== "invalid_type";
                        });
                        if (nonTypeErrors.length === 1) {
                            ERROR.addIssues(nonTypeErrors[0].issues);
                        } else {
                            ERROR.addIssue(makeError(params, data, {
                                code: ZodIssueCode.invalid_union,
                                unionErrors
                            }));
                        }
                        THROW();
                    }
                    return unionResults;
                }).then((unionResults)=>{
                    return util.find(unionResults, (val)=>val !== INVALID
                    );
                });
                break;
            case ZodTypes.intersection:
                PROMISE = PseudoPromise.all([
                    new PseudoPromise().then(()=>{
                        return def.left.parse(data, params);
                    }).catch(HANDLE),
                    new PseudoPromise().then(()=>{
                        return def.right.parse(data, params);
                    }).catch(HANDLE), 
                ]).then(([parsedLeft, parsedRight])=>{
                    if (parsedLeft === INVALID || parsedRight === INVALID) return INVALID;
                    const parsedLeftType = getParsedType(parsedLeft);
                    const parsedRightType = getParsedType(parsedRight);
                    if (parsedLeft === parsedRight) {
                        return parsedLeft;
                    } else if (parsedLeftType === ZodParsedType.object && parsedRightType === ZodParsedType.object) {
                        return {
                            ...parsedLeft,
                            ...parsedRight
                        };
                    } else {
                        ERROR.addIssue(makeError(params, data, {
                            code: ZodIssueCode.invalid_intersection_types
                        }));
                    }
                });
                break;
            case ZodTypes.optional:
                if (parsedType === ZodParsedType.undefined) {
                    PROMISE = PseudoPromise.resolve(undefined);
                    break;
                }
                PROMISE = new PseudoPromise().then(()=>{
                    return def.innerType.parse(data, params);
                }).catch(HANDLE);
                break;
            case ZodTypes.nullable:
                if (parsedType === ZodParsedType.null) {
                    PROMISE = PseudoPromise.resolve(null);
                    break;
                }
                PROMISE = new PseudoPromise().then(()=>{
                    return def.innerType.parse(data, params);
                }).catch(HANDLE);
                break;
            case ZodTypes.tuple:
                if (parsedType !== ZodParsedType.array) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.array,
                        received: parsedType
                    }));
                    THROW();
                }
                if (data.length > def.items.length) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.too_big,
                        maximum: def.items.length,
                        inclusive: true,
                        type: "array"
                    }));
                } else if (data.length < def.items.length) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.too_small,
                        minimum: def.items.length,
                        inclusive: true,
                        type: "array"
                    }));
                }
                const tupleData = data;
                PROMISE = PseudoPromise.all(data.map((item, index)=>{
                    const itemParser = def.items[index];
                    return new PseudoPromise().then(()=>{
                        const tupleDatum = itemParser.parse(item, {
                            ...params,
                            path: [
                                ...params.path,
                                index
                            ]
                        });
                        return tupleDatum;
                    }).catch((err)=>{
                        if (err instanceof ZodError) {
                            ERROR.addIssues(err.issues);
                            return;
                        }
                        throw err;
                    }).then((arg)=>{
                        return arg;
                    });
                })).then((tupleData1)=>{
                    if (!ERROR.isEmpty) THROW();
                    return tupleData1;
                }).catch((err)=>{
                    throw err;
                });
                break;
            case ZodTypes.lazy:
                const lazySchema = def.getter();
                PROMISE = PseudoPromise.resolve(lazySchema.parse(data, params));
                break;
            case ZodTypes.literal:
                if (data !== def.value) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_literal_value,
                        expected: def.value
                    }));
                }
                PROMISE = PseudoPromise.resolve(data);
                break;
            case ZodTypes.enum:
                if (def.values.indexOf(data) === -1) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_enum_value,
                        options: def.values
                    }));
                }
                PROMISE = PseudoPromise.resolve(data);
                break;
            case ZodTypes.nativeEnum:
                if (util.getValidEnumValues(def.values).indexOf(data) === -1) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_enum_value,
                        options: util.objectValues(def.values)
                    }));
                }
                PROMISE = PseudoPromise.resolve(data);
                break;
            case ZodTypes.function:
                if (parsedType !== ZodParsedType.function) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.function,
                        received: parsedType
                    }));
                    THROW();
                }
                const isAsyncFunction = def.returns instanceof ZodPromise2;
                const validatedFunction = (...args)=>{
                    const internalProm = new PseudoPromise().then(()=>{
                        return def.args.parse(args, {
                            ...params,
                            async: isAsyncFunction
                        });
                    }).catch((err)=>{
                        if (!(err instanceof ZodError)) throw err;
                        const argsError = new ZodError([]);
                        argsError.addIssue(makeError(params, data, {
                            code: ZodIssueCode.invalid_arguments,
                            argumentsError: err
                        }));
                        throw argsError;
                    }).then((args1)=>{
                        return data(...args1);
                    }).then((result)=>{
                        return def.returns.parse(result, {
                            ...params,
                            async: isAsyncFunction
                        });
                    }).catch((err)=>{
                        if (err instanceof ZodError) {
                            const returnsError = new ZodError([]);
                            returnsError.addIssue(makeError(params, data, {
                                code: ZodIssueCode.invalid_return_type,
                                returnTypeError: err
                            }));
                            throw returnsError;
                        }
                        throw err;
                    });
                    if (isAsyncFunction) {
                        return internalProm.getValueAsync();
                    } else {
                        return internalProm.getValueSync();
                    }
                };
                PROMISE = PseudoPromise.resolve(validatedFunction);
                break;
            case ZodTypes.record:
                if (parsedType !== ZodParsedType.object) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.object,
                        received: parsedType
                    }));
                    THROW();
                }
                const parsedRecordPromises = {
                };
                for(const key1 in data){
                    parsedRecordPromises[key1] = new PseudoPromise().then(()=>{
                        return def.valueType.parse(data[key1], {
                            ...params,
                            path: [
                                ...params.path,
                                key1
                            ]
                        });
                    }).catch(HANDLE);
                }
                PROMISE = PseudoPromise.object(parsedRecordPromises);
                break;
            case ZodTypes.date:
                if (!(data instanceof Date)) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.date,
                        received: parsedType
                    }));
                    THROW();
                }
                if (isNaN(data.getTime())) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_date
                    }));
                    THROW();
                }
                PROMISE = PseudoPromise.resolve(data);
                break;
            case ZodTypes.promise:
                if (parsedType !== ZodParsedType.promise && params.async !== true) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.invalid_type,
                        expected: ZodParsedType.promise,
                        received: parsedType
                    }));
                    THROW();
                }
                const promisified = parsedType === ZodParsedType.promise ? data : Promise.resolve(data);
                PROMISE = PseudoPromise.resolve(promisified.then((resolvedData)=>{
                    return def.type.parse(resolvedData, params);
                }));
                break;
            case ZodTypes.transformer:
                PROMISE = new PseudoPromise().then(()=>{
                    return def.schema.parse(data, params);
                });
                break;
            default:
                PROMISE = PseudoPromise.resolve("adsf");
                util.assertNever(def);
        }
        if (PROMISE._default === true) {
            throw new Error("Result is not materialized.");
        }
        if (!ERROR.isEmpty) {
            THROW();
        }
        const effects = def.effects || [];
        const checkCtx = {
            addIssue: (arg)=>{
                ERROR.addIssue(makeError(params, data, arg));
            },
            path: params.path
        };
        if (params.async === false) {
            const resolvedValue = PROMISE.getValueSync();
            if (resolvedValue === INVALID && ERROR.isEmpty) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodIssueCode.custom,
                    message: "Invalid"
                }));
            }
            if (!ERROR.isEmpty) {
                THROW();
            }
            let finalValue = resolvedValue;
            for (const effect of effects){
                if (effect.type === "check") {
                    const checkResult = effect.check(finalValue, checkCtx);
                    if (checkResult instanceof Promise) throw new Error("You can't use .parse() on a schema containing async refinements. Use .parseAsync instead.");
                } else if (effect.type === "mod") {
                    if (def.t !== ZodTypes.transformer) throw new Error("Only Modders can contain mods");
                    finalValue = effect.mod(finalValue);
                    if (finalValue instanceof Promise) {
                        throw new Error(`You can't use .parse() on a schema containing async transformations. Use .parseAsync instead.`);
                    }
                } else {
                    throw new Error(`Invalid effect type.`);
                }
            }
            if (!ERROR.isEmpty) {
                THROW();
            }
            return finalValue;
        } else {
            const checker = async ()=>{
                const resolvedValue = await PROMISE.getValueAsync();
                if (resolvedValue === INVALID && ERROR.isEmpty) {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodIssueCode.custom,
                        message: "Invalid"
                    }));
                }
                if (!ERROR.isEmpty) {
                    THROW();
                }
                let finalValue = resolvedValue;
                for (const effect of effects){
                    if (effect.type === "check") {
                        await effect.check(finalValue, checkCtx);
                    } else if (effect.type === "mod") {
                        if (def.t !== ZodTypes.transformer) throw new Error("Only Modders can contain mods");
                        finalValue = await effect.mod(finalValue);
                    }
                }
                if (!ERROR.isEmpty) {
                    THROW();
                }
                return finalValue;
            };
            return checker();
        }
    }
;
class ZodType1 {
    parse = ZodParser(this);
    safeParse = (data, params)=>{
        try {
            const parsed = this.parse(data, params);
            return {
                success: true,
                data: parsed
            };
        } catch (err) {
            if (err instanceof ZodError) {
                return {
                    success: false,
                    error: err
                };
            }
            throw err;
        }
    };
    parseAsync = async (value, params)=>{
        return await this.parse(value, {
            ...params,
            async: true
        });
    };
    safeParseAsync = async (data, params)=>{
        try {
            const parsed = await this.parseAsync(data, params);
            return {
                success: true,
                data: parsed
            };
        } catch (err) {
            if (err instanceof ZodError) {
                return {
                    success: false,
                    error: err
                };
            }
            throw err;
        }
    };
    spa = this.safeParseAsync;
    is(u) {
        try {
            this.parse(u);
            return true;
        } catch (err) {
            return false;
        }
    }
    check(u) {
        try {
            this.parse(u);
            return true;
        } catch (err) {
            return false;
        }
    }
    refine = (check, message = "Invalid value.")=>{
        if (typeof message === "string") {
            return this._refinement((val, ctx)=>{
                const result = check(val);
                const setError = ()=>ctx.addIssue({
                        code: ZodIssueCode.custom,
                        message
                    })
                ;
                if (result instanceof Promise) {
                    return result.then((data)=>{
                        if (!data) setError();
                    });
                }
                if (!result) {
                    setError();
                    return result;
                }
            });
        }
        if (typeof message === "function") {
            return this._refinement((val, ctx)=>{
                const result = check(val);
                const setError = ()=>ctx.addIssue({
                        code: ZodIssueCode.custom,
                        ...message(val)
                    })
                ;
                if (result instanceof Promise) {
                    return result.then((data)=>{
                        if (!data) setError();
                    });
                }
                if (!result) {
                    setError();
                    return result;
                }
            });
        }
        return this._refinement((val, ctx)=>{
            const result = check(val);
            const setError = ()=>ctx.addIssue({
                    code: ZodIssueCode.custom,
                    ...message
                })
            ;
            if (result instanceof Promise) {
                return result.then((data)=>{
                    if (!data) setError();
                });
            }
            if (!result) {
                setError();
                return result;
            }
        });
    };
    refinement = (check, refinementData)=>{
        return this._refinement((val, ctx)=>{
            if (!check(val)) {
                ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
            }
        });
    };
    _refinement = (refinement)=>{
        return new this.constructor({
            ...this._def,
            effects: [
                ...this._def.effects || [],
                {
                    type: "check",
                    check: refinement
                }, 
            ]
        });
    };
    constructor(def1){
        this._def = def1;
        this.is = this.is.bind(this);
        this.check = this.check.bind(this);
        this.transform = this.transform.bind(this);
        this.default = this.default.bind(this);
    }
    optional = ()=>ZodOptional2.create(this)
    ;
    or = this.optional;
    nullable = ()=>{
        return ZodNullable2.create(this);
    };
    array = ()=>ZodArray2.create(this)
    ;
    transform = (mod)=>{
        let returnType;
        if (this instanceof ZodTransformer2) {
            returnType = new this.constructor({
                ...this._def,
                effects: [
                    ...this._def.effects || [],
                    {
                        type: "mod",
                        mod
                    }
                ]
            });
        } else {
            returnType = new ZodTransformer2({
                t: ZodTypes.transformer,
                schema: this,
                effects: [
                    {
                        type: "mod",
                        mod
                    }
                ]
            });
        }
        return returnType;
    };
    prependMod = (mod)=>{
        return new this.constructor({
            ...this._def,
            effects: [
                {
                    type: "mod",
                    mod
                },
                ...this._def.effects || []
            ]
        });
    };
    clearEffects = ()=>{
        return new this.constructor({
            ...this._def,
            effects: []
        });
    };
    setEffects = (effects)=>{
        return new this.constructor({
            ...this._def,
            effects
        });
    };
    default(def) {
        return this.optional().transform((val)=>{
            const defaultVal = typeof def === "function" ? def(this) : def;
            return typeof val !== "undefined" ? val : defaultVal;
        });
    }
    isOptional = ()=>this.safeParse(undefined).success
    ;
    isNullable = ()=>this.safeParse(null).success
    ;
}
class ZodBigInt extends ZodType1 {
    toJSON = ()=>this._def
    ;
    static create = ()=>{
        return new ZodBigInt({
            t: ZodTypes.bigint
        });
    };
}
class ZodBoolean extends ZodType1 {
    toJSON = ()=>this._def
    ;
    static create = ()=>{
        return new ZodBoolean({
            t: ZodTypes.boolean
        });
    };
}
class ZodDate extends ZodType1 {
    toJSON = ()=>this._def
    ;
    static create = ()=>{
        return new ZodDate({
            t: ZodTypes.date
        });
    };
}
class ZodEnum extends ZodType1 {
    toJSON = ()=>this._def
    ;
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
    static create = (values)=>{
        return new ZodEnum({
            t: ZodTypes.enum,
            values: values
        });
    };
}
class ZodFunction extends ZodType1 {
    args = (...items)=>{
        return new ZodFunction({
            ...this._def,
            args: ZodTuple2.create(items)
        });
    };
    returns = (returnType)=>{
        return new ZodFunction({
            ...this._def,
            returns: returnType
        });
    };
    implement = (func)=>{
        const validatedFunc = this.parse(func);
        return validatedFunc;
    };
    validate = this.implement;
    static create = (args, returns)=>{
        return new ZodFunction({
            t: ZodTypes.function,
            args: args || ZodTuple2.create([]),
            returns: returns || ZodUnknown1.create()
        });
    };
    toJSON = ()=>{
        return {
            t: this._def.t,
            args: this._def.args.toJSON(),
            returns: this._def.returns.toJSON()
        };
    };
}
class ZodIntersection extends ZodType1 {
    toJSON = ()=>({
            t: this._def.t,
            left: this._def.left.toJSON(),
            right: this._def.right.toJSON()
        })
    ;
    static create = (left, right)=>{
        return new ZodIntersection({
            t: ZodTypes.intersection,
            left: left,
            right: right
        });
    };
}
class ZodLazy extends ZodType1 {
    get schema() {
        return this._def.getter();
    }
    toJSON = ()=>{
        throw new Error("Can't JSONify recursive structure");
    };
    static create = (getter)=>{
        return new ZodLazy({
            t: ZodTypes.lazy,
            getter: getter
        });
    };
}
class ZodLiteral extends ZodType1 {
    toJSON = ()=>this._def
    ;
    static create = (value)=>{
        return new ZodLiteral({
            t: ZodTypes.literal,
            value: value
        });
    };
}
class ZodMap extends ZodType1 {
    toJSON = ()=>({
            t: this._def.t,
            valueType: this._def.valueType.toJSON(),
            keyType: this._def.keyType.toJSON()
        })
    ;
    static create = (keyType, valueType)=>{
        return new ZodMap({
            t: ZodTypes.map,
            valueType,
            keyType
        });
    };
}
class ZodNativeEnum extends ZodType1 {
    toJSON = ()=>this._def
    ;
    static create = (values)=>{
        return new ZodNativeEnum({
            t: ZodTypes.nativeEnum,
            values: values
        });
    };
}
class ZodNever1 extends ZodType1 {
    toJSON = ()=>this._def
    ;
    static create = ()=>{
        return new ZodNever1({
            t: ZodTypes.never
        });
    };
}
class ZodNull extends ZodType1 {
    toJSON = ()=>this._def
    ;
    static create = ()=>{
        return new ZodNull({
            t: ZodTypes.null
        });
    };
}
class ZodNullable extends ZodType1 {
    toJSON = ()=>({
            t: this._def.t,
            innerType: this._def.innerType.toJSON()
        })
    ;
    static create = (type)=>{
        if (type instanceof ZodNullable) return type;
        return new ZodNullable({
            t: ZodTypes.nullable,
            innerType: type
        });
    };
}
class ZodNumber extends ZodType1 {
    toJSON = ()=>this._def
    ;
    static create = ()=>{
        return new ZodNumber({
            t: ZodTypes.number
        });
    };
    min = (minimum, message)=>this.refinement((data)=>data >= minimum
        , {
            code: ZodIssueCode.too_small,
            minimum,
            type: "number",
            inclusive: true,
            ...errorUtil.errToObj(message)
        })
    ;
    max = (maximum, message)=>this.refinement((data)=>data <= maximum
        , {
            code: ZodIssueCode.too_big,
            maximum,
            type: "number",
            inclusive: true,
            ...errorUtil.errToObj(message)
        })
    ;
    int = (message)=>this.refinement((data)=>Number.isInteger(data)
        , {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "number",
            ...errorUtil.errToObj(message)
        })
    ;
    positive = (message)=>this.refinement((data)=>data > 0
        , {
            code: ZodIssueCode.too_small,
            minimum: 0,
            type: "number",
            inclusive: false,
            ...errorUtil.errToObj(message)
        })
    ;
    negative = (message)=>this.refinement((data)=>data < 0
        , {
            code: ZodIssueCode.too_big,
            maximum: 0,
            type: "number",
            inclusive: false,
            ...errorUtil.errToObj(message)
        })
    ;
    nonpositive = (message)=>this.refinement((data)=>data <= 0
        , {
            code: ZodIssueCode.too_big,
            maximum: 0,
            type: "number",
            inclusive: true,
            ...errorUtil.errToObj(message)
        })
    ;
    nonnegative = (message)=>this.refinement((data)=>data >= 0
        , {
            code: ZodIssueCode.too_small,
            minimum: 0,
            type: "number",
            inclusive: true,
            ...errorUtil.errToObj(message)
        })
    ;
}
const AugmentFactory = (def2)=>(augmentation)=>{
        return new ZodObject({
            ...def2,
            shape: ()=>({
                    ...def2.shape(),
                    ...augmentation
                })
        });
    }
;
class ZodObject extends ZodType1 {
    get shape() {
        return this._def.shape();
    }
    toJSON = ()=>objectDefToJson(this._def)
    ;
    strict = ()=>new ZodObject({
            ...this._def,
            unknownKeys: "strict"
        })
    ;
    strip = ()=>new ZodObject({
            ...this._def,
            unknownKeys: "strip"
        })
    ;
    passthrough = ()=>new ZodObject({
            ...this._def,
            unknownKeys: "passthrough"
        })
    ;
    nonstrict = this.passthrough;
    augment = AugmentFactory(this._def);
    extend = AugmentFactory(this._def);
    setKey = (key, schema)=>{
        return this.augment({
            [key]: schema
        });
    };
    merge = objectUtil.mergeObjects(this);
    catchall = (index)=>{
        return new ZodObject({
            ...this._def,
            catchall: index
        });
    };
    pick = (mask)=>{
        const shape = {
        };
        Object.keys(mask).map((key)=>{
            shape[key] = this.shape[key];
        });
        return new ZodObject({
            ...this._def,
            shape: ()=>shape
        });
    };
    omit = (mask)=>{
        const shape = {
        };
        Object.keys(this.shape).map((key)=>{
            if (Object.keys(mask).indexOf(key) === -1) {
                shape[key] = this.shape[key];
            }
        });
        return new ZodObject({
            ...this._def,
            shape: ()=>shape
        });
    };
    partial = ()=>{
        const newShape = {
        };
        for(const key in this.shape){
            const fieldSchema = this.shape[key];
            newShape[key] = fieldSchema.isOptional() ? fieldSchema : fieldSchema.optional();
        }
        return new ZodObject({
            ...this._def,
            shape: ()=>newShape
        });
    };
    primitives = ()=>{
        const newShape = {
        };
        for(const key in this.shape){
            if (isScalar(this.shape[key])) {
                newShape[key] = this.shape[key];
            }
        }
        return new ZodObject({
            ...this._def,
            shape: ()=>newShape
        });
    };
    nonprimitives = ()=>{
        const newShape = {
        };
        for(const key in this.shape){
            if (!isScalar(this.shape[key])) {
                newShape[key] = this.shape[key];
            }
        }
        return new ZodObject({
            ...this._def,
            shape: ()=>newShape
        });
    };
    deepPartial = ()=>{
        const newShape = {
        };
        for(const key in this.shape){
            const fieldSchema = this.shape[key];
            if (fieldSchema instanceof ZodObject) {
                newShape[key] = fieldSchema.isOptional() ? fieldSchema : fieldSchema.deepPartial().optional();
            } else {
                newShape[key] = fieldSchema.isOptional() ? fieldSchema : fieldSchema.optional();
            }
        }
        return new ZodObject({
            ...this._def,
            shape: ()=>newShape
        });
    };
    static create = (shape)=>{
        return new ZodObject({
            t: ZodTypes.object,
            shape: ()=>shape
            ,
            unknownKeys: "strip",
            catchall: ZodNever4.create()
        });
    };
    static lazycreate = (shape)=>{
        return new ZodObject({
            t: ZodTypes.object,
            shape,
            unknownKeys: "strip",
            catchall: ZodNever4.create()
        });
    };
}
class ZodOptional extends ZodType1 {
    toJSON = ()=>({
            t: this._def.t,
            innerType: this._def.innerType.toJSON()
        })
    ;
    static create = (type)=>{
        if (type instanceof ZodOptional) return type;
        return new ZodOptional({
            t: ZodTypes.optional,
            innerType: type
        });
    };
}
class ZodPromise extends ZodType1 {
    toJSON = ()=>{
        return {
            t: this._def.t,
            type: this._def.type.toJSON()
        };
    };
    static create = (schema)=>{
        return new ZodPromise({
            t: ZodTypes.promise,
            type: schema
        });
    };
}
class ZodRecord extends ZodType1 {
    toJSON = ()=>({
            t: this._def.t,
            valueType: this._def.valueType.toJSON()
        })
    ;
    static create = (valueType)=>{
        return new ZodRecord({
            t: ZodTypes.record,
            valueType
        });
    };
}
class ZodString extends ZodType1 {
    inputSchema = this;
    outputSchema = this;
    toJSON = ()=>this._def
    ;
    min = (minLength, message)=>this.refinement((data)=>data.length >= minLength
        , {
            code: ZodIssueCode.too_small,
            minimum: minLength,
            type: "string",
            inclusive: true,
            ...errorUtil.errToObj(message)
        })
    ;
    max = (maxLength, message)=>this.refinement((data)=>data.length <= maxLength
        , {
            code: ZodIssueCode.too_big,
            maximum: maxLength,
            type: "string",
            inclusive: true,
            ...errorUtil.errToObj(message)
        })
    ;
    length(len, message) {
        return this.min(len, message).max(len, message);
    }
    _regex = (regex, validation, message)=>this.refinement((data)=>regex.test(data)
        , {
            validation,
            code: ZodIssueCode.invalid_string,
            ...errorUtil.errToObj(message)
        })
    ;
    email = (message)=>this._regex(emailRegex, "email", message)
    ;
    url = (message)=>this.refinement((data)=>{
            try {
                new URL(data);
                return true;
            } catch  {
                return false;
            }
        }, {
            code: ZodIssueCode.invalid_string,
            validation: "url",
            ...errorUtil.errToObj(message)
        })
    ;
    uuid = (message)=>this._regex(uuidRegex, "uuid", message)
    ;
    regex = (regexp, message)=>this._regex(regexp, "regex", message)
    ;
    nonempty = (message)=>this.min(1, errorUtil.errToObj(message))
    ;
    static create = ()=>{
        return new ZodString({
            t: ZodTypes.string,
            validation: {
            }
        });
    };
}
class ZodTransformer extends ZodType1 {
    toJSON = ()=>({
            t: this._def.t,
            schema: this._def.schema.toJSON()
        })
    ;
    __default = (..._args)=>this
    ;
    static create = (schema)=>{
        const newTx = new ZodTransformer({
            t: ZodTypes.transformer,
            schema
        });
        return newTx;
    };
}
class ZodTuple extends ZodType1 {
    toJSON = ()=>({
            t: this._def.t,
            items: this._def.items.map((item)=>item.toJSON()
            )
        })
    ;
    get items() {
        return this._def.items;
    }
    static create = (schemas)=>{
        return new ZodTuple({
            t: ZodTypes.tuple,
            items: schemas
        });
    };
}
class ZodUnknown extends ZodType1 {
    toJSON = ()=>this._def
    ;
    static create = ()=>{
        return new ZodUnknown({
            t: ZodTypes.unknown
        });
    };
}
const stringType1 = ZodString.create;
const numberType1 = ZodNumber.create;
const bigIntType1 = ZodBigInt.create;
const booleanType1 = ZodBoolean.create;
const dateType1 = ZodDate.create;
const nullType1 = ZodNull.create;
const neverType1 = ZodNever1.create;
const objectType1 = ZodObject.create;
const intersectionType1 = ZodIntersection.create;
const tupleType1 = ZodTuple.create;
const recordType1 = ZodRecord.create;
const mapType1 = ZodMap.create;
const functionType1 = ZodFunction.create;
const lazyType1 = ZodLazy.create;
const literalType1 = ZodLiteral.create;
const enumType1 = ZodEnum.create;
const nativeEnumType1 = ZodNativeEnum.create;
const promiseType1 = ZodPromise.create;
const transformerType1 = ZodTransformer.create;
const optionalType1 = ZodOptional.create;
const nullableType1 = ZodNullable.create;
const late = {
    object: ZodObject.lazycreate
};
const bigint = bigIntType1;
const boolean = booleanType1;
const date = dateType1;
const enumeration = enumType1;
const fn = functionType1;
const intersection = intersectionType1;
const lazy = lazyType1;
const literal = literalType1;
const map = mapType1;
const nativeEnum = nativeEnumType1;
const never = neverType1;
const nullValue = nullType1;
const nullable = nullableType1;
const number = numberType1;
const object = objectType1;
const optional = optionalType1;
const promise = promiseType1;
const record = recordType1;
const string = stringType1;
const transformer = transformerType1;
const tuple = tupleType1;
const late1 = late;
const ZodBigInt1 = ZodBigInt;
const ZodBoolean1 = ZodBoolean;
const ZodDate1 = ZodDate;
const ZodEnum1 = ZodEnum;
const ZodFunction1 = ZodFunction;
const ZodIntersection1 = ZodIntersection;
const ZodLazy1 = ZodLazy;
const ZodLiteral1 = ZodLiteral;
const ZodNativeEnum1 = ZodNativeEnum;
const ZodNever2 = ZodNever1;
const ZodNull1 = ZodNull;
const ZodNullable1 = ZodNullable;
const ZodNumber1 = ZodNumber;
const ZodObject1 = ZodObject;
const ZodOptional1 = ZodOptional;
const ZodPromise1 = ZodPromise;
const ZodRecord1 = ZodRecord;
const ZodString1 = ZodString;
const ZodTransformer1 = ZodTransformer;
const ZodTuple1 = ZodTuple;
const ZodNever3 = ZodNever1;
const ZodPromise2 = ZodPromise;
class ZodAny extends ZodType1 {
    toJSON = ()=>this._def
    ;
    static create = ()=>{
        return new ZodAny({
            t: ZodTypes.any
        });
    };
}
class ZodArray extends ZodType1 {
    toJSON = ()=>{
        return {
            t: this._def.t,
            nonempty: this._def.nonempty,
            type: this._def.type.toJSON()
        };
    };
    get element() {
        return this._def.type;
    }
    min = (minLength, message)=>this.refinement((data)=>data.length >= minLength
        , {
            code: ZodIssueCode.too_small,
            type: "array",
            inclusive: true,
            minimum: minLength,
            ...typeof message === "string" ? {
                message
            } : message
        })
    ;
    max = (maxLength, message)=>this.refinement((data)=>data.length <= maxLength
        , {
            code: ZodIssueCode.too_big,
            type: "array",
            inclusive: true,
            maximum: maxLength,
            ...typeof message === "string" ? {
                message
            } : message
        })
    ;
    length = (len, message)=>this.min(len, {
            message
        }).max(len, {
            message
        })
    ;
    nonempty = ()=>{
        return new ZodNonEmptyArray({
            ...this._def,
            nonempty: true
        });
    };
    static create = (schema)=>{
        return new ZodArray({
            t: ZodTypes.array,
            type: schema,
            nonempty: false
        });
    };
}
class ZodNonEmptyArray extends ZodType1 {
    toJSON = ()=>{
        return {
            t: this._def.t,
            type: this._def.type.toJSON()
        };
    };
    min = (minLength, message)=>this.refinement((data)=>data.length >= minLength
        , {
            code: ZodIssueCode.too_small,
            minimum: minLength,
            type: "array",
            inclusive: true,
            ...typeof message === "string" ? {
                message
            } : message
        })
    ;
    max = (maxLength, message)=>this.refinement((data)=>data.length <= maxLength
        , {
            code: ZodIssueCode.too_big,
            maximum: maxLength,
            type: "array",
            inclusive: true,
            ...typeof message === "string" ? {
                message
            } : message
        })
    ;
    length = (len, message)=>this.min(len, {
            message
        }).max(len, {
            message
        })
    ;
}
const ZodNullable2 = ZodNullable;
const ZodOptional2 = ZodOptional;
const ZodTransformer2 = ZodTransformer;
const ZodTuple2 = ZodTuple;
const ZodUnknown1 = ZodUnknown;
const ZodNever4 = ZodNever1;
const anyType1 = ZodAny.create;
const arrayType1 = ZodArray.create;
const any = anyType1;
const array = arrayType1;
const ZodAny1 = ZodAny;
const ZodArray1 = ZodArray;
const ZodArray2 = ZodArray;
export { ZodTypes1 as ZodTypes, custom1 as custom, anyType as any, arrayType as array, bigIntType as bigint, booleanType as boolean, codegen1 as codegen, dateType as date, enumType as enumeration, functionType as fn, instanceOfType as instanceOf, intersectionType as intersection, lazyType as lazy, literalType as literal, mapType as map, nativeEnumType as nativeEnum, neverType as never, nullType as nullValue, nullableType as nullable, numberType as number, objectType as object, oboolean1 as oboolean, onumber1 as onumber, optionalType as optional, ostring1 as ostring, promiseType as promise, recordType as record, stringType as string, transformerType as transformer, tupleType as tuple, undefinedType as undefined, unionType as union, unknownType as unknown, voidType as voidReturn, late1 as late, ZodType as Schema, ZodAny1 as ZodAny, ZodArray1 as ZodArray, ZodBigInt1 as ZodBigInt, ZodBoolean1 as ZodBoolean, ZodCodeGenerator1 as ZodCodeGenerator, ZodDate1 as ZodDate, ZodEnum1 as ZodEnum, ZodFunction1 as ZodFunction, ZodIntersection1 as ZodIntersection, ZodLazy1 as ZodLazy, ZodLiteral1 as ZodLiteral, ZodNativeEnum1 as ZodNativeEnum, ZodNever2 as ZodNever, ZodNull1 as ZodNull, ZodNullable1 as ZodNullable, ZodNumber1 as ZodNumber, ZodObject1 as ZodObject, ZodOptional1 as ZodOptional, ZodParsedType1 as ZodParsedType, ZodPromise1 as ZodPromise, ZodRecord1 as ZodRecord, ZodType as ZodSchema, ZodString1 as ZodString, ZodTransformer1 as ZodTransformer, ZodTuple1 as ZodTuple, ZodIssueCode1 as ZodIssueCode, quotelessJson1 as quotelessJson, ZodError1 as ZodError };
