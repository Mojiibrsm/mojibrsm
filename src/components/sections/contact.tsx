
'use client';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, Github, Facebook, Linkedin, Loader2 } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { handleContactFormSubmission } from './contact-actions';
import { createMessageThread, IMessage, addMessageToThread, getMessageThreads } from '@/services/data';

const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(10, "Message must be at least 10 characters long."),
});

type ContactFormValues = z.infer<typeof ContactFormSchema>;


export default function Contact() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      // Step 1: Handle data persistence on the client side using localStorage service
      const { name, email, phone, subject, message } = data;
      const threads = getMessageThreads();
      let thread = threads.find(t => t.clientEmail === email && t.type === 'contact');

      const newMessage: IMessage = {
        from: 'client',
        text: `Subject: ${subject}\n\n${message}`,
        timestamp: new Date().toISOString(),
      };

      if (thread && thread.id) {
        addMessageToThread(thread.id, newMessage, 'client');
      } else {
        createMessageThread({
          userId: `contact-${email}`,
          clientName: name,
          clientEmail: email,
          clientAvatar: 'https://i.postimg.cc/8P04g40T/man.png',
          clientPhone: phone || '',
          subject: subject,
          unreadByAdmin: true,
          unreadByUser: false,
        }, newMessage);
      }

      // Step 2: Call the server action to send emails
      const emailResult = await handleContactFormSubmission(data);
      
      if (!emailResult.success) {
        // If email fails, throw an error to be caught by the catch block
        throw new Error(emailResult.message);
      }

      // Step 3: Inform the user of success
      toast({
        title: "Message Sent!",
        description: "Your message has been sent successfully. We will get back to you shortly.",
      });
      form.reset();

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Submission Failed",
        description: error.message || "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const socialLinks = [
    { icon: Github, href: t.contact.details.socials.github },
    { icon: Facebook, href: t.contact.details.socials.facebook },
    { icon: Linkedin, href: t.contact.details.socials.linkedin },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="contact" className="w-full py-16 md:py-24 bg-card" suppressHydrationWarning>
      <motion.div
        ref={ref}
        className="container"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h2 className="text-4xl font-bold font-headline">{t.contact.title}</h2>
          <div className="mt-4 h-1.5 w-24 bg-gradient-to-r from-primary via-accent to-secondary mx-auto rounded-full"></div>
          <p className="max-w-2xl mx-auto text-muted-foreground mt-4">{t.contact.description}</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div variants={itemVariants}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder={t.contact.form.name} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="email" placeholder={t.contact.form.email} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                         <Input placeholder={t.contact.form.phone} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder={t.contact.form.subject} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder={t.contact.form.message} rows={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t.contact.form.submit}
                </Button>
              </form>
            </Form>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-6">
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <Mail className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <a href={`mailto:${t.contact.details.email}`} className="text-muted-foreground hover:text-primary">{t.contact.details.email}</a>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <Phone className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <a href={`tel:${t.contact.details.phone}`} className="text-muted-foreground hover:text-primary">{t.contact.details.phone}</a>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <MapPin className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p className="text-muted-foreground">{t.contact.details.location}</p>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-center md:justify-start gap-4 mt-6">
              {socialLinks.map((social, index) => (
                 social.href && <Button key={index} variant="outline" size="icon" asChild>
                    <a href={social.href} target="_blank" rel="noopener noreferrer">
                        <social.icon className="h-5 w-5" />
                    </a>
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
