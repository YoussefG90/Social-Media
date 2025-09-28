"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = exports.LikeActionEnum = exports.AllowCommentsEnum = exports.AvailabilityEnum = void 0;
const mongoose_1 = require("mongoose");
const email_1 = require("../../utils/Events/email");
const user_1 = __importDefault(require("./user"));
var AvailabilityEnum;
(function (AvailabilityEnum) {
    AvailabilityEnum["public"] = "public";
    AvailabilityEnum["friends"] = "friends";
    AvailabilityEnum["onlyMe"] = "Only-Me";
})(AvailabilityEnum || (exports.AvailabilityEnum = AvailabilityEnum = {}));
var AllowCommentsEnum;
(function (AllowCommentsEnum) {
    AllowCommentsEnum["Allow"] = "Allow";
    AllowCommentsEnum["Deny"] = "Deny";
})(AllowCommentsEnum || (exports.AllowCommentsEnum = AllowCommentsEnum = {}));
var LikeActionEnum;
(function (LikeActionEnum) {
    LikeActionEnum["like"] = "like";
    LikeActionEnum["unlike"] = "unlike";
})(LikeActionEnum || (exports.LikeActionEnum = LikeActionEnum = {}));
const postSchema = new mongoose_1.Schema({
    content: { type: String, minlength: 2, maxlength: 500000, required: function () {
            return !this.attachments?.length;
        } },
    attachments: [{ secure_url: { type: String }, public_id: { type: String } }],
    assistFolderId: { type: String, required: true },
    availability: { type: String, enum: AvailabilityEnum, default: AvailabilityEnum.public },
    allowComments: { type: String, enum: AllowCommentsEnum, default: AllowCommentsEnum.Allow },
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
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
postSchema.post("save", async function (doc) {
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
postSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
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
postSchema.pre(["find", "findOne", "countDocuments"], function (next) {
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
postSchema.virtual("comments", {
    localField: "_id",
    foreignField: "postId",
    ref: "Comment",
    justOne: true
});
exports.PostModel = mongoose_1.models.Post || (0, mongoose_1.model)("Post", postSchema);
