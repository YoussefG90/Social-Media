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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.get = exports.flag = void 0;
const DBservices = __importStar(require("../DB/DBservices"));
const user_1 = __importDefault(require("../DB/models/user"));
const error_response_1 = require("../utils/Response/error.response");
const Hash_1 = require("../utils/Security/Hash");
const auth_service_1 = require("../modules/auth/auth.service");
const email_1 = require("../utils/Events/email");
var flag;
(function (flag) {
    flag["email"] = "email";
    flag["forgetPassword"] = "forgetPassword";
    flag["newEmail"] = "newEmail";
})(flag || (exports.flag = flag = {}));
const get = async (req, res) => {
    const { email, type } = req.body;
    const user = await DBservices.findOne({ model: user_1.default, filter: { email } });
    if (!user) {
        throw new error_response_1.NotFound("User Not Found");
    }
    switch (type) {
        case flag.email:
            const newOtp = (0, auth_service_1.generateotp)();
            const hashEmailOtp = await (0, Hash_1.generateHash)({ plaintext: newOtp });
            await DBservices.findOneAndUpdate({ model: user_1.default, filter: { email },
                update: { $set: { confirmEmail: false, emailOTP: hashEmailOtp, emailOTPExpires: new Date(Date.now() + 3 * 60 * 1000) },
                    $exists: { emailOTP: false } } });
            email_1.emailEvent.emit("Confirm Email", { to: email, otp: newOtp });
            res.status(200).json({ message: "New Verify OTP Sent Successfully" });
            break;
        case flag.forgetPassword:
            const newRestOtp = (0, auth_service_1.generateotp)();
            const hashRestOtp = await (0, Hash_1.generateHash)({ plaintext: newRestOtp });
            await DBservices.findOneAndUpdate({ model: user_1.default, filter: { email },
                update: { $set: { resetPassword: false, resetPasswordOTP: hashRestOtp, resetPasswordOTPExpires: new Date(Date.now() + 3 * 60 * 1000) },
                    $exists: { resetPassword: false } } });
            email_1.emailEvent.emit("Reset Password", { to: email, otp: newRestOtp });
            res.status(200).json({ message: "New Reset OTP Sent Successfully" });
        default:
            break;
    }
};
exports.get = get;
const verify = async (req, res) => {
    const { email, type, otp } = req.body;
    const user = await DBservices.findOne({ model: user_1.default, filter: { email } });
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
            await DBservices.findOneAndUpdate({ model: user_1.default, filter: { email },
                update: { $unset: { emailOTP: 0, emailOTPExpires: 0 }, $set: { confirmEmail: true } } });
            res.status(200).json({ message: "Email Verfied Successfully" });
            break;
        case flag.forgetPassword:
            if (user.resetPasswordOTPExpires.getTime() < Date.now()) {
                throw new error_response_1.Unauthorized("OTP Expired");
            }
            const unHashResetOtp = await (0, Hash_1.compareHash)({ plaintext: otp, value: user.resetPasswordOTP });
            if (!unHashResetOtp) {
                throw new error_response_1.BadRequest("InValid OTP");
            }
            await DBservices.findOneAndUpdate({ model: user_1.default, filter: { email },
                update: { $unset: { resetPasswordOTP: 0, resetPasswordOTPExpires: 0 }, $set: { resetPassword: true } } });
            res.status(200).json({ message: "Reset OTP Verfied Successfully" });
        default:
            break;
    }
};
exports.verify = verify;
