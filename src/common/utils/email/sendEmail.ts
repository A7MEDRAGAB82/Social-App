import nodemailer from 'nodemailer';
import { env } from '../../../config/env.service';
import { ISendEmailArgs } from '../../interfaces';

const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: env.emailUser,
            pass: env.emailPassword,
        },
    });

export const sendEmail = async ({ to, subject, text , html }: ISendEmailArgs) => {
  try {
    
    const mailOptions = {
        from: env.emailUser,
        to,
        subject,
        text,
        html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return info;

    
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    throw error;
  }
};

