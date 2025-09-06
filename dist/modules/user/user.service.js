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
const user_1 = __importStar(require("../../DB/models/user"));
const Token_1 = require("../../utils/Security/Token");
const User_Repository_1 = require("../../DB/repository/User.Repository");
const cloudinary_1 = require("../../utils/Multer/cloudinary");
const success_response_1 = require("../../utils/Response/success.response");
const error_response_1 = require("../../utils/Response/error.response");
class UserServices {
    userModel = new User_Repository_1.UserReposirotry(user_1.default);
    constructor() { }
    profile = async (req, res) => {
        if (!req.user) {
            throw new error_response_1.Unauthorized("Missing User Details");
        }
        return (0, success_response_1.successResponse)({ res, data: { user: req.user } });
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
        const { secure_url, public_id } = await (0, cloudinary_1.uploadFile)({
            file: req.file, path: `Users/${req.user?._id}/Profile`,
        });
        const user = await this.userModel.findOneAndUpdate({
            filter: { _id: req.user?._id },
            update: { profileImage: { secure_url, public_id } },
        });
        if (user?.profileImage?.public_id) {
            await (0, cloudinary_1.destroyFile)({ public_id: user.profileImage.public_id, });
        }
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
}
exports.default = new UserServices();
