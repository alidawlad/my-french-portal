
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewModulePage() {
    const [week, setWeek] = useState('1');
    const [classNum, setClassNum] = useState('1');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!week || !classNum) {
            // In a real app, you'd show a toast or error message.
            return;
        }
        router.push(`/modules/week-${week}/class-${classNum}`);
    };

    return (
        <div className="max-w-xl mx-auto">
             <Link href="/modules" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Modules
            </Link>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Create New Module</CardTitle>
                        <CardDescription>
                            Define the week and class for this learning module. A new workbench will be created.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="week">Week Number</Label>
                                 <Select value={week} onValueChange={setWeek}>
                                    <SelectTrigger id="week">
                                        <SelectValue placeholder="Select week" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[...Array(12)].map((_, i) => (
                                            <SelectItem key={i+1} value={`${i+1}`}>Week {i+1}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="class">Class Number</Label>
                                 <Select value={classNum} onValueChange={setClassNum}>
                                    <SelectTrigger id="class">
                                        <SelectValue placeholder="Select class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[...Array(5)].map((_, i) => (
                                            <SelectItem key={i+1} value={`${i+1}`}>Class {i+1}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Create Module and Go to Workbench</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
