"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flag = void 0;
const user_1 = __importDefault(require("../DB/models/user"));
const error_response_1 = require("../utils/Response/error.response");
const Hash_1 = require("../utils/Security/Hash");
const auth_service_1 = require("../modules/auth/auth.service");
const email_1 = require("../utils/Events/email");
const User_Repository_1 = require("../DB/repository/User.Repository");
const success_response_1 = require("../utils/Response/success.response");
var flag;
(function (flag) {
    flag["email"] = "email";
    flag["forgetPassword"] = "forgetPassword";
    flag["newEmail"] = "newEmail";
})(flag || (exports.flag = flag = {}));
class OTPMiddleware {
    userModel = new User_Repository_1.UserReposirotry(user_1.default);
    constructor() { }
    get = async (req, res) => {
        const { email, type } = req.body;
        const user = await this.userModel.findOne({ filter: { email } });
        if (!user) {
            throw new error_response_1.NotFound("User Not Found");
        }
        switch (type) {
            case flag.email:
                const newOtp = (0, auth_service_1.generateotp)();
                const hashEmailOtp = await (0, Hash_1.generateHash)({ plaintext: newOtp });
                await this.userModel.updateOne({ filter: { email },
                    update: { $set: { confirmEmail: false, emailOTP: hashEmailOtp, emailOTPExpires: new Date(Date.now() + 3 * 60 * 1000) },
                        $exists: { emailOTP: false } } });
                email_1.emailEvent.emit("Confirm Email", { to: email, otp: newOtp });
                (0, success_response_1.successResponse)({ res, message: "New Verify OTP Sent Successfully" });
                break;
            case flag.forgetPassword:
                const newRestOtp = (0, auth_service_1.generateotp)();
                const hashRestOtp = await (0, Hash_1.generateHash)({ plaintext: newRestOtp });
                await this.userModel.updateOne({ filter: { email },
                    update: { $set: { resetPassword: false, resetPasswordOTP: hashRestOtp, resetPasswordOTPExpires: new Date(Date.now() + 3 * 60 * 1000) },
                        $exists: { resetPassword: false } } });
                email_1.emailEvent.emit("Reset Password", { to: email, otp: newRestOtp });
                (0, success_response_1.successResponse)({ res, message: "New Reset OTP Sent Successfully" });
            default:
                break;
        }
    };
    verify = async (req, res) => {
        const { email, type, otp } = req.body;
        const user = await this.userModel.findOne({ filter: { email } });
        if (!user) {
            throw new error_response_1.NotFound("User Not Found");
        }
        switch (type) {
            case flag.email:
                if (user.emailOTPExpires.getTime() < Date.now()) {
                    throw new error_response_1.Unauthorized("OTP Expired");
                }
                const unHashOtp = await (0, Hash_1.compareHash)({ plaintext: otp, value: user.emailOTP });
                if (!unHashOtp) {
                    throw new error_response_1.BadRequest("InValid OTP");
                }
                await this.userModel.updateOne({ filter: { email },
                    update: { $unset: { emailOTP: 0, emailOTPExpires: 0 }, $set: { confirmEmail: true } } });
                (0, success_response_1.successResponse)({ res, message: "Email Verfied Successfully" });
                break;
            case flag.forgetPassword:
                if (user.resetPasswordOTPExpires.getTime() < Date.now()) {
                    throw new error_response_1.Unauthorized("OTP Expired");
                }
                const unHashResetOtp = await (0, Hash_1.compareHash)({ plaintext: otp, value: user.resetPasswordOTP });
                if (!unHashResetOtp) {
                    throw new error_response_1.BadRequest("InValid OTP");
                }
                await this.userModel.updateOne({ filter: { email },
                    update: { $unset: { resetPasswordOTP: 0, resetPasswordOTPExpires: 0 }, $set: { resetPassword: true } } });
                (0, success_response_1.successResponse)({ res, message: "Reset OTP Verfied Successfully" });
            default:
                break;
        }
    };
}
exports.default = new OTPMiddleware();
