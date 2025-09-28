"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockEnum = exports.FriendRequestEnum = void 0;
const user_1 = __importStar(require("../../DB/models/user"));
const Token_1 = require("../../utils/Security/Token");
const repository_1 = require("../../DB/repository");
const cloudinary_1 = require("../../utils/Multer/cloudinary");
const success_response_1 = require("../../utils/Response/success.response");
const error_response_1 = require("../../utils/Response/error.response");
const Encryption_1 = require("../../utils/Security/Encryption");
const Hash_1 = require("../../utils/Security/Hash");
const models_1 = require("../../DB/models");
var FriendRequestEnum;
(function (FriendRequestEnum) {
    FriendRequestEnum["send"] = "send";
    FriendRequestEnum["delete"] = "delete";
})(FriendRequestEnum || (exports.FriendRequestEnum = FriendRequestEnum = {}));
var BlockEnum;
(function (BlockEnum) {
    BlockEnum["block"] = "block";
    BlockEnum["unblock"] = "unblock";
})(BlockEnum || (exports.BlockEnum = BlockEnum = {}));
class UserServices {
    userModel = new repository_1.UserReposirotry(user_1.default);
    postModel = new repository_1.PostRepository(models_1.PostModel);
    chatModel = new repository_1.ChatRepository(models_1.ChatModel);
    friendRequestModel = new repository_1.FriendRequestRepository(models_1.FriendRequestModel);
    constructor() { }
    profile = async (req, res) => {
        const profile = await this.userModel.findOne({ filter: { _id: req.user?._id }, options: {
                populate: [{ path: "friends", select: "firstName lastName email gender profileImage phone" }]
            } });
        if (!profile) {
            throw new error_response_1.NotFound("User Not Found");
        }
        const group = await this.chatModel.find({
            filter: { particpants: { $in: req.user?._id }, group: { $exists: true } }
        });
        return (0, success_response_1.successResponse)({ res, data: { user: profile, group } });
    };
    dashboard = async (req, res) => {
        const results = await Promise.allSettled([
            this.userModel.find({ filter: {} }),
            this.postModel.find({ filter: {} })
        ]);
        return (0, success_response_1.successResponse)({ res, data: { results } });
    };
    changeRole = async (req, res) => {
        const { userId } = req.params;
        const { role } = req.body;
        const denyRoles = [role, user_1.roleEnum.superAdmin];
        if (req.user?.role === user_1.roleEnum.admin) {
            denyRoles.push(user_1.roleEnum.admin);
        }
        const user = await this.userModel.findOneAndUpdate({ filter: {
                _id: userId, role: { $nin: denyRoles }
            }, update: { role } });
        if (!user) {
            throw new error_response_1.NotFound("User Not Found");
        }
        return (0, success_response_1.successResponse)({ res });
    };
    logout = async (req, res) => {
        let statusCode = 200;
        const { flag } = req.body;
        const update = {};
        switch (flag) {
            case Token_1.logoutEnum.signoutFromAll:
                update.changeCredentialsTime = new Date();
                break;
            default:
                await (0, Token_1.createRevokeToken)(req.decoded);
                statusCode = 201;
                break;
        }
        await this.userModel.updateOne({ filter: { _id: req.decoded?._id }, update });
        return (0, success_response_1.successResponse)({ res, statusCode });
    };
    refreshToken = async (req, res) => {
        const Tokens = await (0, Token_1.CreateLoginCredentials)(req.user);
        await (0, Token_1.createRevokeToken)(req.decoded);
        return (0, success_response_1.successResponse)({ res, data: { Tokens } });
    };
    profileImage = async (req, res) => {
        const oldUser = await this.userModel.findOne({ filter: { _id: req.user?._id } });
        if (oldUser?.profileImage?.public_id) {
            await (0, cloudinary_1.destroyFile)({ public_id: oldUser.profileImage.public_id });
        }
        const { secure_url, public_id } = await (0, cloudinary_1.uploadFile)({
            file: req.file,
            path: `Users/${req.user?._id}/Profile`,
        });
        await this.userModel.findOneAndUpdate({
            filter: { _id: req.user?._id },
            update: { profileImage: { secure_url, public_id } },
        });
        return (0, success_response_1.successResponse)({ res, statusCode: 201, message: "Profile Picture Uploaded" });
    };
    coverImage = async (req, res) => {
        const { secure_url, public_id } = await (0, cloudinary_1.uploadFile)({
            file: req.file,
            path: `Users/${req.user?._id}/Cover`,
        });
        const user = await this.userModel.findOneAndUpdate({
            filter: { _id: req.user?._id },
            update: { coverImages: { secure_url, public_id } },
        });
        if (user?.coverImages && "public_id" in user.coverImages) {
            await (0, cloudinary_1.destroyFile)({
                public_id: user.coverImages.public_id,
            });
        }
        return (0, success_response_1.successResponse)({ res, statusCode: 201, message: "Cover Image Uploaded" });
    };
    freezeAccount = async (req, res) => {
        const { userId } = req.params;
        if (userId && req.user?.role !== user_1.roleEnum.admin) {
            throw new error_response_1.Forbidden("Not Authorized User");
        }
        const user = await this.userModel.updateOne({
            filter: { _id: userId || req.user?._id, freezeAt: { $exists: false } },
            update: {
                freezeAt: new Date(),
                freezeBy: req.user?._id,
                changeCredentialsTime: new Date(),
                $unset: {
                    restoreAt: 1,
                    restoreBy: 1
                }
            }
        });
        if (!user.matchedCount) {
            throw new error_response_1.NotFound("User Not Found Or Fail To Delete");
        }
        return (0, success_response_1.successResponse)({ res });
    };
    restoreAccount = async (req, res) => {
        const { userId } = req.params;
        const user = await this.userModel.updateOne({
            filter: { _id: userId, freezeBy: { $ne: userId } },
            update: {
                restoreAt: new Date(),
                restoreBy: req.user?._id,
                $unset: {
                    freezeAt: 1,
                    freezeBy: 1
                }
            }
        });
        if (!user.matchedCount) {
            throw new error_response_1.NotFound("User Not Found Or Fail To Restore");
        }
        return (0, success_response_1.successResponse)({ res });
    };
    hardDelete = async (req, res) => {
        const { userId } = req.params;
        const user = await this.userModel.deleteOne({
            filter: { _id: userId, freezeAt: { $exists: true } }
        });
        if (!user.deletedCount) {
            throw new error_response_1.NotFound("User Not Found Or Fail To Hard Delelte");
        }
        return (0, success_response_1.successResponse)({ res });
    };
    updateBasicInfo = async (req, res) => {
        if (await this.userModel.findOne({ filter: { _id: req.user?._id, freezeAt: { $exists: true } } })) {
            throw new error_response_1.NotFound("User Not Found");
        }
        if (req.body.phone) {
            req.body.phone = (0, Encryption_1.generateEncryption)({ plaintext: req.body.phone });
        }
        await this.userModel.updateOne({ filter: { _id: req.user?._id }, update: { ...req.body } });
        return (0, success_response_1.successResponse)({ res, message: "User Updated Successfully" });
    };
    updatePassword = async (req, res) => {
        const { oldPassword, newPassword } = req.body;
        if (await this.userModel.findOne({ filter: { _id: req.user?._id, freezeAt: { $exists: true } } })) {
            throw new error_response_1.NotFound("User Not Found");
        }
        if (!req.user?.password) {
            throw new error_response_1.BadRequest("User Data Not Exist");
        }
        const unHashPassword = await (0, Hash_1.compareHash)({ plaintext: oldPassword, value: req.user?.password });
        if (!unHashPassword) {
            throw new error_response_1.BadRequest("Invalid Old Password");
        }
        const newHash = await (0, Hash_1.generateHash)({ plaintext: newPassword });
        await this.userModel.updateOne({ filter: { _id: req.user?._id }, update: { password: newHash } });
        return (0, success_response_1.successResponse)({ res, message: "Password Updated Successfully" });
    };
    updateEmail = async (req, res) => {
        const user = await this.userModel.findOne({ filter: { resetEmail: { $exists: true } } });
        if (!user) {
            throw new error_response_1.BadRequest("Please Confirm Email OTP");
        }
        await this.userModel.updateOne({ filter: { _id: req.user?._id }, update: {
                $set: { email: user.tempEmail },
                $unset: { tempEmail: 0, resetEmail: 0 }
            } });
        return (0, success_response_1.successResponse)({ res, message: "Email Updated Successfully" });
    };
    block = async (req, res) => {
        const { userId } = req.params;
        const { type } = req.body;
        if (req.user?._id.toString() === userId.toString()) {
            throw new error_response_1.BadRequest("You cannot Block yourself");
        }
        const user = await this.userModel.findOne({ filter: { _id: userId } });
        if (!user) {
            throw new error_response_1.NotFound("User Not Found");
        }
        if (user.block?.includes(req.user?._id)) {
            throw new error_response_1.BadRequest("This user has blocked you,cannot Block Him");
        }
        switch (type) {
            case BlockEnum.unblock:
                const unblock = await this.userModel.updateOne({
                    filter: { _id: { $in: req.user?._id } },
                    update: { $pull: { block: userId }
                    }
                });
                if (!unblock) {
                    throw new error_response_1.NotFound("Fail To UnBlock");
                }
                (0, success_response_1.successResponse)({ res, message: "UnBlock Successfully" });
                break;
            default:
            case BlockEnum.block:
                const me = await this.userModel.findOne({ filter: { _id: req.user?._id } });
                if (me?.block?.includes(userId)) {
                    throw new error_response_1.BadRequest("You have blocked this user, cannot Block Him Again");
                }
                const block = await this.userModel.updateOne({
                    filter: { _id: req.user?._id },
                    update: { $push: { block: userId }
                    }
                });
                if (!block) {
                    throw new error_response_1.NotFound("Fail To Block");
                }
                (0, success_response_1.successResponse)({ res, message: "Block Successfully" });
                break;
        }
    };
    sendFriendRequest = async (req, res) => {
        const { userId } = req.params;
        const { type } = req.body;
        if (req.user?._id.toString() === userId.toString()) {
            throw new error_response_1.BadRequest("You cannot send a friend request to yourself");
        }
        const user = await this.userModel.findOne({ filter: { _id: userId } });
        if (!user) {
            throw new error_response_1.NotFound("User Not Found");
        }
        if (user.block?.includes(req.user?._id)) {
            throw new error_response_1.BadRequest("This user has blocked you, cannot send friend request");
        }
        const me = await this.userModel.findOne({ filter: { _id: req.user?._id } });
        if (me?.block?.includes(userId)) {
            throw new error_response_1.BadRequest("You have blocked this user, cannot send friend request");
        }
        switch (type) {
            case FriendRequestEnum.delete:
                const findRequest = await this.friendRequestModel.deleteOne({
                    filter: {
                        createdBy: { $in: [req.user?._id, userId] },
                        sentTo: { $in: [req.user?._id, userId] },
                    }
                });
                if (!findRequest) {
                    throw new error_response_1.NotFound("Fail To Delete Friend Request");
                }
                (0, success_response_1.successResponse)({ res, message: "Friend Request Deleted Successfully" });
                break;
            default:
            case FriendRequestEnum.send:
                const checkRequest = await this.friendRequestModel.findOne({
                    filter: {
                        createdBy: { $in: [req.user?._id, userId] },
                        sentTo: { $in: [req.user?._id, userId] },
                    }
                });
                if (checkRequest) {
                    throw new error_response_1.conflict("Friend Request Already Exist");
                }
                const [friendRequest] = await this.friendRequestModel.create({ data: [{
                            createdBy: req.user?._id, sentTo: userId
                        }] }) || [];
                if (!friendRequest) {
                    throw new error_response_1.BadRequest("Fail To Send Friend Request");
                }
                break;
        }
        return (0, success_response_1.successResponse)({ res, statusCode: 201, message: "Friend Request Sent Successfully" });
    };
    acceptFriendRequest = async (req, res) => {
        const { requestId } = req.params;
        const friendRequest = await this.friendRequestModel.findOneAndUpdate({
            filter: {
                _id: requestId, sentTo: req.user?._id, acceptedAt: { $exists: false }
            }, update: { acceptedAt: new Date() }
        });
        if (!friendRequest) {
            throw new error_response_1.conflict("Fail To Accept Friend Request");
        }
        await Promise.all([
            await this.userModel.updateOne({ filter: { _id: friendRequest.createdBy },
                update: { $addToSet: { friends: friendRequest.sentTo } } }),
            await this.userModel.updateOne({ filter: { _id: friendRequest.sentTo },
                update: { $addToSet: { friends: friendRequest.createdBy } } })
        ]);
        return (0, success_response_1.successResponse)({ res, message: "Friend Request Accepted Successfully" });
    };
    unFriend = async (req, res) => {
        const { userId } = req.params;
        if (!req.user?._id) {
            throw new error_response_1.BadRequest("Unauthorized request");
        }
        const isFriend = await this.userModel.findOne({ filter: {
                friends: userId,
            } });
        if (!isFriend) {
            throw new error_response_1.conflict("This user is not in your friends list");
        }
        await Promise.all([
            this.userModel.updateOne({
                filter: { _id: req.user._id },
                update: { $pull: { friends: userId } }
            }),
            this.userModel.updateOne({
                filter: { _id: userId },
                update: { $pull: { friends: req.user._id } }
            }),
        ]);
        return (0, success_response_1.successResponse)({ res, message: "Unfriend Successfully" });
    };
}
exports.default = new UserServices();
