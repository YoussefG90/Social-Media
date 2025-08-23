"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const events_1 = require("events");
const send_email_1 = require("../Email/send.email");
const email_template_1 = require("../Email/designs/email.template");
const rest_password_1 = require("../Email/designs/rest.password");
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
