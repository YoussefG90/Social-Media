"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.twoFactorEnum = exports.flag = void 0;
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
var twoFactorEnum;
(function (twoFactorEnum) {
    twoFactorEnum["activate"] = "activate";
    twoFactorEnum["deactivate"] = "deactivate";
    twoFactorEnum["verify"] = "verify";
    twoFactorEnum["deactivateVerify"] = "deactivateVerify";
})(twoFactorEnum || (exports.twoFactorEnum = twoFactorEnum = {}));
class OTPMiddleware {
    userModel = new User_Repository_1.UserReposirotry(user_1.default);
    constructor() { }
    get = async (req, res) => {
        const { email, newEmail, type } = req.body;
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
                break;
            case flag.newEmail:
                if (newEmail === email) {
                    throw new error_response_1.conflict("Sorry Cannot Update With Same Email");
                }
                const existingUser = await this.userModel.findOne({ filter: { email: newEmail } });
                if (existingUser) {
                    throw new error_response_1.BadRequest("Email already in use");
                }
                const oldEmailOtp = (0, auth_service_1.generateotp)();
                const newEmailOtp = (0, auth_service_1.generateotp)();
                const hashOldEmailOtp = await (0, Hash_1.generateHash)({ plaintext: oldEmailOtp });
                const hashNewEmailOtp = await (0, Hash_1.generateHash)({ plaintext: newEmailOtp });
                await this.userModel.updateOne({ filter: { email },
                    update: { $set: { confirmEmail: false, emailOTP: hashOldEmailOtp, tempEmail: newEmail,
                            newEmailOTP: hashNewEmailOtp, newEmailOTPExpires: new Date(Date.now() + 3 * 60 * 1000), emailOTPExpires: new Date(Date.now() + 3 * 60 * 1000) },
                        $exists: { emailOTP: false, newEmailOTP: false } } });
                email_1.emailEvent.emit("Confirm Email", { to: email, otp: oldEmailOtp });
                email_1.emailEvent.emit("Confirm Email", { to: newEmail, otp: newEmailOtp });
                (0, success_response_1.successResponse)({ res, message: "Confirm OTP Sent Successfully To Old & New Email" });
            default:
                break;
        }
    };
    verify = async (req, res) => {
        const { email, type, otp, newEmailOtp } = req.body;
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
                break;
            case flag.newEmail:
                if (user.newEmailOTPExpires.getTime() < Date.now()) {
                    throw new error_response_1.Unauthorized("OTP Expired");
                }
                const unHashOldEmailOtp = await (0, Hash_1.compareHash)({ plaintext: otp, value: user.emailOTP });
                const unHashNewEmailOtp = await (0, Hash_1.compareHash)({ plaintext: newEmailOtp, value: user.newEmailOTP });
                console.log(unHashOldEmailOtp, unHashNewEmailOtp);
                if (!unHashOldEmailOtp || !unHashNewEmailOtp) {
                    throw new error_response_1.BadRequest("InValid OTP");
                }
                await this.userModel.updateOne({ filter: { email },
                    update: { $unset: { emailOTP: 0, emailOTPExpires: 0, newEmailOTP: 0, newEmailOTPExpires: 0 },
                        $set: { resetEmail: true, confirmEmail: true } } });
                (0, success_response_1.successResponse)({ res, message: "Change Email OTP Verfied Successfully" });
            default:
                break;
        }
    };
    twoFactor = async (req, res) => {
        const { email, type, otp } = req.body;
        const user = await this.userModel.findOne({ filter: { email } });
        if (!user) {
            throw new error_response_1.NotFound("User Not Found");
        }
        switch (type) {
            case twoFactorEnum.activate:
                const activateOtp = (0, auth_service_1.generateotp)();
                const hashActivateOtp = await (0, Hash_1.generateHash)({ plaintext: activateOtp });
                await this.userModel.updateOne({ filter: { email }, update: {
                        $set: { twoFactorOTP: hashActivateOtp,
                            twoFactorExpires: new Date(Date.now() + 3 * 60 * 1000) }
                    } });
                email_1.emailEvent.emit("Two Factor Authentication", { to: email, otp: activateOtp });
                (0, success_response_1.successResponse)({ res, message: "Activate OTP Sent Successfully" });
                break;
            case twoFactorEnum.deactivate:
                const deactivateOtp = (0, auth_service_1.generateotp)();
                const hashDeactivateOtp = await (0, Hash_1.generateHash)({ plaintext: deactivateOtp });
                await this.userModel.updateOne({ filter: { email }, update: {
                        $set: { twoFactorOTP: hashDeactivateOtp,
                            twoFactorExpires: new Date(Date.now() + 3 * 60 * 1000) }
                    } });
                email_1.emailEvent.emit("Two Factor Authentication", { to: email, otp: deactivateOtp });
                (0, success_response_1.successResponse)({ res, message: "Deactivate OTP Sent Successfully" });
                break;
            case twoFactorEnum.verify:
                if (user.twoFactorExpires.getTime() < Date.now()) {
                    throw new error_response_1.Unauthorized("OTP Expired");
                }
                const unHashOtp = await (0, Hash_1.compareHash)({ plaintext: otp, value: user.twoFactorOTP });
                if (!unHashOtp) {
                    throw new error_response_1.BadRequest("InValid OTP");
                }
                await this.userModel.updateOne({ filter: { _id: req.user?._id }, update: {
                        $set: { twoFactorEnabled: true },
                        $unset: { twoFactorOTP: 0, twoFactorExpires: 0 }
                    } });
                (0, success_response_1.successResponse)({ res, message: "Activate 2FA Successfully" });
                break;
            case twoFactorEnum.deactivateVerify:
                if (user.twoFactorExpires.getTime() < Date.now()) {
                    throw new error_response_1.Unauthorized("OTP Expired");
                }
                const unDeactivateHashOtp = await (0, Hash_1.compareHash)({ plaintext: otp, value: user.twoFactorOTP });
                if (!unDeactivateHashOtp) {
                    throw new error_response_1.BadRequest("InValid OTP");
                }
                await this.userModel.updateOne({ filter: { _id: req.user?._id }, update: {
                        $set: { twoFactorEnabled: false },
                        $unset: { twoFactorOTP: 0, twoFactorExpires: 0 }
                    } });
                (0, success_response_1.successResponse)({ res, message: "Deactivate 2FA Successfully" });
                break;
            default:
                break;
        }
    };
}
exports.default = new OTPMiddleware();
