import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASS } from '../config/config.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: EMAIL_USER,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
}; 