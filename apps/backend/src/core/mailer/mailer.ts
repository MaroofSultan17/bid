import 'dotenv/config';
import nodemailer from 'nodemailer';
import pino from 'pino';

const logger = pino({ name: 'mailer' });

let transporter: nodemailer.Transporter | null = null;
let from = '';

function getTransporter() {
    if (transporter) return transporter;

    const host = process.env.MAIL_HOST;
    if (!host) {
        logger.error('MAIL_HOST not found in environment variables');
        return null;
    }

    transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.MAIL_PORT || '587', 10),
        secure: false,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    const fromAddress = process.env.MAIL_FROM_ADDRESS || 'noreply@taskbid.internal';
    const fromName = process.env.MAIL_FROM_NAME || 'TaskBid';
    from = `"${fromName}" <${fromAddress}>`;

    return transporter;
}

export async function sendOutbidEmail(
    to: string,
    taskTitle: string,
    newLowestBid: number
): Promise<void> {
    const t = getTransporter();
    if (!t) return;
    try {
        await t.sendMail({
            from,
            to,
            subject: `You have been outbid on "${taskTitle}"`,
            text: `A new bid of ${newLowestBid} hours has been placed on "${taskTitle}", which is lower than your bid. You may want to place a new bid.`,
        });
        logger.info({ to, taskTitle }, 'Outbid email sent');
    } catch (err) {
        logger.error({ err, to }, 'Failed to send outbid email');
    }
}

export async function sendAssignmentEmail(
    to: string,
    taskTitle: string,
    hoursCommitted: number,
    won: boolean
): Promise<void> {
    const t = getTransporter();
    if (!t) return;
    try {
        const subject = won
            ? `You won the bid for "${taskTitle}"`
            : `Task "${taskTitle}" has been assigned to another bidder`;
        const text = won
            ? `Congratulations! You have been assigned "${taskTitle}" for ${hoursCommitted} hours.`
            : `The task "${taskTitle}" has been assigned to another bidder who offered ${hoursCommitted} hours.`;
        await t.sendMail({ from, to, subject, text });
        logger.info({ to, taskTitle, won }, 'Assignment email sent');
    } catch (err) {
        logger.error({ err, to }, 'Failed to send assignment email');
    }
}

export async function sendTestEmail(to: string): Promise<void> {
    const t = getTransporter();
    if (!t) {
        logger.error('Transporter not initialized. Check your environment variables.');
        return;
    }
    try {
        await t.sendMail({
            from,
            to,
            subject: 'TaskBid SMTP Test',
            text: 'This is a test email from your TaskBid application. If you see this, SMTP is working perfectly!',
        });
        logger.info({ to }, 'Test email sent successfully');
    } catch (err: any) {
        logger.error({ err: err.message, to }, 'Failed to send test email');
        throw err;
    }
}
