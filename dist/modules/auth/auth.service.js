"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateotp = void 0;
const user_1 = __importDefault(require("../../DB/models/user"));
const error_response_1 = require("../../utils/Response/error.response");
const Hash_1 = require("../../utils/Security/Hash");
const Encryption_1 = require("../../utils/Security/Encryption");
const email_1 = require("../../utils/Events/email");
const Token_1 = require("../../utils/Security/Token/Token");
const User_Repository_1 = require("../../DB/repository/User.Repository");
const generateotp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateotp = generateotp;
class AuthenticationService {
    userModel = new User_Repository_1.UserReposirotry(user_1.default);
    constructor() { }
    signup = async (req, res) => {
        const otp = (0, exports.generateotp)();
        const { firstName, lastName, email, password, phone, gender, age } = req.body;
        const checkuser = await this.userModel.findOne({ filter: { email } });
        if (checkuser) {
            throw new error_response_1.conflict("Email Exist", 409);
        }
        const hashPassword = await (0, Hash_1.generateHash)({ plaintext: password });
        const encryptOTP = await (0, Hash_1.generateHash)({ plaintext: otp });
        const encryptePhone = await (0, Encryption_1.generateEncryption)({ plaintext: phone });
        const user = await this.userModel.createUser({ data: [{ firstName, lastName, email,
                    password: hashPassword, phone: encryptePhone, age, gender, emailOTP: encryptOTP,
                    emailOTPExpires: new Date(Date.now() + 3 * 60 * 1000) }] });
        email_1.emailEvent.emit("Confirm Email", { to: email, otp });
        res.status(201).json({ message: "Account Created Check Your Email To Verify", user });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this.userModel.findOne({ filter: { email, deletedAt: { $exists: false } } });
        if (!user) {
            throw new error_response_1.NotFound("User Not Found");
        }
        const checkOtp = await this.userModel.findOne({ filter: { confirmEmail: true } });
        if (!checkOtp) {
            throw new error_response_1.BadRequest("Email Not Confirmed");
        }
        const checkpassword = await (0, Hash_1.compareHash)({ plaintext: password, value: user.password });
        if (!checkpassword) {
            throw new error_response_1.BadRequest("InVaild Login Data");
        }
        const Tokens = await (0, Token_1.generateNewTokens)({ user });
        return res.status(200).json({ message: "Done", Tokens });
    };
}
exports.default = new AuthenticationService();
