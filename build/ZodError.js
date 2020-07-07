"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodError = void 0;
class ZodError extends Error {
    constructor() {
        super();
        this.errors = [];
        this.mergeChild = (pathElement, child) => {
            if (child instanceof ZodError) {
                this.merge(child.bubbleUp(pathElement));
            }
            else {
                this.merge(ZodError.fromString(child.message).bubbleUp(pathElement));
            }
            return this;
        };
        this.bubbleUp = (pathElement) => {
            this.errors = this.errors.map((err) => {
                return { path: [pathElement, ...err.path], message: err.message };
            });
            return this;
        };
        this.addError = (path, message) => {
            this.errors.push({ path: path === '' ? [] : [path], message });
            return this;
        };
        this.merge = (error) => {
            this.errors = [...this.errors, ...error.errors];
            return this;
        };
        // restore prototype chain
        const actualProto = new.target.prototype;
        Object.setPrototypeOf(this, actualProto);
    }
    get message() {
        return this.errors
            .map(({ path, message }) => {
            return path.length ? `${path.join('.')}: ${message}` : `${message}`;
        })
            .join('\n');
    }
    get empty() {
        return this.errors.length === 0;
    }
}
exports.ZodError = ZodError;
ZodError.create = (errors) => {
    const error = new ZodError();
    error.errors = errors;
    return error;
};
ZodError.fromString = (message) => {
    return ZodError.create([
        {
            path: [],
            message,
        },
    ]);
};
//# sourceMappingURL=ZodError.js.map