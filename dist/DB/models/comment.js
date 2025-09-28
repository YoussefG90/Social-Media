"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = require("mongoose");
const email_1 = require("../../utils/Events/email");
const user_1 = __importDefault(require("./user"));
const commentSchema = new mongoose_1.Schema({
    content: { type: String, minlength: 2, maxlength: 500000, required: function () {
            return !this.attachments?.length;
        } },
    attachments: [{ secure_url: { type: String }, public_id: { type: String } }],
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Post", required: true },
    commentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" },
    freezedAt: Date,
    freezedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    restoreAt: Date,
    restoredBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
commentSchema.post("save", async function (doc) {
    if (doc.tags?.length) {
        const users = await user_1.default.find({ _id: { $in: doc.tags } });
        for (const user of users) {
            if (user.email) {
                email_1.emailEvent.emit("Tagged in Post", {
                    to: user.email,
                    otp: `You were tagged in a new post by user ${doc.createdBy}`,
                });
            }
        }
    }
});
commentSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        delete query.paranoid;
        this.setQuery({ ...query });
    }
    else {
        delete query.paranoid;
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
commentSchema.pre(["find", "findOne", "countDocuments"], function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        delete query.paranoid;
        this.setQuery({ ...query });
    }
    else {
        delete query.paranoid;
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
commentSchema.virtual("reply", {
    localField: "_id",
    foreignField: "commentId",
    ref: "Comment",
    justOne: true
});
exports.CommentModel = mongoose_1.models.comment || (0, mongoose_1.model)("Comment", commentSchema);
