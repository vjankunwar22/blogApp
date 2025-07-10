"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
class HttpError extends Error {
    constructor(errorType = 'INTERNAL_SERVER_ERROR', message, stack) {
        super(message);
        this.status = errorType === 'BAD_REQUEST' ? 400 : errorType === 'UNAUTHORIZED' ? 401 : errorType === 'FORBIDDEN' ? 403 : errorType === 'NOT_FOUND' ? 404 : 500;
        this.message = message;
        this.stack = stack;
    }
}
exports.HttpError = HttpError;
