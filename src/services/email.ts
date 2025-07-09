
'use server';
import nodemailer from 'nodemailer';

const smtpConfig = {
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'no-reply@oftern.com',
        pass: 'Oftern.89',
    },
};

interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    attachments?: {
        filename: string;
        path: string; // URL to the file
    }[];
}

/**
 * Sends an email using Nodemailer. Logging is handled on the client-side.
 */
export async function sendEmail({ to, subject, html, attachments }: EmailOptions): Promise<{ success: boolean; message: string }> {
    const transporter = nodemailer.createTransport(smtpConfig);
    
    try {
        await transporter.verify(); // Verify connection configuration
        await transporter.sendMail({
            from: `"Mojib Rsm" <${smtpConfig.auth.user}>`,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments,
        });
        return { success: true, message: 'Email sent successfully!' };
    } catch (error: any) {
        console.error('Failed to send email:', error);
        return { success: false, message: `Failed to send email: ${error.message}` };
    }
}
