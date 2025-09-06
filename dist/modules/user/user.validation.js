"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coverImage = exports.profileImage = exports.logout = void 0;
const zod_1 = require("zod");
const Token_1 = require("../../utils/Security/Token");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const cloud_1 = require("../../utils/Multer/cloud");
exports.logout = {
    body: zod_1.z.strictObject({
        flag: zod_1.z.enum(Token_1.logoutEnum).default(Token_1.logoutEnum.signout)
    })
};
exports.profileImage = {
    file: zod_1.z.strictObject({
        fieldname: validation_middleware_1.genralFields.file.fieldname.includes("Image"),
        originalname: validation_middleware_1.genralFields.file.originalname,
        encoding: validation_middleware_1.genralFields.file.encoding,
        mimetype: zod_1.z.enum(cloud_1.fileValidation.Image),
        destination: validation_middleware_1.genralFields.file.destination,
        filename: validation_middleware_1.genralFields.file.filename,
        path: validation_middleware_1.genralFields.file.path,
        size: validation_middleware_1.genralFields.file.size
    })
};
exports.coverImage = {
    file: exports.profileImage.file.extend({
        fieldname: validation_middleware_1.genralFields.file.fieldname.includes("Cover")
    })
};
