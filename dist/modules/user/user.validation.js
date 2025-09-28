"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardDelete = exports.restoreAccount = exports.freezeAccount = exports.coverImage = exports.profileImage = exports.updatePassword = exports.updateBasicInfo = exports.logout = exports.acceptFriendRequest = exports.unFriend = exports.block = exports.sendFriendRequest = exports.changeRole = void 0;
const zod_1 = require("zod");
const Token_1 = require("../../utils/Security/Token");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const cloud_1 = require("../../utils/Multer/cloud");
const mongoose_1 = require("mongoose");
const models_1 = require("../../DB/models");
const user_service_1 = require("./user.service");
exports.changeRole = {
    params: zod_1.z.strictObject({
        userId: validation_middleware_1.genralFields.id
    }),
    body: zod_1.z.strictObject({
        role: zod_1.z.enum(models_1.roleEnum)
    })
};
exports.sendFriendRequest = {
    params: zod_1.z.strictObject({
        userId: validation_middleware_1.genralFields.id
    }),
    body: zod_1.z.strictObject({
        type: zod_1.z.enum(Object.values(user_service_1.FriendRequestEnum))
    })
};
exports.block = {
    params: exports.sendFriendRequest.params
};
exports.unFriend = {
    params: exports.sendFriendRequest.params
};
exports.acceptFriendRequest = {
    params: zod_1.z.strictObject({
        requestId: validation_middleware_1.genralFields.id
    })
};
exports.logout = {
    body: zod_1.z.strictObject({
        flag: zod_1.z.enum(Token_1.logoutEnum).default(Token_1.logoutEnum.signout)
    })
};
exports.updateBasicInfo = {
    body: zod_1.z.strictObject({
        firstName: validation_middleware_1.genralFields.name.optional(),
        lastName: validation_middleware_1.genralFields.name.optional(),
        age: validation_middleware_1.genralFields.age.optional(),
        phone: validation_middleware_1.genralFields.phone.optional(),
        gender: validation_middleware_1.genralFields.gender.optional()
    })
};
exports.updatePassword = {
    body: zod_1.z
        .strictObject({
        oldPassword: validation_middleware_1.genralFields.password,
        newPassword: validation_middleware_1.genralFields.password,
        confirmNewPassword: zod_1.z.string(),
    })
        .refine((data) => data.confirmNewPassword === data.newPassword, {
        message: "confirmNewPassword notMatch newPassword",
        path: ["confirmNewPassword"],
    }),
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
exports.freezeAccount = {
    params: zod_1.z.object({
        userId: zod_1.z.string().optional()
    }).optional().refine((data) => {
        return data?.userId ? mongoose_1.Types.ObjectId.isValid(data.userId) : true;
    }, { error: "In-Valid ObjectId Format", path: ["userId"] })
};
exports.restoreAccount = {
    params: zod_1.z.object({
        userId: zod_1.z.string()
    }).refine((data) => {
        return mongoose_1.Types.ObjectId.isValid(data.userId);
    }, { error: "In-Valid ObjectId Format", path: ["userId"] })
};
exports.hardDelete = exports.restoreAccount;
