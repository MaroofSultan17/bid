import nodemailer from 'nodemailer';
import pino from 'pino';

const logger = pino({ name: 'mailer' });

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 587,
    secure: process.env.MAIL_ENCRYPTION === 'ssl',
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});

export async function sendEmail(to: string, subject: string, html: string) {
    try {
        await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME || 'TaskBid'}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to,
            subject,
            html,
        });
        logger.info(`Email sent to ${to}`);
    } catch (err) {
        logger.error({ err }, `Failed to send email to ${to}`);
        throw err;
    }
}

export async function sendTestEmail(to: string) {
    return sendEmail(to, 'Test Email', '<h1>Test</h1><p>Working!</p>');
}
