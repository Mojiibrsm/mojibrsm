
'use server';
import nodemailer from 'nodemailer';

// IMPORTANT: Replace with your actual SMTP credentials in environment variables
const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
};

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Sends an email using Nodemailer.
 * NOTE: This is a simulated function by default. To make it work, you need to:
 * 1. Set up your SMTP credentials in a .env.local file (e.g., SMTP_HOST, SMTP_USER).
 * 2. Uncomment the transporter and mail sending logic below.
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<{ success: boolean; message: string }> {
    console.log(`--- SIMULATING EMAIL (to enable, edit src/services/email.ts) ---`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`----------------------------------------------------------------`);
    
    // In a real application, you would uncomment and use the following code:
    /*
    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
        console.error('SMTP configuration is incomplete. Email not sent.');
        return { success: false, message: 'SMTP configuration is missing on the server.' };
    }

    const transporter = nodemailer.createTransport(smtpConfig);

    try {
        await transporter.sendMail({
            from: `"Your App Name" <${process.env.SMTP_FROM_EMAIL}>`, // Use a verified sender email
            to: to,
            subject: subject,
            html: html,
        });
        return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, message: 'Failed to send email via SMTP.' };
    }
    */
    
    return { success: true, message: 'Email sent successfully (Simulated).' };
}
