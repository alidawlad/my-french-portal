
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

function TutorModuleCreator() {
    const [week, setWeek] = useState('1');
    const [classNum, setClassNum] = useState('1');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/modules/week-${week}/class-${classNum}`);
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="week">Week Number</Label>
                        <Select value={week} onValueChange={setWeek}>
                            <SelectTrigger id="week">
                                <SelectValue placeholder="Select week" />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(12)].map((_, i) => (
                                    <SelectItem key={i + 1} value={`${i + 1}`}>Week {i + 1}</SelectItem>
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
                                    <SelectItem key={i + 1} value={`${i + 1}`}>Class {i + 1}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit">Create Tutor Workbench</Button>
            </CardFooter>
        </form>
    );
}

function SpeakModuleCreator() {
    const [part, setPart] = useState('1');
    const [unit, setUnit] = useState('1');
    const [lesson, setLesson] = useState('speaking-drill');
    const router = useRouter();

    const lessonTypes = [
        { value: 'speaking-drill', label: 'Speaking Drill' },
        { value: 'teacher-qa', label: 'Teacher Q&A' },
        { value: 'vocab-builder', label: 'Vocab Builder' },
        { value: 'video-lesson', label: 'Video Lesson' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/modules/part-${part}/unit-${unit}/lesson-${lesson}`);
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="part">Part</Label>
                        <Select value={part} onValueChange={setPart}>
                            <SelectTrigger id="part">
                                <SelectValue placeholder="Select part" />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(4)].map((_, i) => (
                                    <SelectItem key={i + 1} value={`${i + 1}`}>Part {i + 1}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Select value={unit} onValueChange={setUnit}>
                            <SelectTrigger id="unit">
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(4)].map((_, i) => (
                                    <SelectItem key={i + 1} value={`${i + 1}`}>Unit {i + 1}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lesson">Lesson Type</Label>
                        <Select value={lesson} onValueChange={setLesson}>
                            <SelectTrigger id="lesson">
                                <SelectValue placeholder="Select lesson type" />
                            </SelectTrigger>
                            <SelectContent>
                                {lessonTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit">Create Speak App Workbench</Button>
            </CardFooter>
        </form>
    );
}

export default function NewModulePage() {
    return (
        <div className="max-w-3xl mx-auto">
            <Link href="/modules" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Modules
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Create New Module</CardTitle>
                    <CardDescription>
                        Define the structure for this learning module. A new workbench will be created based on your selection.
                    </CardDescription>
                </CardHeader>
                <Tabs defaultValue="tutor" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="tutor">Tutor Session (Week/Class)</TabsTrigger>
                        <TabsTrigger value="speak-app">Speak App (Unit/Lesson)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tutor">
                        <TutorModuleCreator />
                    </TabsContent>
                    <TabsContent value="speak-app">
                        <SpeakModuleCreator />
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}
