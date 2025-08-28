"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = void 0;
const zod_1 = require("zod");
const Token_1 = require("../../utils/Security/Token");
exports.logout = {
    body: zod_1.z.strictObject({
        flag: zod_1.z.enum(Token_1.logoutEnum).default(Token_1.logoutEnum.signout)
    })
};
