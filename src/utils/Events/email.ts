import { EventEmitter } from "events";
import { sendEmail } from "../Email/send.email";
import { emailTemplate } from "../Email/designs/email.template";
import { restTemplate } from "../Email/designs/rest.password"

export const emailEvent = new EventEmitter();

interface EmailEventData {
  to: string;
  otp: string;
  subject?: string;
}

const safeSendEmail = async (to: string, subject: string, html: string) => {
  try {
    await sendEmail({ to, subject, html });
  } catch (error) {
    console.error(`Fail To Send OTP TO ${to}`, error);
  }
};

emailEvent.on("Confirm Email", async (data: EmailEventData) => {
  await safeSendEmail(
    data.to,
    data.subject || "Confirm Email",
    emailTemplate({ otp: data.otp })
  );
});

emailEvent.on("Reset Password", async (data: EmailEventData) => {
  await safeSendEmail(
    data.to,
    "Reset Password",
    restTemplate({ otp: data.otp })
  );
});
