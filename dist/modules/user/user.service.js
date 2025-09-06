"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../../DB/models/user"));
const Token_1 = require("../../utils/Security/Token");
const User_Repository_1 = require("../../DB/repository/User.Repository");
const cloudinary_1 = require("../../utils/Multer/cloudinary");
class UserServices {
    userModel = new User_Repository_1.UserReposirotry(user_1.default);
    constructor() { }
    profile = async (req, res) => {
        return res.json({ message: "Done", data: { user: req.user, decoded: req.decoded } });
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
        return res.status(statusCode).json({ message: "Done" });
    };
    refreshToken = async (req, res) => {
        const credentials = await (0, Token_1.CreateLoginCredentials)(req.user);
        await (0, Token_1.createRevokeToken)(req.decoded);
        return res.status(201).json({ message: "Done", data: { credentials } });
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
        return res.status(201).json({ message: "Profile Picture Uploaded" });
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
        return res.status(201).json({ message: "Cover Image Uploaded" });
    };
}
exports.default = new UserServices();
