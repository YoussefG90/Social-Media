"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twoFactorAuthentication = exports.twoFactorAuthenticationLogin = exports.forgetPassword = exports.signupWithGmail = exports.verfiyOtp = exports.getOtp = exports.Signup = exports.login = void 0;
const zod_1 = require("zod");
const validation_middleware_1 = require("../../middleware/validation.middleware");
exports.login = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.genralFields.email,
        password: validation_middleware_1.genralFields.password
    })
};
exports.Signup = {
    body: exports.login.body.extend({
        firstName: validation_middleware_1.genralFields.name,
        lastName: validation_middleware_1.genralFields.name,
        confirmPassword: zod_1.z.string(),
        phone: validation_middleware_1.genralFields.phone,
        gender: validation_middleware_1.genralFields.gender,
        age: validation_middleware_1.genralFields.age
    }).refine((data) => data.confirmPassword === data.password, {
        message: "confirmPassword notMatch Password", path: ["confirmPassword"]
    })
};
exports.getOtp = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.genralFields.email,
        newEmail: validation_middleware_1.genralFields.email.optional(),
        type: zod_1.z.string(),
    })
};
exports.verfiyOtp = {
    body: exports.getOtp.body.extend({
        otp: validation_middleware_1.genralFields.otp,
        newEmailOtp: validation_middleware_1.genralFields.otp.optional()
    })
};
exports.signupWithGmail = {
    body: zod_1.z.strictObject({
        idToken: zod_1.z.string()
    })
};
exports.forgetPassword = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.genralFields.email,
        newPassword: validation_middleware_1.genralFields.password,
        confirmNewPassword: zod_1.z.string()
    }).refine((data) => data.confirmNewPassword === data.newPassword, {
        message: "confirmNewPassword notMatch newPassword", path: ["confirmNewPassword"]
    })
};
exports.twoFactorAuthenticationLogin = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.genralFields.email,
        otp: validation_middleware_1.genralFields.otp,
    })
};
exports.twoFactorAuthentication = {
    body: exports.twoFactorAuthenticationLogin.body.extend({
        type: zod_1.z.string(),
    })
};
