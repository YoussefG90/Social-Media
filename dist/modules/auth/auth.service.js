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
exports.generateotp = void 0;
const user_1 = __importStar(require("../../DB/models/user"));
const error_response_1 = require("../../utils/Response/error.response");
const Hash_1 = require("../../utils/Security/Hash");
const Encryption_1 = require("../../utils/Security/Encryption");
const Token_1 = require("../../utils/Security/Token");
const User_Repository_1 = require("../../DB/repository/User.Repository");
const google_auth_library_1 = require("google-auth-library");
const success_response_1 = require("../../utils/Response/success.response");
const email_1 = require("../../utils/Events/email");
const generateotp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateotp = generateotp;
class AuthenticationService {
    userModel = new User_Repository_1.UserReposirotry(user_1.default);
    constructor() { }
    async verifyGmailAccount(idToken) {
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.WEB_CLIENT_ID?.split(",") || [],
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new error_response_1.BadRequest("Fail To Verify Google Account");
        }
        return payload;
    }
    loginWithGmail = async (req, res) => {
        const { idToken } = req.body;
        const { email } = await this.verifyGmailAccount(idToken);
        const user = await this.userModel.findOne({ filter: { email, provider: user_1.providerEnum.Google } });
        if (!user) {
            throw new error_response_1.NotFound("User Not Found Or Registered From Another Provider");
        }
        const Tokens = await (0, Token_1.CreateLoginCredentials)(user);
        return (0, success_response_1.successResponse)({ res, data: { Tokens } });
    };
    signupWithGmail = async (req, res) => {
        const { idToken } = req.body;
        const { email, given_name, family_name } = await this.verifyGmailAccount(idToken);
        const user = await this.userModel.findOne({ filter: { email } });
        if (user) {
            if (user.provider === user_1.providerEnum.Google) {
                return await this.loginWithGmail(req, res);
            }
            throw new error_response_1.conflict("Email Exist");
        }
        const [newuser] = await this.userModel.create({ data: [{
                    firstName: given_name, lastName: family_name,
                    email: email
                }] }) || [];
        if (!newuser) {
            throw new error_response_1.BadRequest("Fail To SignUp With Gmail Please Try Again Later");
        }
        const Tokens = await (0, Token_1.CreateLoginCredentials)(newuser);
        return (0, success_response_1.successResponse)({ res, statusCode: 201, data: { Tokens } });
    };
    signup = async (req, res) => {
        const otp = (0, exports.generateotp)();
        const { firstName, lastName, email, password, phone, gender, age } = req.body;
        const checkuser = await this.userModel.findOne({ filter: { email } });
        if (checkuser) {
            throw new error_response_1.conflict("Email Exist", 409);
        }
        const encryptePhone = await (0, Encryption_1.generateEncryption)({ plaintext: phone });
        await this.userModel.createUser({ data: [{ firstName, lastName, email,
                    password, phone: encryptePhone, age, gender, emailOTP: otp,
                    emailOTPExpires: new Date(Date.now() + 3 * 60 * 1000) }] });
        return (0, success_response_1.successResponse)({ res, statusCode: 201, message: "Account Created Check Your Email To Verify" });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this.userModel.findOne({ filter: { email, deletedAt: { $exists: false },
                provider: user_1.providerEnum.System, freezeAt: { $exists: false } } });
        if (!user) {
            throw new error_response_1.NotFound("User Not Found");
        }
        if (!user.confirmEmail) {
            throw new error_response_1.BadRequest("Email Not Confirmed");
        }
        const checkpassword = await (0, Hash_1.compareHash)({ plaintext: password, value: user.password });
        if (!checkpassword) {
            throw new error_response_1.BadRequest("InVaild Login Data");
        }
        if (!user.twoFactorEnabled) {
            const Tokens = await (0, Token_1.CreateLoginCredentials)(user);
            return (0, success_response_1.successResponse)({ res, data: { Tokens } });
        }
        const loginOtp = (0, exports.generateotp)();
        const hashLoginOtp = await (0, Hash_1.generateHash)({ plaintext: loginOtp });
        await this.userModel.updateOne({ filter: { email }, update: {
                $set: { twoFactorOTP: hashLoginOtp,
                    twoFactorExpires: new Date(Date.now() + 3 * 60 * 1000) }
            } });
        email_1.emailEvent.emit("Two Factor Authentication", { to: email, otp: loginOtp });
        return (0, success_response_1.successResponse)({ res, message: "Login OTP Sent Successfully" });
    };
    loginWithTwoFactorAuthentication = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findOne({ filter: { email } });
        if (!user) {
            throw new error_response_1.NotFound("User Not Found");
        }
        if (user.twoFactorExpires.getTime() < Date.now()) {
            throw new error_response_1.Unauthorized("OTP Expired");
        }
        const unHashOtp = await (0, Hash_1.compareHash)({ plaintext: otp, value: user.twoFactorOTP });
        if (!unHashOtp) {
            throw new error_response_1.BadRequest("InValid OTP");
        }
        await this.userModel.updateOne({ filter: { email },
            update: { $unset: { twoFactorOTP: 0, twoFactorExpires: 0 } } });
        const Tokens = await (0, Token_1.CreateLoginCredentials)(user);
        return (0, success_response_1.successResponse)({ res, data: { Tokens } });
    };
    forgetPassword = async (req, res) => {
        const { email, newPassword } = req.body;
        const user = await this.userModel.findOne({ filter: { email, deletedAt: { $exists: false },
                provider: user_1.providerEnum.System, confirmEmail: true } });
        if (!user) {
            throw new error_response_1.NotFound("User Not Found");
        }
        const checkConfirmOtp = await this.userModel.findOne({ filter: { resetPassword: true } });
        if (!checkConfirmOtp) {
            throw new error_response_1.BadRequest("Please Confirm Rest OTP");
        }
        const hashPassword = await (0, Hash_1.generateHash)({ plaintext: newPassword });
        await this.userModel.updateOne({ filter: { email }, update: { password: hashPassword } });
        return (0, success_response_1.successResponse)({ res, statusCode: 201, message: "Password Rest Successfully" });
    };
}
exports.default = new AuthenticationService();
