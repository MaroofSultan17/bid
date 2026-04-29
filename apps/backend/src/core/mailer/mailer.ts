import nodemailer from 'nodemailer';
import pino from 'pino';

const logger = pino({ name: 'mailer' });

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendMail = async (to: string, subject: string, text: string) => {
    try {
        const info = await transporter.sendMail({
            from: '"TaskBid" <noreply@taskbid.internal>',
            to,
            subject,
            text,
        });
        logger.info(`Message sent: ${info.messageId}`);
    } catch (error) {
        logger.error(error, 'Failed to send email');
    }
};
