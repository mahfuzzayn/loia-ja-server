import nodemailer from "nodemailer";
import config from "../config";
import * as path from "path";
import * as fs from "fs";
import Handlebars from "handlebars";
const Util = require("util");
const ReadFile = Util.promisify(fs.readFile);

const sendEmail = async (
    email: string,
    html: string,
    subject: string,
    attachment?: { filename: string; content: Buffer; encoding: string }
) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: config.sender_email,
                pass: config.sender_app_password,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        const mailOptions: any = {
            from: '"Loia Ja" <support@loiaja.com>',
            to: email,
            subject,
            html,
        };

        if (attachment) {
            mailOptions.attachments = [
                {
                    filename: attachment.filename,
                    content: attachment.content,
                    encoding: attachment.encoding,
                },
            ];
        }

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        throw new Error("Failed to send email");
    }
};

const createEmailContent = async (data: object, templateType: string) => {
    try {
        const templatePath = path.join(
            process.cwd(),
            `/src/templates/${templateType}.template.hbs`
        );
        const content = await ReadFile(templatePath, "utf8");

        const template = Handlebars.compile(content);

        return template(data);
    } catch (error) {
        console.log("Error creating email content: ", error);
        throw new Error("Failed to create email content");
    }
};

export const EmailHelper = {
    sendEmail,
    createEmailContent,
};
