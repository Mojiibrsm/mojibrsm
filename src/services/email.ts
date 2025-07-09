
'use server';
import nodemailer from 'nodemailer';

// IMPORTANT: Replace with your actual SMTP credentials.
// For best security, use environment variables instead of hardcoding.
const smtpConfig = {
    host: 'YOUR_SMTP_HOST', // e.g., 'smtp.gmail.com'
    port: 587, // or 465 for SSL
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'YOUR_SMTP_USER', // your email address
        pass: 'YOUR_SMTP_PASSWORD', // your email password or app password
    },
};

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Sends an email using Nodemailer.
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<{ success: boolean; message: string }> {
    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass || smtpConfig.host === 'YOUR_SMTP_HOST') {
        const warning = 'SMTP configuration is incomplete. Email not sent.';
        console.error(warning);
        return { success: false, message: `${warning} (Check server logs)` };
    }

    const transporter = nodemailer.createTransport(smtpConfig);

    try {
        await transporter.sendMail({
            from: `"Your App Name" <YOUR_SENDER_EMAIL@example.com>`, // Use a verified sender email
            to: to,
            subject: subject,
            html: html,
        });
        return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, message: 'Failed to send email via SMTP. Check server logs for details.' };
    }
}
