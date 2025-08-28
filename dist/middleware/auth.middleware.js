"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = void 0;
const error_response_1 = require("../utils/Response/error.response");
const Token_1 = require("../utils/Security/Token");
const authentication = (tokenType = Token_1.TokenEnum.access) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new error_response_1.BadRequest("Validation Error", {
                key: "headers",
                issues: [{ path: "authorization", message: "missing authorization" }]
            });
        }
        const { user, decoded } = await (0, Token_1.decodedToken)({ authorization: req.headers.authorization, tokenType });
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authentication = authentication;
const authorization = (accessRoles = [], tokenType = Token_1.TokenEnum.access) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new error_response_1.BadRequest("Validation Error", {
                key: "headers",
                issues: [{ path: "authorization", message: "missing authorization" }]
            });
        }
        const { user, decoded } = await (0, Token_1.decodedToken)({ authorization: req.headers.authorization, tokenType });
        if (!accessRoles.includes(user.role)) {
            throw new error_response_1.Forbidden("Not Authorized Account");
        }
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authorization = authorization;
