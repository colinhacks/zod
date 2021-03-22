export var errorUtil;
(function (errorUtil) {
    errorUtil.errToObj = function (message) {
        return typeof message === "string" ? { message: message } : message || {};
    };
    errorUtil.toString = function (message) {
        return typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
    };
})(errorUtil || (errorUtil = {}));
//# sourceMappingURL=errorUtil.js.map