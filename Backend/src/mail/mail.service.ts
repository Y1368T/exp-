import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Task } from "src/tasks/tasks.model";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: parseInt(process.env.MAILTRAP_PORT),
      auth: {
        user: process.env.MAILTRAP_AUTH_USER,
        pass: process.env.MAILTRAP_AUTH_PASS,
      },
    });
  }

  async sendTaskReminder(userEmail: string, task: Task): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME, // sender address
      to: userEmail, // list of receivers
      subject: "Task Due Today", // Subject line
      html: `<p>You have a task due today: ${task.title}</p>`, // html body
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Message sent: %s", info.messageId);
    } catch (error) {
      console.error("Error occurred while sending email: ", error);
    }
  }

  async sendEmail(mailOptions: object): Promise<void> {
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Message sent: %s", info.messageId);
    } catch (error) {
      console.error("Error occurred while sending email: ", error);
    }
  }
}
