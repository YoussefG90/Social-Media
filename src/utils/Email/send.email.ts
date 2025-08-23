import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import path from "path";
import { AttachmentLike } from "nodemailer/lib/mailer";

dotenv.config({ path: path.join("./src/config/.env"), quiet: true });

interface SendEmailOptions {
  from?: string;
  to: string;
  cc?: string;
  bcc?: string;
  text?: string;
  html?: string;
  subject?: string;
  attachments?: AttachmentLike[];
}

export async function sendEmail({
  from = process.env.EMAIL_USER,
  to,
  cc,
  bcc,
  text,
  html,
  subject = "Confirm Your Account",
  attachments = [],
}: SendEmailOptions) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"Social Media" <${from}>`,
    to,
    cc,
    bcc,
    text,
    html,
    subject,
    attachments,
  });

  return info;
}
