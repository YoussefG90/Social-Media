"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endPoint = void 0;
const user_1 = require("../../DB/models/user");
exports.endPoint = {
    restore: [user_1.roleEnum.admin],
    hardDelete: [user_1.roleEnum.admin]
};
