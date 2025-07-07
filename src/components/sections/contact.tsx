'use client';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, Github, Facebook, Linkedin } from 'lucide-react';

export default function Contact() {
  const { t } = useLanguage();

  const socialLinks = [
    { icon: Github, href: "https://github.com/mojibrsm" },
    { icon: Facebook, href: "https://facebook.com/mojibrsm" },
    { icon: Linkedin, href: "https://linkedin.com/in/mojibrsm" },
  ];

  return (
    <section id="contact" className="w-full py-16 md:py-24 bg-card">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-headline">{t.contact.title}</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mt-4">{t.contact.description}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <form className="space-y-4">
              <Input type="text" placeholder={t.contact.form.name} />
              <Input type="email" placeholder={t.contact.form.email} />
              <Input type="text" placeholder={t.contact.form.subject} />
              <Textarea placeholder={t.contact.form.message} rows={5} />
              <Button type="submit" size="lg" className="w-full">{t.contact.form.submit}</Button>
            </form>
          </div>
          <div className="space-y-6">
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
                 <Button key={index} variant="outline" size="icon" asChild>
                    <a href={social.href} target="_blank" rel="noopener noreferrer">
                        <social.icon className="h-5 w-5" />
                    </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
