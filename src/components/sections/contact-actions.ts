'use server';

import { z } from 'zod';
import { sendEmail } from '@/services/email';
import { translations } from '@/lib/translations';

const ContactFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

type ContactFormValues = z.infer<typeof ContactFormSchema>;

export async function sendAdminNotificationEmail(
  data: ContactFormValues
): Promise<{ success: boolean; message: string }> {
  const validatedFields = ContactFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data provided for email.',
    };
  }

  const { name, email, subject, message } = validatedFields.data;

  try {
    const t = translations.en; // Use english for admin notification
    const adminEmail = t.contact.details.email;
    
    // The sendEmail function already returns a promise with the desired object shape
    return await sendEmail({
      to: adminEmail,
      subject: `New Contact Form Message: ${subject}`,
      html: `
        <p>You have received a new message from the contact form on your website.</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Subject:</strong> ${subject}</li>
        </ul>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
      `
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return { success: false, message: 'Something went wrong while sending the email. Please try again later.' };
  }
}
