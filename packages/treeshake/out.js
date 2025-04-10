function $constructor(name, initializer) {
    class _ {
        constructor(def) {
            var _a;
            const th = this;
            _.init(th, def);
            (_a = th._zod).deferred ?? (_a.deferred = []);
            for (const fn of th._zod.deferred) {
                fn();
            }
        }
        static init(inst, def) {
            var _a;
            inst._zod ?? (inst._zod = {});
            (_a = inst._zod).traits ?? (_a.traits = new Set());
            // const seen = inst._zod.traits.has(name);
            inst._zod.traits.add(name);
            initializer(inst, def);
            // support prototype modifications
            for (const k in _.prototype) {
                Object.defineProperty(inst, k, { value: _.prototype[k].bind(inst) });
            }
            inst._zod.constr = _;
            inst._zod.def = def;
        }
        static [Symbol.hasInstance](inst) {
            return inst?._zod?.traits?.has(name);
        }
    }
    Object.defineProperty(_, "name", { value: name });
    return _;
}
class $ZodAsyncError extends Error {
    constructor() {
        super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
    }
}
const globalConfig = {};
function config(config) {
    return globalConfig;
}

// functions
function jsonStringifyReplacer(_, value) {
    if (typeof value === "bigint")
        return value.toString();
    return value;
}
function cached(getter) {
    return {
        get value() {
            {
                const value = getter();
                Object.defineProperty(this, "value", { value });
                return value;
            }
        },
    };
}
function defineLazy(object, key, getter) {
    Object.defineProperty(object, key, {
        get() {
            {
                const value = getter();
                object[key] = value;
                // Object.defineProperty(object, key, { value });
                return value;
            }
        },
        set(v) {
            Object.defineProperty(object, key, {
                value: v,
                // configurable: true,
            });
            // object[key] = v;
        },
        configurable: true,
    });
}
function randomString(length = 10) {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let str = "";
    for (let i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
function esc(str) {
    return JSON.stringify(str);
}
function isObject(data) {
    return typeof data === "object" && data !== null;
}
const allowsEval = cached(() => {
    try {
        new Function("");
        return true;
    }
    catch (_) {
        return false;
    }
});
// zod-specific utils
function clone(inst, def) {
    return new inst._zod.constr(def);
}
function normalizeParams(_params) {
    return {};
}
function optionalObjectKeys(shape) {
    return Object.keys(shape).filter((k) => {
        return shape[k]._zod.qout === "true";
    });
}
function aborted(x, startIndex = 0) {
    for (let i = startIndex; i < x.issues.length; i++) {
        if (x.issues[i].continue !== true)
            return true;
    }
    return false;
}
function prefixIssues(path, issues) {
    return issues.map((iss) => {
        var _a;
        (_a = iss).path ?? (_a.path = []);
        iss.path.unshift(path);
        return iss;
    });
}
function unwrapMessage(message) {
    return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config) {
    const full = { ...iss, path: iss.path ?? [] };
    // for backwards compatibility
    // const _ctx: errors.$ZodErrorMapCtx = { data: iss.input, defaultError: undefined as any };
    if (!iss.message) {
        const message = unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ??
            unwrapMessage(ctx?.error?.(iss)) ??
            unwrapMessage(config.customError?.(iss)) ??
            unwrapMessage(config.localeError?.(iss)) ??
            "Invalid input";
        full.message = message;
    }
    // delete (full as any).def;
    delete full.inst;
    delete full.continue;
    if (!ctx?.reportInput) {
        delete full.input;
    }
    return full;
}

////////////////////////    ERROR CLASS   ////////////////////////
const ZOD_ERROR = Symbol.for("{{zod.error}}");
class $ZodError {
    get message() {
        return JSON.stringify(this.issues, jsonStringifyReplacer, 2);
    }
    constructor(issues) {
        Object.defineProperty(this, "_tag", { value: ZOD_ERROR, enumerable: false });
        Object.defineProperty(this, "name", { value: "$ZodError", enumerable: false });
        this.issues = issues;
    }
    // @ts-ignore
    static [Symbol.hasInstance](inst) {
        return inst?._tag === ZOD_ERROR;
    }
}

function _parse(schema, value, _ctx) {
    const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
        throw new $ZodAsyncError();
    }
    if (result.issues.length) {
        throw new (this?.Error ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    }
    return result.value;
}
function _safeParse(schema, value, _ctx) {
    const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
        throw new $ZodAsyncError();
    }
    return (result.issues.length
        ? {
            success: false,
            error: new (this?.Error ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config()))),
        }
        : { success: true, data: result.value });
}
async function _parseAsync(schema, value, _ctx) {
    const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
        result = await result;
    if (result.issues.length) {
        throw new (this?.Error ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    }
    return result.value;
}
async function _safeParseAsync(schema, value, _ctx) {
    const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
        result = await result;
    if (result.issues.length) {
        return {
            success: false,
            error: new (this?.Error ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config()))),
        };
    }
    return { success: true, data: result.value };
}

