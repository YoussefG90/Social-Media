"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.freezePost = exports.likePost = exports.updatePost = exports.createPost = void 0;
const zod_1 = require("zod");
const post_1 = require("../../DB/models/post");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const cloud_1 = require("../../utils/Multer/cloud");
exports.createPost = {
    body: zod_1.z.strictObject({
        content: zod_1.z.string().min(2).max(500000).optional(),
        attachments: zod_1.z.array(validation_middleware_1.genralFields.files(cloud_1.fileValidation.Image)).max(2).optional(),
        availability: zod_1.z.enum(post_1.AvailabilityEnum).default(post_1.AvailabilityEnum.public),
        allowPosts: zod_1.z.enum(post_1.AllowCommentsEnum).default(post_1.AllowCommentsEnum.Allow),
        tags: zod_1.z.array(validation_middleware_1.genralFields.id).max(10).optional()
    }).superRefine((data, ctx) => {
        if (!data.attachments?.length && !data.content) {
            ctx.addIssue({ code: "custom", path: ["Content"],
                message: "Sorry Cannot Make Post Without Content Or Attachment" });
        }
        if (data.tags?.length && data.tags.length !== [new Set(data.tags)].length) {
            ctx.addIssue({ code: "custom", path: ["Tages"], message: "Duplicated Tagged User" });
        }
    })
};
exports.updatePost = {
    params: zod_1.z.strictObject({
        PostId: validation_middleware_1.genralFields.id
    }),
    body: zod_1.z.strictObject({
        content: zod_1.z.string().min(2).max(500000).optional(),
        attachments: zod_1.z.array(validation_middleware_1.genralFields.files(cloud_1.fileValidation.Image)).max(2).optional(),
        removedAttachments: zod_1.z.array(zod_1.z.string()).max(2).optional(),
        availability: zod_1.z.enum(post_1.AvailabilityEnum).optional(),
        allowPosts: zod_1.z.enum(post_1.AllowCommentsEnum).optional(),
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
        PostId: validation_middleware_1.genralFields.id
    }),
    query: zod_1.z.strictObject({
        action: zod_1.z.enum(post_1.LikeActionEnum).default(post_1.LikeActionEnum.like)
    })
};
exports.freezePost = {
    params: exports.updatePost.params
};
