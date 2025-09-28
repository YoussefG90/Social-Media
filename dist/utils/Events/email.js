"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const events_1 = require("events");
const send_email_1 = require("../Email/send.email");
const email_template_1 = require("../Email/designs/email.template");
const rest_password_1 = require("../Email/designs/rest.password");
const TaggedinPost_1 = require("../Email/designs/TaggedinPost");
const TwoFactorAuthentication_1 = require("../Email/designs/TwoFactorAuthentication");
const ChangeRole_1 = require("../Email/designs/ChangeRole");
exports.emailEvent = new events_1.EventEmitter();
const safeSendEmail = async (to, subject, html) => {
    try {
        await (0, send_email_1.sendEmail)({ to, subject, html });
    }
    catch (error) {
        console.error(`Fail To Send OTP TO ${to}`, error);
    }
};
exports.emailEvent.on("Confirm Email", async (data) => {
    await safeSendEmail(data.to, data.subject || "Confirm Email", (0, email_template_1.emailTemplate)({ otp: data.otp }));
});
exports.emailEvent.on("Reset Password", async (data) => {
    await safeSendEmail(data.to, "Reset Password", (0, rest_password_1.restTemplate)({ otp: data.otp }));
});
exports.emailEvent.on("Tagged in Post", async (data) => {
    await safeSendEmail(data.to, "Tagged in Post", (0, TaggedinPost_1.taggedTemplate)({ otp: data.otp }));
});
exports.emailEvent.on("Role Changed", async (data) => {
    await safeSendEmail(data.to, "Role Changed", (0, ChangeRole_1.changeRoleTemplate)({ otp: data.otp }));
});
exports.emailEvent.on("Two Factor Authentication", async (data) => {
    await safeSendEmail(data.to, "Two Factor Authentication", (0, TwoFactorAuthentication_1.twoFactorAuthenticationTemplate)({ otp: data.otp }));
});
