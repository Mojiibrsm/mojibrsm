'use client';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '../ui/textarea';
import { Github, Linkedin, Twitter, Send } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer id="contact" className="w-full py-16 md:py-24 bg-card border-t">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12">
            <div>
                <h2 className="text-3xl font-bold mb-4 font-headline">{t.footer.tagline}</h2>
                <p className="text-muted-foreground mb-8 max-w-lg">
                    Have a project in mind or just want to say hi? Feel free to send me a message. I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
                </p>
                <div className="flex space-x-4">
                    <Button variant="outline" size="icon" asChild>
                        <a href="#" aria-label="Github"><Github /></a>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                        <a href="#" aria-label="LinkedIn"><Linkedin /></a>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                        <a href="#" aria-label="Twitter"><Twitter /></a>
                    </Button>
                </div>
            </div>
            <form className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input placeholder="Your Name" />
                    <Input type="email" placeholder="Your Email" />
                </div>
                <Input placeholder="Subject" />
                <Textarea placeholder="Your Message" rows={5} />
                <Button type="submit" className="w-full md:w-auto">
                    <Send className="mr-2 h-4 w-4"/>
                    Send Message
                </Button>
            </form>
        </div>
        <div className="text-center text-sm text-muted-foreground mt-16 pt-8 border-t">
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
