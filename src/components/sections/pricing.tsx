'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useContent } from '@/hooks/use-content';
import { useLanguage } from '@/contexts/language-context';

export default function Pricing() {
    const { allContent } = useContent();
    const { language } = useLanguage();
    const t = allContent[language]?.pricing;
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    };

    if (!t) return null;

    const whatsappNumber = (t.whatsappPhoneNumber || '').replace(/[^0-9]/g, '');

    return (
        <section id="pricing" className="w-full py-16 md:py-24 bg-card" suppressHydrationWarning>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold font-headline">{t.title}</h2>
                    <div className="mt-4 h-1.5 w-24 bg-gradient-to-r from-primary via-accent to-secondary mx-auto rounded-full"></div>
                    <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{t.description}</p>
                </motion.div>
                <motion.div
                    ref={ref}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                >
                    {t.packages.map((pkg, index) => {
                        const message = encodeURIComponent(t.whatsappMessage.replace('{packageName}', pkg.name));
                        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

                        return (
                            <motion.div key={index} variants={itemVariants} className="relative group h-full">
                                 <div className={`absolute -inset-0.5 bg-gradient-to-r ${pkg.popular ? 'from-accent to-primary' : 'from-secondary to-primary/50'} rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt`}></div>
                                <Card className="relative overflow-hidden shadow-lg transition-all duration-300 rounded-2xl flex flex-col h-full">
                                    <CardHeader className="text-center p-6">
                                        {pkg.popular && <div className="absolute top-0 right-0 m-4"><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-accent text-accent-foreground">{t.popular}</span></div>}
                                        <CardTitle className="text-2xl font-bold font-headline">{pkg.name}</CardTitle>
                                        <CardDescription className="text-4xl font-bold text-primary mt-2">{pkg.price}</CardDescription>
                                        <p className="text-sm text-muted-foreground">{pkg.billing}</p>
                                    </CardHeader>
                                    <CardContent className="flex-grow p-6">
                                        <ul className="space-y-4">
                                            {pkg.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3">
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                    <span className="text-muted-foreground">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter className="p-6">
                                        <Button asChild className="w-full" variant={pkg.popular ? 'default' : 'secondary'}>
                                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">{t.buttonText}</a>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
