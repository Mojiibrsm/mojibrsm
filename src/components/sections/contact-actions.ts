'use server';

import { z } from 'zod';
import { createMessageThread, IMessage, addMessageToThread, getMessageThreads } from '@/services/data';
import { sendEmail } from '@/services/email';
import { translations } from '@/lib/translations';

const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

type ContactFormValues = z.infer<typeof ContactFormSchema>;

type ContactFormState = {
  message: string;
  status: 'success' | 'error';
};

export async function submitContactForm(
  data: ContactFormValues
): Promise<ContactFormState> {
  const validatedFields = ContactFormSchema.safeParse(data);

  if (!validatedFields.success) {
    // This case should not be hit if client-side validation is working,
    // but it's good for robustness.
    return {
      status: 'error',
      message: 'Invalid form data provided.',
    };
  }
  
  const { name, email, subject, message } = validatedFields.data;

  try {
    const threads = getMessageThreads();
    let thread = threads.find(t => t.clientEmail === email && t.subject === subject);

    const newMessage: IMessage = {
      from: 'client',
      text: message,
      timestamp: new Date().toISOString(),
    };

    if (thread && thread.id) {
      // Add to existing thread
      addMessageToThread(thread.id, newMessage, 'client');
    } else {
      // Create new thread
      createMessageThread({
        userId: `contact-${email}`, // Create a unique ID for non-logged-in users
        clientName: name,
        clientEmail: email,
        clientAvatar: `https://placehold.co/100x100.png?text=${name.charAt(0)}`,
        clientPhone: '',
        subject: subject,
        unreadByAdmin: true,
        unreadByUser: false, // User can't see this in a dashboard unless they sign up
      }, newMessage);
    }
    
    // Optional: Send email notification to admin
    const t = translations.en; // Use english for admin notification
    const adminEmail = t.contact.details.email;
    await sendEmail({
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

    return { status: 'success', message: 'Your message has been sent successfully!' };
  } catch (error) {
    console.error('Contact form submission error:', error);
    return { status: 'error', message: 'Something went wrong. Please try again later.' };
  }
}
