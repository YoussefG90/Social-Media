"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.postAvailability = void 0;
const success_response_1 = require("../../utils/Response/success.response");
const repository_1 = require("../../DB/repository");
const post_1 = require("../../DB/models/post");
const user_1 = require("../../DB/models/user");
const error_response_1 = require("../../utils/Response/error.response");
const uuid_1 = require("uuid");
const cloudinary_1 = require("../../utils/Multer/cloudinary");
const mongoose_1 = require("mongoose");
const models_1 = require("../../DB/models");
const gateway_1 = require("../gateway");
const postAvailability = (req) => {
    return [
        { availability: post_1.AvailabilityEnum.public },
        { availability: post_1.AvailabilityEnum.onlyMe, createdBy: req.user?._id },
        { availability: post_1.AvailabilityEnum.friends,
            createdBy: { $in: [...(req.user?.friends || []), req.user?._id] }
        },
        { availability: { $ne: post_1.AvailabilityEnum.onlyMe }, tags: { $in: req.user?._id } }
    ];
};
exports.postAvailability = postAvailability;
class PostService {
    postModel = new repository_1.PostRepository(post_1.PostModel);
    userModel = new repository_1.UserReposirotry(user_1.UserModel);
    commentModel = new repository_1.CommentRepository(models_1.CommentModel);
    constructor() { }
    createPost = async (req, res) => {
        if (req.body.tags?.length && (await this.userModel.find({
            filter: { _id: { $in: req.body.tags, $ne: req.user?._id } }
        })).length !== req.body.tags.length) {
            throw new error_response_1.NotFound("Sorry Some Users Taged Not Exist");
        }
        let attachments = [];
        let assistFolderId = (0, uuid_1.v4)();
        if (req.files?.length) {
            attachments = await (0, cloudinary_1.uploadFiles)({
                files: req.files,
                path: `users/${req.user?._id}/post/${assistFolderId}`
            });
        }
        const [post] = await this.postModel.create({ data: [{
                    ...req.body, attachments, assistFolderId, createdBy: req.user?._id
                }] }) || [];
        if (!post) {
            if (attachments.length) {
                await (0, cloudinary_1.destroyResources)({
                    public_ids: attachments.map(a => a.public_id)
                });
            }
            throw new error_response_1.BadRequest("Fail To Publish The Post");
        }
        return (0, success_response_1.successResponse)({ res, statusCode: 201 });
    };
    updatePost = async (req, res) => {
        const { postId } = req.params;
        const findPost = await this.postModel.findOne({ filter: { _id: postId, createdBy: req.user?._id } });
        if (!findPost) {
            throw new error_response_1.NotFound("Post Not Found");
        }
        if (req.body.tags?.length && (await this.userModel.find({
            filter: { _id: { $in: req.body.tags, $ne: req.user?._id } }
        })).length !== req.body.tags.length) {
            throw new error_response_1.NotFound("Sorry Some Users Taged Not Exist");
        }
        let attachments = [];
        let assistFolderId = (0, uuid_1.v4)();
        if (req.files?.length) {
            attachments = await (0, cloudinary_1.uploadFiles)({
                files: req.files,
                path: `users/${req.user?._id}/post/${assistFolderId}`
            });
        }
        const updatedPost = await this.postModel.updateOne({ filter: { _id: findPost._id },
            update: [
                {
                    $set: {
                        content: req.body.content,
                        allowComments: req.body.allowComments ?? findPost.allowComments,
                        availability: req.body.availability ?? findPost.availability,
                        attachments: {
                            $concatArrays: [
                                {
                                    $filter: {
                                        input: "$attachments",
                                        as: "a",
                                        cond: { $not: { $in: ["$$a.public_id", req.body.removedAttachments || []] } }
                                    }
                                },
                                attachments
                            ]
                        },
                        tags: {
                            $setUnion: [
                                {
                                    $setDifference: ["tags", (req.body.removedTags || []).map((tag) => {
                                            return mongoose_1.Types.ObjectId.createFromHexString(tag);
                                        })]
                                },
                                (req.body.tags || []).map((tag) => {
                                    return mongoose_1.Types.ObjectId.createFromHexString(tag);
                                })
                            ]
                        },
                        assistFolderId: findPost.assistFolderId
                    }
                }
            ] });
        if (!updatedPost) {
            if (attachments.length) {
                await (0, cloudinary_1.destroyResources)({
                    public_ids: attachments.map(a => a.public_id)
                });
            }
            throw new error_response_1.BadRequest("Fail To Publish The Post");
        }
        return (0, success_response_1.successResponse)({ res });
    };
    getAllPosts = async (req, res) => {
        let { page, size } = req.query;
        const posts = await this.postModel.paginate({
            filter: { $or: (0, exports.postAvailability)(req) }, page, size, options: {
                populate: [{ path: "comments", match: { commentId: { $exists: false }, freezedAt: { $exists: false } },
                        populate: [{ path: "reply", match: { commentId: { $exists: false }, freezedAt: { $exists: false } },
                                populate: [{ path: "reply", match: { commentId: { $exists: false }, freezedAt: { $exists: false } } }]
                            }]
                    }]
            }
        });
        if (!posts) {
            throw new error_response_1.BadRequest("Post Not Exist");
        }
        return (0, success_response_1.successResponse)({ res, data: { posts } });
    };
    likePost = async (req, res) => {
        const { postId } = req.params;
        const { action } = req.query;
        let update = {
            $addToSet: { likes: req.user?._id }
        };
        if (action === post_1.LikeActionEnum.unlike) {
            update = { $pull: { likes: req.user?._id } };
        }
        const post = await this.postModel.findOneAndUpdate({
            filter: { _id: postId, $or: (0, exports.postAvailability)(req) }, update
        });
        if (!post) {
            throw new error_response_1.BadRequest("Post Not Exist");
        }
        if (action !== post_1.LikeActionEnum.unlike) {
            (0, gateway_1.getIo)().to(gateway_1.connectedSockets.get(post.createdBy.toString())).emit("likePost", { postId, userId: req.user?._id });
        }
        return (0, success_response_1.successResponse)({ res });
    };
    freezePost = async (req, res) => {
        const { postId } = req.params;
        if (!req.user?._id) {
            throw new error_response_1.Forbidden("Not Authorized User");
        }
        const post = await this.postModel.updateOne({ filter: {
                _id: postId,
                createdBy: req.user._id,
                freezedAt: { $exists: false },
            }, update: {
                freezedAt: new Date(),
                freezedBy: req.user._id,
                $unset: {
                    restoreAt: 1,
                    restoredBy: 1,
                },
            }
        });
        if (!post.matchedCount) {
            throw new error_response_1.NotFound("Post Not Found Or You Are Not The Owner");
        }
        return (0, success_response_1.successResponse)({ res });
    };
    hardDeletePost = async (req, res) => {
        const { postId } = req.params;
        if (!req.user?._id)
            throw new error_response_1.Forbidden("Not Authorized User");
        const result = await this.postModel.deleteOne({ filter: {
                _id: postId,
                createdBy: req.user._id,
                freezedAt: { $exists: true }
            } });
        if (!result.deletedCount) {
            throw new error_response_1.NotFound("Post Not Found Or You Are Not The Owner");
        }
        await this.commentModel.deleteMany({ filter: { postId } });
        return (0, success_response_1.successResponse)({ res });
    };
}
exports.postService = new PostService();