const string$1 = (params) => {
    const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
    return new RegExp(`^${regex}$`);
};
const number$1 = /^-?\d+(?:\.\d+)?/i;
const boolean$1 = /true|false/i;

class Doc {
    constructor(args) {
        this.content = [];
        this.indent = 0;
        this.args = args;
    }
    indented(fn) {
        this.indent += 1;
        fn(this);
        this.indent -= 1;
    }
    write(arg) {
        if (typeof arg === "function") {
            arg(this, { execution: "sync" });
            arg(this, { execution: "async" });
            return;
        }
        const content = arg;
        const lines = content.split("\n").filter((x) => x);
        const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
        const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
        for (const line of dedented) {
            this.content.push(line);
        }
    }
    compile() {
        const lines = [...this.content.map((x) => `  ${x}`)];
        return new Function(...this.args, lines.join("\n"));
    }
}

const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
    var _a;
    inst ?? (inst = {});
    inst._zod.id = def.type + "_" + randomString(10);
    inst._zod.def = def; // set _def property
    inst._zod.computed = inst._zod.computed || {}; // initialize _computed object
    const checks = [...(inst._zod.def.checks ?? [])];
    // if inst is itself a checks.$ZodCheck, run it as a check
    if (inst._zod.traits.has("$ZodCheck")) {
        checks.unshift(inst);
    }
    //
    for (const ch of checks) {
        ch._zod.onattach?.(inst);
    }
    if (checks.length === 0) {
        // deferred initializer
        // inst._zod.parse is not yet defined
        (_a = inst._zod).deferred ?? (_a.deferred = []);
        inst._zod.deferred?.push(() => {
            inst._zod.run = inst._zod.parse;
        });
    }
    else {
        const runChecks = (payload, checks, ctx) => {
            let isAborted = aborted(payload);
            let asyncResult;
            for (const ch of checks) {
                if (ch._zod.when) {
                    const shouldRun = ch._zod.when(payload);
                    if (!shouldRun)
                        continue;
                }
                else {
                    if (isAborted) {
                        continue;
                    }
                }
                const currLen = payload.issues.length;
                const _ = ch._zod.check(payload);
                if (_ instanceof Promise && ctx?.async === false) {
                    throw new $ZodAsyncError();
                }
                if (asyncResult || _ instanceof Promise) {
                    asyncResult = asyncResult ?? Promise.resolve();
                    asyncResult.then(async () => {
                        await _;
                        const nextLen = payload.issues.length;
                        if (nextLen === currLen)
                            return;
                        if (!isAborted)
                            isAborted = aborted(payload, currLen);
                    });
                }
                else {
                    const nextLen = payload.issues.length;
                    if (nextLen === currLen)
                        continue;
                    if (!isAborted)
                        isAborted = aborted(payload, currLen);
                }
            }
            if (asyncResult) {
                return asyncResult.then(() => {
                    return payload;
                });
            }
            return payload;
        };
        inst._zod.run = (payload, ctx) => {
            const result = inst._zod.parse(payload, ctx);
            if (result instanceof Promise) {
                if (ctx.async === false)
                    throw new $ZodAsyncError();
                return result.then((result) => runChecks(result, checks, ctx));
            }
            return runChecks(result, checks, ctx);
        };
    }
    inst["~standard"] = {
        validate: (value) => {
            const result = inst._zod.run({ value, issues: [] }, {});
            if (result instanceof Promise) {
                return result.then(({ issues, value }) => {
                    if (issues.length === 0)
                        return { value };
                    return { issues };
                });
            }
            if (result.issues.length === 0)
                return { value: result.value };
            return { issues: result.issues };
        },
        vendor: "zod",
        version: 1,
    };
});
const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = inst?._zod.computed?.pattern ?? string$1(inst._zod.computed);
    inst._zod.parse = (payload, _) => {
        if (def.coerce)
            try {
                payload.value = String(payload.value);
            }
            catch (_) { }
        if (typeof payload.value === "string")
            return payload;
        payload.issues.push({
            expected: "string",
            code: "invalid_type",
            input: payload.value,
            inst,
        });
        return payload;
    };
});
const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = inst._zod.computed.pattern ?? number$1;
    inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
            try {
                payload.value = Number(payload.value);
            }
            catch (_) { }
        const input = payload.value;
        if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
            return payload;
        }
        const received = typeof input === "number"
            ? Number.isNaN(input)
                ? "NaN"
                : !Number.isFinite(input)
                    ? "Infinity"
                    : undefined
            : undefined;
        payload.issues.push({
            expected: "number",
            code: "invalid_type",
            input,
            inst,
            ...(received ? { received } : {}),
        });
        return payload;
    };
});
const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = boolean$1;
    inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
            try {
                payload.value = Boolean(payload.value);
            }
            catch (_) { }
        const input = payload.value;
        if (typeof input === "boolean")
            return payload;
        payload.issues.push({
            expected: "boolean",
            code: "invalid_type",
            input,
            inst,
        });
        return payload;
    };
});
function handleObjectResult(result, final, key) {
    // if(isOptional)
    if (result.issues.length) {
        final.issues.push(...prefixIssues(key, result.issues));
    }
    else {
        final.value[key] = result.value;
    }
}
function handleOptionalObjectResult(result, final, key, input) {
    if (result.issues.length) {
        if (input[key] === undefined) {
            if (key in input) {
                final.value[key] = undefined;
            }
        }
        else {
            final.issues.push(...prefixIssues(key, result.issues));
        }
    }
    else if (result.value === undefined) {
        if (key in input)
            final.value[key] = undefined;
    }
    else {
        final.value[key] = result.value;
    }
}
const $ZodObjectLike = /*@__PURE__*/ $constructor("$ZodObjectLike", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "shape", () => def.shape);
    const _normalized = cached(() => {
        const keys = Object.keys(def.shape);
        return {
            shape: def.shape,
            keys,
            keySet: new Set(keys),
            numKeys: keys.length,
            optionalKeys: new Set(def.optional),
        };
    });
    defineLazy(inst._zod, "disc", () => {
        const shape = def.shape;
        const discMap = new Map();
        let hasDisc = false;
        for (const key in shape) {
            const field = shape[key]._zod;
            if (field.values || field.disc) {
                hasDisc = true;
                const o = {
                    values: new Set(field.values ?? []),
                    maps: field.disc ? [field.disc] : [],
                };
                discMap.set(key, o);
            }
        }
        if (!hasDisc)
            return undefined;
        return discMap;
    });
    const generateFastpass = (shape) => {
        const doc = new Doc(["shape", "payload", "ctx"]);
        const { keys, optionalKeys } = _normalized.value;
        const parseStr = (key) => {
            const k = esc(key);
            return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
        };
        // doc.write(`const shape = inst._zod.def.shape;`);
        doc.write(`const input = payload.value;`);
        const ids = {};
        for (const key of keys) {
            ids[key] = randomString(15);
        }
        for (const key of keys) {
            if (optionalKeys.has(key))
                continue;
            const id = ids[key];
            doc.write(`const ${id} = ${parseStr(key)};`);
            doc.write(`
          if (${id}.issues.length) payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${esc(key)}, ...iss.path] : [${esc(key)}]
          })));`);
        }
        // check for missing keys
        // for (const key of keys) {
        //   if (optionalKeys.has(key)) continue;
        //   doc.write(`if(!(${util.esc(key)} in input)) {`);
        //   doc.indented(() => {
        //     doc.write(`payload.issues.push({`);
        //     doc.indented(() => {
        //       doc.write(`code: "invalid_type",`);
        //       doc.write(`path: [${util.esc(key)}],`);
        //       doc.write(`expected: "nonoptional",`);
        //       doc.write(`note: 'Missing required key: "${key}"',`);
        //       doc.write(`input,`);
        //       doc.write(`inst,`);
        //     });
        //     doc.write(`});`);
        //   });
        //   doc.write(`}`);
        // }
        // add required keys to result
        // doc.write(`return payload;`);
        // doc.write(`if(Object.keys(input).length === ${keys.length}) {
        //   payload.value = {...input};
        //   return payload;
        // }`);
        doc.write(`payload.value = {`);
        doc.indented(() => {
            for (const key of keys) {
                if (optionalKeys.has(key))
                    continue;
                const id = ids[key];
                doc.write(`  ${esc(key)}: ${id}.value,`);
                // doc.write(`payload.value[${util.esc(key)}] = ${id}.value;`);
            }
        });
        doc.write(`}`);
        // add in optionalKeys if defined
        // OLD: only run validation if they are define in input
        // for (const key of keys) {
        //   if (!optionalKeys.has(key)) continue;
        //   const id = ids[key];
        //   doc.write(`if (${util.esc(key)} in input) {`);
        //   doc.indented(() => {
        //     doc.write(`if(input[${util.esc(key)}] === undefined) {`);
        //     doc.indented(() => {
        //       doc.write(`payload.value[${util.esc(key)}] = undefined;`);
        //     });
        //     doc.write(`} else {`);
        //     doc.indented(() => {
        //       doc.write(`const ${id} = ${parseStr(key)};`);
        //       doc.write(`payload.value[${util.esc(key)}] = ${id}.value;`);
        //       doc.write(`
        //         if (${id}.issues.length) payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
        //           ...iss,
        //           path: iss.path ? [${util.esc(key)}, ...iss.path] : [${util.esc(key)}]
        //         })));`);
        //     });
        //     doc.write(`}`);
        //   });
        //   doc.write(`}`);
        // }
        // NEW: always run validation
        // this lets default values get applied to optionals
        for (const key of keys) {
            if (!optionalKeys.has(key))
                continue;
            const id = ids[key];
            doc.write(`const ${id} = ${parseStr(key)};`);
            const k = esc(key);
            doc.write(`
        if (${id}.issues.length) {
          if (input[${k}] === undefined) {
            if (${k} in input) {
              payload.value[${k}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${id}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${k}, ...iss.path] : [${k}],
              }))
            );
          }
        } else if (${id}.value === undefined) {
          if (${k} in input) payload.value[${k}] = undefined;
        } else {
          payload.value[${k}] = ${id}.value;
        }  
        `);
        }
        // doc.write(`payload.value = final;`);
        doc.write(`return payload;`);
        // return doc.compile().bind(null, shape);
        const fn = doc.compile();
        return (payload, ctx) => fn(shape, payload, ctx);
        // return fn.bind(null, _inst._zod.def.shape);
    };
    let fastpass;
    const fastEnabled = allowsEval.value; // && !def.catchall;
    const isObject$1 = isObject;
    const { catchall } = def;
    // const noCatchall = !def.catchall;
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!isObject$1(input)) {
            payload.issues.push({
                expected: "object",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        }
        const proms = [];
        if (fastEnabled && ctx?.async === false && ctx.noPrecompilation !== true) {
            // always synchronous
            if (!fastpass)
                fastpass = generateFastpass(def.shape);
            payload = fastpass(payload, ctx);
        }
        else {
            payload.value = {};
            // const normalized = _normalized.value;
            const { keys, shape, optionalKeys } = _normalized.value;
            for (const key of keys) {
                const valueSchema = shape[key];
                // do not add omitted optional keys
                // if (!(key in input)) {
                //   if (optionalKeys.has(key)) continue;
                //   payload.issues.push({
                //     code: "invalid_type",
                //     path: [key],
                //     expected: "nonoptional",
                //     note: `Missing required key: "${key}"`,
                //     input,
                //     inst,
                //   });
                // }
                const r = valueSchema._zod.run({ value: input[key], issues: [] }, ctx);
                const isOptional = optionalKeys.has(key);
                // if (isOptional) {
                //   if (!(key in input)) {
                //     continue;
                //   }
                //   if (input[key] === undefined) {
                //     input[key] = undefined;
                //     continue;
                //   }
                // }
                // const r = valueSchema._zod.run({ value: input[key], issues: [] }, ctx);
                if (r instanceof Promise) {
                    proms.push(r.then((r) => isOptional ? handleOptionalObjectResult(r, payload, key, input) : handleObjectResult(r, payload, key)));
                }
                else {
                    if (isOptional) {
                        handleOptionalObjectResult(r, payload, key, input);
                    }
                    else {
                        handleObjectResult(r, payload, key);
                    }
                }
            }
        }
        if (!catchall) {
            // return payload;
            return proms.length ? Promise.all(proms).then(() => payload) : payload;
        }
        const unrecognized = [];
        // iterate over input keys
        for (const key of Object.keys(input)) {
            if (_normalized.value.keySet.has(key))
                continue;
            if (catchall._zod.def.type === "never") {
                unrecognized.push(key);
                continue;
            }
            const r = catchall._zod.run({ value: input[key], issues: [] }, ctx);
            if (r instanceof Promise) {
                proms.push(r.then((r) => handleObjectResult(r, payload, key)));
            }
            else {
                handleObjectResult(r, payload, key);
            }
        }
        if (unrecognized.length) {
            payload.issues.push({
                code: "unrecognized_keys",
                keys: unrecognized,
                input,
                inst,
            });
        }
        if (!proms.length)
            return payload;
        return Promise.all(proms).then(() => {
            return payload;
        });
    };
});
const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
    $ZodObjectLike.init(inst, def);
});

