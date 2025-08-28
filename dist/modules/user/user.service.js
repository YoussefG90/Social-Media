"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../../DB/models/user"));
const Token_1 = require("../../utils/Security/Token");
const User_Repository_1 = require("../../DB/repository/User.Repository");
const Token_Repository_1 = require("../../DB/repository/Token.Repository");
const token_1 = require("../../DB/models/token");
class UserServices {
    userModel = new User_Repository_1.UserReposirotry(user_1.default);
    tokenModel = new Token_Repository_1.TokenRepository(token_1.TokenModel);
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
}
exports.default = new UserServices();
