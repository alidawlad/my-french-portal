
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Layers, PlusCircle, BookHead, Mic2 } from 'lucide-react';

const modules = [
    {
        title: "Pronunciation",
        description: "The original Ali-Respell workbench for phonetic analysis.",
        href: "/modules/pronunciation",
        icon: <Mic2 className="w-6 h-6 text-primary" />,
        tags: ["core", "phonetics"]
    },
    {
        title: "Week 1 / Class 1",
        description: "Basics of greetings and articles.",
        href: "/modules/week-1/class-1",
        icon: <BookHead className="w-6 h-6 text-primary" />,
        tags: ["week:1", "class:1", "grammar"]
    }
]

export default function ModulesPage() {
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
            {modules.map(module => (
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
