"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePost = exports.updateComment = exports.freezeComment = exports.replyOnComment = exports.createComment = void 0;
const zod_1 = require("zod");
const post_1 = require("../../DB/models/post");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const cloud_1 = require("../../utils/Multer/cloud");
exports.createComment = {
    params: zod_1.z.strictObject({
        CommentId: validation_middleware_1.genralFields.id
    }),
    body: zod_1.z.strictObject({
        content: zod_1.z.string().min(2).max(500000).optional(),
        attachments: zod_1.z.array(validation_middleware_1.genralFields.files(cloud_1.fileValidation.Image)).max(2).optional(),
        tags: zod_1.z.array(validation_middleware_1.genralFields.id).max(10).optional()
    }).superRefine((data, ctx) => {
        if (!data.attachments?.length && !data.content) {
            ctx.addIssue({ code: "custom", path: ["Content"],
                message: "Sorry Cannot Make Comment Without Content Or Attachment" });
        }
        if (data.tags?.length && data.tags.length !== [new Set(data.tags)].length) {
            ctx.addIssue({ code: "custom", path: ["Tages"], message: "Duplicated Tagged User" });
        }
    })
};
exports.replyOnComment = {
    params: exports.createComment.params.extend({
        commentId: validation_middleware_1.genralFields.id
    }),
    body: exports.createComment.body
};
exports.freezeComment = {
    params: exports.replyOnComment.params
};
exports.updateComment = {
    params: zod_1.z.strictObject({
        CommentId: validation_middleware_1.genralFields.id
    }),
    body: zod_1.z.strictObject({
        content: zod_1.z.string().min(2).max(500000).optional(),
        attachments: zod_1.z.array(validation_middleware_1.genralFields.files(cloud_1.fileValidation.Image)).max(2).optional(),
        removedAttachments: zod_1.z.array(zod_1.z.string()).max(2).optional(),
        availability: zod_1.z.enum(post_1.AvailabilityEnum).optional(),
        allowComments: zod_1.z.enum(post_1.AllowCommentsEnum).optional(),
        tags: zod_1.z.array(validation_middleware_1.genralFields.id).max(10).optional(),
        removedTags: zod_1.z.array(validation_middleware_1.genralFields.id).max(10).optional()
    }).superRefine((data, ctx) => {
        if (!Object.values(data)?.length) {
            ctx.addIssue({ code: "custom", path: ["Inputs"],
                message: "All Keys Are Empty" });
        }
        if (data.tags?.length && data.tags.length !== [new Set(data.tags)].length) {
            ctx.addIssue({ code: "custom", path: ["Tages"], message: "Duplicated Tagged User" });
        }
        if (data.removedTags?.length && data.removedTags.length !== [new Set(data.removedTags)].length) {
            ctx.addIssue({ code: "custom", path: ["removedTags"], message: "Duplicated removedTags User" });
        }
    })
};
exports.likePost = {
    params: zod_1.z.strictObject({
        CommentId: validation_middleware_1.genralFields.id
    }),
    query: zod_1.z.strictObject({
        action: zod_1.z.enum(post_1.LikeActionEnum).default(post_1.LikeActionEnum.like)
    })
};
