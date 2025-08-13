'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useContent } from '@/hooks/use-content';
import { useLanguage } from '@/contexts/language-context';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.451-4.437-9.887-9.888-9.887-5.452 0-9.888 4.436-9.889 9.888.001 2.245.654 4.279 1.86 5.995l-1.17 4.249 4.359-1.14z"/>
    </svg>
);


export default function WhatsAppWidget() {
    const { allContent } = useContent();
    const { language } = useLanguage();
    const t = allContent[language]?.whatsapp;
    const contactDetails = allContent[language]?.contact?.details;
    
    if (!t || !contactDetails?.phone) {
        return null;
    }

    const phoneNumber = contactDetails.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(t.defaultMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed bottom-5 right-5 z-50"
        >
            <Button
                asChild
                size="icon"
                className="h-16 w-16 rounded-full shadow-lg bg-[#25D366] hover:bg-[#128C7E] text-white"
                aria-label="Chat on WhatsApp"
            >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon className="h-8 w-8" />
                </a>
            </Button>
        </motion.div>
    );
}