function _string(Class, params) {
    return new Class({
        type: "string",
        ...normalizeParams(),
    });
}
function _number(Class, params) {
    return new Class({
        type: "number",
        checks: [],
        ...normalizeParams(),
    });
}
function _boolean(Class, params) {
    return new Class({
        type: "boolean",
        ...normalizeParams(),
    });
}

const parse = /* @__PURE__ */ _parse.bind({ Error: $ZodError });
const safeParse = /* @__PURE__ */ _safeParse.bind({ Error: $ZodError });
const parseAsync = /* @__PURE__ */ _parseAsync.bind({ Error: $ZodError });
const safeParseAsync = /* @__PURE__ */ _safeParseAsync.bind({
    Error: $ZodError,
});

const ZodMiniType = /*@__PURE__*/ $constructor("ZodMiniType", (inst, def) => {
    if (!inst._zod)
        throw new Error("Uninitialized schema in mixin ZodMiniType.");
    $ZodType.init(inst, def);
    inst.def = def;
    inst.parse = (data, params) => parse(inst, data, params);
    inst.safeParse = (data, params) => safeParse(inst, data, params);
    inst.parseAsync = async (data, params) => parseAsync(inst, data, params);
    inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
    inst.check = (...checks) => {
        return inst.clone({
            ...def,
            checks: [
                ...(def.checks ?? []),
                ...checks.map((ch) => (typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" } } } : ch)),
            ],
        });
    };
    inst.clone = (_def) => clone(inst, _def ?? def);
    inst.brand = () => inst;
    inst.register = ((reg, meta) => {
        reg.add(inst, meta);
        return inst;
    });
});
const ZodMiniString = /*@__PURE__*/ $constructor("ZodMiniString", (inst, def) => {
    $ZodString.init(inst, def);
    ZodMiniType.init(inst, def);
});
function string(params) {
    return _string(ZodMiniString);
}
const ZodMiniNumber = /*@__PURE__*/ $constructor("ZodMiniNumber", (inst, def) => {
    $ZodNumber.init(inst, def);
    ZodMiniType.init(inst, def);
});
function number(params) {
    return _number(ZodMiniNumber);
}
const ZodMiniBoolean = /*@__PURE__*/ $constructor("ZodMiniBoolean", (inst, def) => {
    $ZodBoolean.init(inst, def);
    ZodMiniType.init(inst, def);
});
function boolean(params) {
    return _boolean(ZodMiniBoolean);
}
const ZodMiniObject = /*@__PURE__*/ $constructor("ZodMiniObject", (inst, def) => {
    $ZodObject.init(inst, def);
    ZodMiniType.init(inst, def);
});
function object(shape, params) {
    const def = {
        type: "object",
        shape: shape ?? {},
        get optional() {
            return optionalObjectKeys(shape ?? {});
        },
        ...normalizeParams(),
    };
    return new ZodMiniObject(def);
}

var schema = object({ a: string(), b: number(), c: boolean() });
schema.parse({
    a: "asdf",
    b: 123,
    c: true,
});
