"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandling = exports.Unauthorized = exports.Forbidden = exports.conflict = exports.NotFound = exports.BadRequest = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    constructor(message, statusCode = 400, cause) {
        super(message, { cause });
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class BadRequest extends AppError {
    constructor(message, cause) {
        super(message, 400, cause);
    }
}
exports.BadRequest = BadRequest;
class NotFound extends AppError {
    constructor(message, cause) {
        super(message, 404, cause);
    }
}
exports.NotFound = NotFound;
class conflict extends AppError {
    constructor(message, cause) {
        super(message, 409, cause);
    }
}
exports.conflict = conflict;
class Forbidden extends AppError {
    constructor(message, cause) {
        super(message, 403, cause);
    }
}
exports.Forbidden = Forbidden;
class Unauthorized extends AppError {
    constructor(message, cause) {
        super(message, 401, cause);
    }
}
exports.Unauthorized = Unauthorized;
const globalErrorHandling = (error, req, res, next) => {
    return res.status(error.statusCode || 500).json({
        error_message: error.message,
        cause: error.cause,
        stack: process.env.MOOD === "development" ? error.stack : undefined
    });
};
exports.globalErrorHandling = globalErrorHandling;
