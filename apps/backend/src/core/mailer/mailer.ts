import nodemailer from 'nodemailer';
import pino from 'pino';

const logger = pino({ name: 'mailer' });

const host = process.env.MAIL_HOST;

const transporter = host
    ? nodemailer.createTransport({
          host,
          port: parseInt(process.env.MAIL_PORT || '587', 10),
          secure: false, // Use false for 587 (STARTTLS)
          auth: {
              user: process.env.MAIL_USERNAME,
              pass: process.env.MAIL_PASSWORD,
          },
      })
    : null;

const from = process.env.MAIL_FROM_ADDRESS || '"TaskBid" <noreply@taskbid.internal>';

export async function sendOutbidEmail(
    to: string,
    taskTitle: string,
    newLowestBid: number
): Promise<void> {
    if (!transporter) return;
    try {
        await transporter.sendMail({
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
    if (!transporter) return;
    try {
        const subject = won
            ? `You won the bid for "${taskTitle}"`
            : `Task "${taskTitle}" has been assigned to another bidder`;
        const text = won
            ? `Congratulations! You have been assigned "${taskTitle}" for ${hoursCommitted} hours.`
            : `The task "${taskTitle}" has been assigned to another bidder who offered ${hoursCommitted} hours.`;
        await transporter.sendMail({ from, to, subject, text });
        logger.info({ to, taskTitle, won }, 'Assignment email sent');
    } catch (err) {
        logger.error({ err, to }, 'Failed to send assignment email');
    }
}
