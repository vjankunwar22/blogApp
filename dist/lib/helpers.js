"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryCatchHandler = void 0;
const tryCatchHandler = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        }
        catch (error) {
            next(error);
        }
    };
};
exports.tryCatchHandler = tryCatchHandler;
