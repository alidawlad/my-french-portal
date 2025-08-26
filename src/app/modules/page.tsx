
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Layers, PlusCircle, BookMarked, Mic2 } from 'lucide-react';
import { getRuleBookWords } from '@/app/actions';

type Module = {
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
    tags: string[];
};

export default async function ModulesPage() {
    const savedWords = await getRuleBookWords();

    const staticModules: Module[] = [
        {
            title: "Pronunciation",
            description: "The original Ali-Respell workbench for phonetic analysis.",
            href: "/modules/pronunciation",
            icon: <Mic2 className="w-6 h-6 text-primary" />,
            tags: ["core", "phonetics"]
        },
    ];

    const dynamicModules = new Map<string, Module>();

    savedWords.forEach(word => {
        const weekTag = word.tags.find(t => t.startsWith('week:'));
        const classTag = word.tags.find(t => t.startsWith('class:'));

        if (weekTag && classTag) {
            const week = weekTag.split(':')[1];
            const classNum = classTag.split(':')[1];
            const key = `week-${week}/class-${classNum}`;
            
            if (!dynamicModules.has(key)) {
                dynamicModules.set(key, {
                    title: `Week ${week} / Class ${classNum}`,
                    description: `Workbench for Week ${week}, Class ${classNum}.`,
                    href: `/modules/week-${week}/class-${classNum}`,
                    icon: <BookMarked className="w-6 h-6 text-primary" />,
                    tags: [`week:${week}`, `class:${classNum}`]
                });
            }
        }
    });

    const allModules = [...staticModules, ...Array.from(dynamicModules.values())];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold font-headline mb-1 flex items-center gap-2">
                        <Layers className="w-8 h-8 text-primary" />
                        Modules
                    </h1>
                    <p className="text-muted-foreground">Manage your learning modules or create a new one.</p>
                </div>
                <Link href="/modules/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Module
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allModules.map(module => (
                    <Link href={module.href} key={module.title} className="block hover:translate-y-[-2px] transition-transform">
                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    {module.icon}
                                    <div>
                                        <CardTitle className="font-headline text-lg">{module.title}</CardTitle>
                                        <CardDescription className="mt-1">{module.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow flex items-end">
                                <div className="flex flex-wrap gap-1">
                                    {module.tags.map(tag => (
                                        <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
