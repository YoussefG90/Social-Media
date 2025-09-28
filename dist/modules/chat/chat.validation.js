"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGroup = exports.getGroup = exports.getChat = void 0;
const zod_1 = require("zod");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const cloud_1 = require("../../utils/Multer/cloud");
exports.getChat = {
    params: zod_1.z.strictObject({
        userId: validation_middleware_1.genralFields.id
    }),
    query: zod_1.z.strictObject({
        page: zod_1.z.coerce.number().int().min(1).optional(),
        size: zod_1.z.coerce.number().int().min(1).optional()
    })
};
exports.getGroup = {
    params: zod_1.z.strictObject({
        groupId: validation_middleware_1.genralFields.id
    }),
    query: exports.getChat.query
};
exports.createGroup = {
    body: zod_1.z.strictObject({
        participants: zod_1.z.array(validation_middleware_1.genralFields.id).min(1),
        group: zod_1.z.string().min(2).max(5000),
    }).superRefine((data, ctx) => {
        if (data.participants?.length && data.participants.length !== [new Set(data.participants)].length) {
            ctx.addIssue({ code: "custom", path: ["Tages"], message: "Duplicated Tagged User" });
        }
    }),
    file: zod_1.z.strictObject({
        fieldname: validation_middleware_1.genralFields.file.fieldname.includes("Image"),
        originalname: validation_middleware_1.genralFields.file.originalname,
        encoding: validation_middleware_1.genralFields.file.encoding,
        mimetype: zod_1.z.enum(cloud_1.fileValidation.Image),
        destination: validation_middleware_1.genralFields.file.destination,
        filename: validation_middleware_1.genralFields.file.filename,
        path: validation_middleware_1.genralFields.file.path,
        size: validation_middleware_1.genralFields.file.size
    }).optional()
};
