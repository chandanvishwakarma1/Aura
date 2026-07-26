import nodemailer from 'nodemailer'
import 'dotenv/config'

//Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (subject, to, html) => {

    //define email message
    const mailOptions = {
        from: `"Aura" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    }

    //use transporter to send mail
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to", to, info.messageId);
        return info;
    } catch (error) {
        console.log("Error sending email:", error);
        throw error;
    }
}