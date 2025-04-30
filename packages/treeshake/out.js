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
function randomString(length = 10) {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let str = "";
    for (let i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
// zod-specific utils
function clone(inst, def) {
    const cl = new inst._zod.constr(def ?? inst._zod.def);
    if (!def)
        cl._zod.parent = inst;
    return cl;
}
function normalizeParams(_params) {
    return {};
}
function aborted(x, startIndex = 0) {
    for (let i = startIndex; i < x.issues.length; i++) {
        if (x.issues[i].continue !== true)
            return true;
    }
    return false;
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

const boolean$1 = /true|false/i;

const version = {
    major: 0,
    minor: 8,
    patch: 1,
};

const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
    var _a;
    inst ?? (inst = {});
    inst._zod.id = def.type + "_" + randomString(10);
    inst._zod.def = def; // set _def property
    inst._zod.computed = inst._zod.computed || {}; // initialize _computed object
    inst._zod.version = version;
    // inst._zod.optionality ??= "required"; // default
    const checks = [...(inst._zod.def.checks ?? [])];
    // if inst is itself a checks.$ZodCheck, run it as a check
    if (inst._zod.traits.has("$ZodCheck")) {
        checks.unshift(inst);
    }
    //
    for (const ch of checks) {
        for (const fn of ch._zod.onattach) {
            fn(inst);
        }
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
                    asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
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
                    return { issues: issues.map((iss) => finalizeIssue(iss, {}, config())) };
                });
            }
            if (result.issues.length === 0)
                return { value: result.value };
            return { issues: result.issues.map((iss) => finalizeIssue(iss, {}, config())) };
        },
        vendor: "zod",
        version: 1,
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
                ...checks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch),
            ],
        });
    };
    inst.clone = (_def) => clone(inst, _def);
    inst.brand = () => inst;
    inst.register = ((reg, meta) => {
        reg.add(inst, meta);
        return inst;
    });
});
const ZodMiniBoolean = /*@__PURE__*/ $constructor("ZodMiniBoolean", (inst, def) => {
    $ZodBoolean.init(inst, def);
    ZodMiniType.init(inst, def);
});
function boolean(params) {
    return _boolean(ZodMiniBoolean);
}

var schema = boolean();
console.log(schema.parse(true));
