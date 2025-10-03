"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = void 0;
const success_response_1 = require("../../utils/Response/success.response");
const repository_1 = require("../../DB/repository");
const post_1 = require("../../DB/models/post");
const user_1 = require("../../DB/models/user");
const error_response_1 = require("../../utils/Response/error.response");
const uuid_1 = require("uuid");
const cloudinary_1 = require("../../utils/Multer/cloudinary");
const post_2 = require("../post");
const models_1 = require("../../DB/models");
class CommentService {
    postModel = new repository_1.PostRepository(post_1.PostModel);
    userModel = new repository_1.UserReposirotry(user_1.UserModel);
    commentModel = new repository_1.CommentRepository(models_1.CommentModel);
    constructor() { }
    createComment = async (req, res) => {
        const { postId } = req.params;
        const post = await this.postModel.findOne({ filter: {
                _id: postId, allowComments: post_1.AllowCommentsEnum.Allow,
                $or: (0, post_2.postAvailability)(req.user)
            } });
        if (!post) {
            throw new error_response_1.NotFound("Comment Not Found");
        }
        if (req.body.tags?.length && (await this.userModel.find({
            filter: { _id: { $in: req.body.tags, $ne: req.user?._id } }
        })).length !== req.body.tags.length) {
            throw new error_response_1.NotFound("Sorry Some Users Taged Not Exist");
        }
        let attachments = [];
        if (req.files?.length) {
            attachments = await (0, cloudinary_1.uploadFiles)({
                files: req.files,
                path: `users/${post.createdBy}/post/${post.assistFolderId}`
            });
        }
        const [comment] = await this.commentModel.create({ data: [{
                    ...req.body, attachments, postId, createdBy: req.user?._id
                }] }) || [];
        if (!comment) {
            if (attachments.length) {
                await (0, cloudinary_1.destroyResources)({
                    public_ids: attachments.map(a => a.public_id)
                });
            }
            throw new error_response_1.BadRequest("Fail To Publish The Comment");
        }
        return (0, success_response_1.successResponse)({ res, statusCode: 201 });
    };
    replyOnComment = async (req, res) => {
        const { postId, commentId } = req.params;
        const comment = await this.commentModel.findOne({ filter: {
                _id: commentId, postId
            }, options: {
                populate: [{ path: "postId", match: {
                            allowComments: post_1.AllowCommentsEnum.Allow, $or: (0, post_2.postAvailability)(req.user)
                        } }]
            }
        });
        if (!comment?.postId) {
            throw new error_response_1.NotFound("Comment Not Found");
        }
        if (req.body.tags?.length && (await this.userModel.find({
            filter: { _id: { $in: req.body.tags, $ne: req.user?._id } }
        })).length !== req.body.tags.length) {
            throw new error_response_1.NotFound("Sorry Some Users Taged Not Exist");
        }
        let attachments = [];
        if (req.files?.length) {
            const post = comment.postId;
            attachments = await (0, cloudinary_1.uploadFiles)({
                files: req.files,
                path: `users/${post.createdBy}/post/${post.assistFolderId}`
            });
        }
        const [reply] = await this.commentModel.create({ data: [{
                    ...req.body, attachments, commentId, postId, createdBy: req.user?._id
                }] }) || [];
        if (!reply) {
            if (attachments.length) {
                await (0, cloudinary_1.destroyResources)({
                    public_ids: attachments.map(a => a.public_id)
                });
            }
            throw new error_response_1.BadRequest("Fail To Publish The Comment");
        }
        return (0, success_response_1.successResponse)({ res, statusCode: 201 });
    };
    updateComment = async (req, res) => {
        const { postId, commentId } = req.params;
        const findComment = await this.commentModel.findOne({ filter: {
                _id: commentId,
                postId: postId,
                createdBy: req.user?._id
            }
        });
        if (!findComment) {
            throw new error_response_1.NotFound("Comment Not Found");
        }
        let attachments = [];
        let assistFolderId = (0, uuid_1.v4)();
        if (req.files?.length) {
            attachments = await (0, cloudinary_1.uploadFiles)({
                files: req.files,
                path: `users/${req.user?._id}/comments/${assistFolderId}`
            });
        }
        const updatedComment = await this.commentModel.updateOne({
            filter: { _id: findComment._id },
            update: [
                {
                    $set: {
                        content: req.body.content ?? findComment.content,
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
                    }
                }
            ]
        });
        if (!updatedComment) {
            if (attachments.length) {
                await (0, cloudinary_1.destroyResources)({
                    public_ids: attachments.map((a) => a.public_id)
                });
            }
            throw new error_response_1.BadRequest("Fail To Update Comment");
        }
        return (0, success_response_1.successResponse)({ res });
    };
    getAllComments = async (req, res) => {
        const { postId } = req.params;
        let { page, size } = req.query;
        const comments = await this.commentModel.paginate({
            filter: { postId },
            page,
            size
        });
        if (!comments) {
            throw new error_response_1.BadRequest("Comments Not Exist");
        }
        return (0, success_response_1.successResponse)({ res, data: { comments } });
    };
    likeComment = async (req, res) => {
        const { postId, commentId } = req.params;
        const { action } = req.query;
        let update = {
            $addToSet: { likes: req.user?._id }
        };
        if (action === post_1.LikeActionEnum.unlike) {
            update = { $pull: { likes: req.user?._id } };
        }
        const comment = await this.commentModel.findOneAndUpdate({
            filter: { _id: commentId, postId },
            update
        });
        if (!comment) {
            throw new error_response_1.BadRequest("Comment Not Exist");
        }
        return (0, success_response_1.successResponse)({ res });
    };
    freezeComment = async (req, res) => {
        const { postId, commentId } = req.params;
        if (!req.user?._id) {
            throw new error_response_1.Forbidden("Not Authorized User");
        }
        const comment = await this.commentModel.updateOne({ filter: {
                _id: commentId, postId,
                createdBy: req.user._id,
                freezedAt: { $exists: false },
            }, update: {
                freezedAt: new Date(),
                freezedBy: req.user._id,
                $unset: {
                    restoreAt: 1,
                    restoredBy: 1,
                },
            } });
        if (!comment.matchedCount) {
            throw new error_response_1.NotFound("Comment Not Found Or You Are Not The Owner");
        }
        return (0, success_response_1.successResponse)({ res });
    };
    hardDeleteComment = async (req, res) => {
        const { commentId } = req.params;
        if (!req.user?._id)
            throw new error_response_1.Forbidden("Not Authorized User");
        const result = await this.commentModel.deleteOne({ filter: {
                _id: commentId,
                createdBy: req.user._id,
                freezedAt: { $exists: true }
            } });
        if (!result.deletedCount) {
            throw new error_response_1.NotFound("Comment Not Found Or You Are Not The Owner");
        }
        return (0, success_response_1.successResponse)({ res });
    };
}
exports.commentService = new CommentService();
