import nodemailer from "nodemailer";

export class MailService {
  transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    console.log("START SEND");

    const info = await this.transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      html,
    });

    console.log("MAIL SENT");

    console.log(info);
  }
}
