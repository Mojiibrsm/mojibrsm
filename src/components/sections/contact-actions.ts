
'use server';

import { z } from 'zod';
import { sendEmail } from '@/services/email';
import { translations } from '@/lib/translations';

// --- Zod Schema ---
const ContactFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

type ContactFormValues = z.infer<typeof ContactFormSchema>;

// --- Email HTML Generators ---
const generateAdminNotificationHtml = (data: ContactFormValues): string => {
  const { name, email, phone, subject, message } = data;
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #6366f1; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">New Contact Form Submission</h2>
      </div>
      <div style="padding: 20px;">
        <p>You have received a new message from your website's contact form.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <ul style="list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;"><strong>Name:</strong> ${name}</li>
          <li style="margin-bottom: 10px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #6366f1;">${email}</a></li>
          ${phone ? `<li style="margin-bottom: 10px;"><strong>Phone:</strong> <a href="tel:${phone}" style="color: #6366f1;">${phone}</a></li>` : ''}
          <li style="margin-bottom: 10px;"><strong>Subject:</strong> ${subject}</li>
        </ul>
        <h3 style="margin-top: 20px; color: #6366f1; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px;">Message:</h3>
        <div style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin-top: 10px;">
          <p style="margin: 0; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
       <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #888;">
        This email was sent from your portfolio website's contact form.
      </div>
    </div>
  `;
};

const generateUserConfirmationHtml = (data: ContactFormValues): string => {
  const { name, message } = data;
  const t = translations.en; // Use english for consistency in user confirmation
  const { name: devName, title: devTitle } = t.hero;
  const { phone: devPhone, email: devEmail } = t.contact.details;
  const siteUrl = t.site.url;

  return `
    <div style="background-color: #f4f4f7; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(to right, #6366f1, #a855f7); color: #ffffff; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Thank You, ${name}!</h1>
        </div>
        <div style="padding: 24px; line-height: 1.6; font-size: 16px;">
            <p>We have successfully received your message and will get back to you as soon as possible.</p>
            <div style="margin-top: 25px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Here's a copy of your message:</p>
                <blockquote style="margin: 0; padding-left: 15px; border-left: 3px solid #6366f1; color: #555555; font-style: italic;">
                  ${message.replace(/\n/g, '<br>')}
                </blockquote>
            </div>
            <p style="margin-top: 25px;">In the meantime, feel free to connect with me on social media or browse my portfolio.</p>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <h3 style="margin: 0 0 5px 0; font-size: 20px; font-weight: bold;">${devName}</h3>
            <p style="margin: 0 0 15px 0; color: #555555; font-size: 14px;">${devTitle}</p>
            <div style="margin-top: 15px;">
              <a href="${siteUrl}" style="display: inline-block; background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; font-size: 14px; font-weight: bold;">Visit Website</a>
              <a href="mailto:${devEmail}" style="display: inline-block; background-color: #555; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; font-size: 14px; font-weight: bold;">Email Me</a>
            </div>
        </div>
      </div>
    </div>
  `;
}


// --- Main Server Action ---
export async function handleContactFormSubmission(
  data: ContactFormValues
): Promise<{ success: boolean; message: string }> {
  const validatedFields = ContactFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid form data provided.' };
  }

  const { email, subject } = validatedFields.data;
  const adminEmail = translations.en.contact.details.email;

  try {
    // Send both emails in parallel
    const [adminEmailResult, userEmailResult] = await Promise.all([
      sendEmail({
        to: adminEmail,
        subject: `New Contact Form Message: ${subject}`,
        html: generateAdminNotificationHtml(validatedFields.data),
      }),
      sendEmail({
        to: email,
        subject: `We've received your message - ${translations.en.site.title}`,
        html: generateUserConfirmationHtml(validatedFields.data),
      }),
    ]);
    
    // The main success is contingent on the admin receiving the email.
    // The user confirmation is a secondary bonus.
    if (adminEmailResult.success) {
      return { success: true, message: "Message sent successfully!" };
    } else {
      // If admin email fails, it's a critical failure.
      throw new Error(adminEmailResult.message);
    }

  } catch (error) {
    console.error('Contact form submission error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong.';
    return { success: false, message: errorMessage };
  }
}

    