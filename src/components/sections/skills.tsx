'use client';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2, Palette, LineChart, TerminalSquare } from 'lucide-react';

const icons: { [key: string]: React.ElementType } = {
  development: Code2,
  design: Palette,
  marketing: LineChart,
  tools: TerminalSquare,
};

export default function Skills() {
  const { t } = useLanguage();

  return (
    <section id="skills" className="w-full py-16 md:py-24">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12 font-headline">{t.skills.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(t.skills.categories).map(([key, category]) => {
            const Icon = icons[key];
            return (
              <Card key={category.title} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="mt-4">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap justify-center gap-2">
                    {category.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
